// src/routes/orders.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const orderController = require('../controllers/orderController');
const pool = require('../config/database'); // PostgreSQL pool

// 🔐 Authenticated user creates a new order
router.post('/', authenticateToken, orderController.createOrder);

// 🔍 Authenticated user checks status of a specific order
router.get('/:id/status', authenticateToken, orderController.checkOrderStatus);

// 📦 Authenticated user gets all their own orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const data = result.rows;

    // Ensure numeric and optional fields are safe
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

    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// ✅ Admin-only: Get ALL orders
router.get('/all', authenticateToken, isAdmin, orderController.getAllOrders);

// 🔁 Admin-only: Resubmit failed or queued order
router.post('/:id/resubmit', authenticateToken, isAdmin, orderController.resubmitOrder);

module.exports = router;
