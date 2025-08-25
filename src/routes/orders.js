const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const orderController = require('../controllers/orderController');
const pool = require('../config/database');

// 🔐 Authenticated user creates a new order
router.post('/', authenticateToken, orderController.createOrder);

// 🔍 Check status
router.get('/:id/status', authenticateToken, orderController.checkOrderStatus);

// 📦 Get own orders (direct DB)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    const data = result.rows.map(order => ({
      ...order,
      quantity: parseInt(order.quantity) || 0,
      price_usd: parseFloat(order.price_usd) || 0,
      price_converted: parseFloat(order.price_converted) || 0,
      progress: parseInt(order.progress) || 0,
      status: order.status || 'pending',
      speed: order.speed || 'N/A',
      guarantee: order.guarantee || 'N/A'
    }));
    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching user orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// 💰 Get total spending of authenticated user
router.get('/total-spent', authenticateToken, orderController.getTotalSpent);

// ✅ Admin-only: Get all orders
router.get('/all', authenticateToken, isAdmin, orderController.getAllOrders);

// ❌ Delete order (refund if pending)
router.delete('/:order_id', authenticateToken, orderController.deleteOrder);

// 💸 Manual refund endpoint
router.post('/:id/refund', authenticateToken, orderController.refundOrder);

// 🔁 Admin-only: Resubmit
router.post('/:id/resubmit', authenticateToken, isAdmin, orderController.resubmitOrder);

module.exports = router;
