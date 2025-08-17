// src/routes/orders.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const orderController = require('../controllers/orderController');
const { supabaseAdmin } = require('../config/supabase');

// 🔐 Authenticated user creates a new order
router.post('/', authenticateToken, orderController.createOrder);

// 🔍 Authenticated user checks status of a specific order
router.get('/:id/status', authenticateToken, orderController.checkOrderStatus);

// 📦 Authenticated user gets all their own orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
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
