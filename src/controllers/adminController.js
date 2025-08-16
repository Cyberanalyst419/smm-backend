const supabase = require('../config/supabase');
const axios = require('axios');

// 1. List Users
exports.getUsers = async (req, res) => {
  try {
    const users = await db.query(`
      SELECT id, email, username, balance, role, created_at
      FROM users ORDER BY created_at DESC
    `);
    res.json({ users: users.rows });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// 2. List Payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await db.query(`
      SELECT p.*, u.email, u.username
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ payments: payments.rows });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// 3. Approve a Payment & Update Wallet
exports.approvePayment = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query(`
      SELECT * FROM payments WHERE id = $1 AND status = 'pending'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found or already approved' });
    }

    const payment = result.rows[0];

    await db.query(`UPDATE payments SET status = 'completed' WHERE id = $1`, [id]);
    await db.query(`UPDATE wallets SET balance = balance + $1 WHERE user_id = $2`, [
      payment.amount,
      payment.user_id
    ]);

    res.json({ message: 'Payment approved and wallet credited' });
  } catch (err) {
    console.error('Error approving payment:', err);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
};

// 4. View All Tickets
exports.getTickets = async (req, res) => {
  try {
    const tickets = await db.query(`
      SELECT t.*, u.username
      FROM support_tickets t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);
    res.json({ tickets: tickets.rows });
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// 5. Reply to a Ticket
exports.replyToTicket = async (req, res) => {
  const ticketId = req.params.id;
  const { message } = req.body;
  const adminId = req.user.id;

  try {
    await db.query(
      `INSERT INTO ticket_replies (ticket_id, user_id, message) VALUES ($1, $2, $3)`,
      [ticketId, adminId, message]
    );
    res.json({ message: 'Reply sent' });
  } catch (err) {
    console.error('Error replying to ticket:', err);
    res.status(500).json({ error: 'Failed to send reply' });
  }
};

// 6. View Site Settings
exports.getSettings = async (req, res) => {
  try {
    const result = await db.query(`SELECT key, value FROM settings`);
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json({ settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// 7. Update Site Settings
exports.updateSettings = async (req, res) => {
  const updates = req.body;

  try {
    for (const key in updates) {
      await db.query(`
        INSERT INTO settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [key, updates[key]]);
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// 8. Get All Services
exports.getServices = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM services ORDER BY id');
    res.json({ services: rows });
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// 9. Update a Service
exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { price, min, max, tier } = req.body;

  try {
    const parsedPrice = parseFloat(price);
    const parsedMin = parseInt(min);
    const parsedMax = parseInt(max);

    if (isNaN(parsedPrice) || isNaN(parsedMin) || isNaN(parsedMax)) {
      return res.status(400).json({ error: 'Invalid input values' });
    }

    await db.query(`
      UPDATE services
      SET price = $1, min = $2, max = $3, tier = $4
      WHERE id = $5
    `, [parsedPrice, parsedMin, parsedMax, tier, id]);

    res.json({ message: '✅ Service updated successfully' });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: '❌ Failed to update service' });
  }
};

// 10. Resubmit Failed Order
exports.resubmitOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query(`
      SELECT * FROM orders
      WHERE id = $1 AND (status = 'failed' OR status = 'pending')
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or already completed' });
    }

    const order = rows[0];

    const response = await axios.post('https://external-smm-api.com/order', {
      service: order.service_id,
      link: order.link,
      quantity: order.quantity
    });

    if (!response.data || !response.data.order) {
      throw new Error('No order ID returned');
    }

    await db.query(`
      UPDATE orders
      SET status = 'processing', external_order_id = $1
      WHERE id = $2
    `, [response.data.order, id]);

    res.json({ message: '✅ Order resubmitted successfully' });
  } catch (err) {
    console.error('Resubmit failed:', err.message);
    res.status(500).json({ error: '❌ Failed to resubmit order' });
  }
};
