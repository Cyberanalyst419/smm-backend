const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const orderController = require('../controllers/orderController');
const supabase = require('../config/supabase');

// 🔐 Authenticated user creates a new order
router.post('/', auth, orderController.createOrder);

// 🔍 Authenticated user checks status of a specific order
router.get('/:id/status', auth, orderController.checkOrderStatus);

// 📦 Authenticated user gets all their own orders
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// ✅ Admin-only: Get ALL orders
router.get('/all', auth, isAdmin, orderController.getAllOrders);

// 🔁 Admin-only: Resubmit failed or queued order
router.post('/:id/resubmit', auth, isAdmin, orderController.resubmitOrder);

module.exports = router;
