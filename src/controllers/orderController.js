const supabase = require('../config/supabase');
const pool = require('../config/database'); // for raw SQL
const axios = require('axios');

const JAP_API_URL = process.env.JAP_API_URL;
const JAP_API_KEY = process.env.JAP_API_KEY;

const MAX_RETRIES = parseInt(process.env.MAX_RESUBMIT_RETRIES || "4", 10);

// 🔹 User places an order
exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const {
    service,          // ✅ provider service ID
    service_name,
    link,
    quantity,
    price_usd,
    price_converted,
    currency,
    type,
    category
  } = req.body;

  if (!service || !link || !quantity) {
    return res.status(400).json({ error: 'Service, link, and quantity are required' });
  }

  try {
    // 1. Get service list from JAP to find rate
    const japResponse = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: 'services'
    });

    const serviceData = japResponse.data.find(s => String(s.service) === String(service));
    if (!serviceData) {
      return res.status(404).json({ error: 'Service not found in JAP' });
    }

    const totalPriceUSD = (parseFloat(serviceData.rate) / 1000) * parseInt(quantity);

    // 2. Check wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet || parseFloat(wallet.balance) < totalPriceUSD) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // 3. Place order on JAP
    let apiOrderId = null;
    let status = 'processing';
    try {
      const orderResponse = await axios.post(JAP_API_URL, {
        key: JAP_API_KEY,
        action: 'add',
        service,
        link,
        quantity
      });

      if (!orderResponse.data.order) throw new Error('No order ID returned from JAP');
      apiOrderId = orderResponse.data.order;
    } catch (apiErr) {
      console.warn('⚠️ JAP API failed, queueing order');
      status = 'queued';
    }

    // 4. Insert order record
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        service,
        service_name: service_name || serviceData.name,
        link,
        quantity: parseInt(quantity),
        price_usd: parseFloat(price_usd) || totalPriceUSD,
        price_converted: parseFloat(price_converted) || totalPriceUSD,
        currency: currency || 'USD',
        type: type || serviceData.type || 'N/A',
        category: category || serviceData.category || 'N/A',
        status,
        external_order_id: apiOrderId,
        progress: 0,
        resubmit_attempts: 0
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // 5. Deduct balance immediately if order is active
    if (status === 'processing') {
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - totalPriceUSD })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    }

    return res.status(201).json({
      message: status === 'queued'
        ? 'Order queued. We will retry shortly.'
        : 'Order placed successfully and balance deducted.',
      status,
      cost: totalPriceUSD,
      order_id: newOrder.id,
      external_order_id: apiOrderId || null
    });

  } catch (err) {
    console.error('Order creation failed:', err.message);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

// 🔍 User checks order status
exports.checkOrderStatus = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('external_order_id, user_id')
      .eq('id', orderId)
      .single();

    if (error || !order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== userId) return res.status(403).json({ error: 'Unauthorized access' });

    // Call JAP to get status
    const statusResponse = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: 'status',
      order: order.external_order_id
    });

    res.json(statusResponse.data);

  } catch (err) {
    console.error('Status check failed:', err.message);
    res.status(500).json({ error: 'Could not fetch order status' });
  }
};

// 🛠 Admin - View all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(username)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ orders: data });
  } catch (err) {
    console.error('Fetch orders failed:', err.message);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

// 💰 User total spending
exports.getTotalSpent = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(price_usd), 0) AS total_spent
       FROM orders
       WHERE user_id = $1`,
      [userId]
    );

    res.json({ total_spent: parseFloat(rows[0].total_spent) });
  } catch (err) {
    console.error('Total spending fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch total spending' });
  }
};

// 🔁 Admin - Resubmit failed/queued order
exports.resubmitOrder = async (req, res) => {
  // TODO: implement retry with JAP
};

// 💸 Manual refund
exports.refundOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be refunded' });
    }

    // Refund balance
    await pool.query(
      `SELECT refund_order_balance($1, $2)`,
      [userId, order.price_usd]
    );

    await pool.query(`DELETE FROM orders WHERE id = $1`, [id]);

    res.json({ message: 'Order refunded and removed', refundedAmount: order.price_usd });
  } catch (err) {
    console.error('Refund error:', err.message);
    res.status(500).json({ error: 'Could not process refund' });
  }
};

// ❌ Delete order
exports.deleteOrder = async (req, res) => {
  const { order_id } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [order_id, userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.status === 'pending') {
      await pool.query(`SELECT refund_order_balance($1, $2)`, [userId, order.price_usd]);
    }

    await pool.query(`DELETE FROM orders WHERE id = $1`, [order_id]);

    res.json({ message: 'Order deleted successfully', refunded: order.status === 'pending' });
  } catch (err) {
    console.error('Delete order error:', err.message);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
