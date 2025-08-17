// src/routes/services.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const supabase = require('../config/supabase');

// GET /api/services
router.get('/', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from('services').select('*');
    if (error) return res.status(400).json({ message: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
