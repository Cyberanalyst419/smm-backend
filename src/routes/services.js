// src/routes/services.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database'); // PostgreSQL pool

// GET /api/services
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM services ORDER BY platform ASC, category ASC`
    );

    if (!result.rows || result.rows.length === 0) {
      return res.json([]);
    }

    const services = result.rows.map(service => ({
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
