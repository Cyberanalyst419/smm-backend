const supabase = require('../config/supabase');
const { placeOrder, getOrderStatus } = require('../services/apiClient');

// 🔹 User places an order
exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const {
    service_id,
    service_name,
    link,
    quantity,
    price_usd,
    price_converted,
    currency,
    speed,
    guarantee
  } = req.body;

  if (!service_id || !link || !quantity) {
    return res.status(400).json({ error: 'Service, link, and quantity are required' });
  }

  try {
    // 1. Fetch service price to verify
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('price')
      .eq('id', service_id)
      .single();

    if (serviceError || !service) return res.status(404).json({ error: 'Service not found' });

    const totalPriceUSD = parseFloat(service.price) * parseInt(quantity);

    // 2. Check wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet || parseFloat(wallet.balance) < totalPriceUSD) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // 3. Attempt order via external API
    let apiOrderId = null;
    let status = 'processing';
    try {
      const apiResponse = await placeOrder({ service: service_id, link, quantity });
      if (!apiResponse.order) throw new Error('No order ID returned from API');
      apiOrderId = apiResponse.order;
    } catch (apiErr) {
      console.warn('⚠️ External API failed, queueing order');
      status = 'queued';
    }

    // 4. Save order in Supabase
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          service_id,
          service_name,
          link,
          quantity: parseInt(quantity),
          price_usd: parseFloat(price_usd) || totalPriceUSD,
          price_converted: parseFloat(price_converted) || totalPriceUSD,
          currency: currency || 'USD',
          speed: speed || 'N/A',
          guarantee: guarantee || 'N/A',
          status,
          external_order_id: apiOrderId,
          progress: 0
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 5. Deduct balance if order was placed successfully
    if (status === 'processing') {
      const { error: updateError } = await supabase.rpc('deduct_balance', {
        user_id_input: userId,
        amount_input: totalPriceUSD
      });
      if (updateError) throw updateError;
    }

    return res.status(201).json({
      message: status === 'queued'
        ? 'Order queued. We will retry shortly.'
        : 'Order placed successfully.',
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

    const status = await getOrderStatus(order.external_order_id);
    res.json({ status });

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

// 🔁 Admin - Resubmit failed/queued order
exports.resubmitOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('status', 'queued')
      .single();

    if (error || !order) return res.status(404).json({ error: 'No queued order found' });

    const apiResponse = await placeOrder({
      service: order.service_id,
      link: order.link,
      quantity: order.quantity
    });

    if (!apiResponse.order) {
      return res.status(500).json({ error: 'External API failed to resubmit' });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'processing', external_order_id: apiResponse.order })
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({ message: 'Order resubmitted successfully' });

  } catch (err) {
    console.error('Resubmission error:', err.message);
    res.status(500).json({ error: 'Could not resubmit order' });
  }
};

// 🔹 User fetches own orders
exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, services(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const orders = data.map(order => ({
      ...order,
      quantity: parseInt(order.quantity) || 0,
      price_usd: parseFloat(order.price_usd) || 0,
      price_converted: parseFloat(order.price_converted) || 0,
      progress: parseInt(order.progress) || 0,
      status: order.status || 'pending',
      speed: order.speed || 'N/A',
      guarantee: order.guarantee || 'N/A'
    }));

    res.json({ orders });
  } catch (err) {
    console.error('Fetch user orders failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
