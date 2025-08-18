// src/routes/services.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

// GET /api/services
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .order('platform', { ascending: true })
      .order('category', { ascending: true });

    if (error) {
      console.error('Supabase error fetching services:', error);
      return res.status(500).json({ message: 'Failed to fetch services' });
    }

    if (!data || data.length === 0) {
      return res.json([]);
    }

    // Ensure numeric fields are numbers (price, min, max)
    const services = data.map(service => ({
      ...service,
      price: parseFloat(service.price) || 0,
      min: parseInt(service.min) || 0,
      max: parseInt(service.max) || 0,
      speed: service.speed || 'N/A',
      guarantee: service.guarantee || 'N/A',
      tier: service.tier || 'standard'
    }));

    res.json(services);
  } catch (err) {
    console.error('Services route error:', err);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

module.exports = router;
