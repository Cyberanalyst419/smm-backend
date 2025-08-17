// src/routes/services.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

// GET /api/services
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .order('platform', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Services error:', err.message);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

module.exports = router;
