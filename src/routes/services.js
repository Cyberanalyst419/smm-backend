// src/routes/services.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database'); // PostgreSQL pool

// =============================
// GET /api/services
// =============================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT service, type, name, rate, min, max, category, dripfeed, refill, cancel, speed, guarantee, tier
       FROM services
       ORDER BY type ASC, category ASC, name ASC`
    );

    if (!result.rows || result.rows.length === 0) {
      return res.json([]);
    }

    const services = result.rows.map(service => ({
      ...service,
      rate: parseFloat(service.rate) || 0,
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

// =============================
// GET /api/services/:id
// =============================
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT service, type, name, rate, min, max, category, dripfeed, refill, cancel, speed, guarantee, tier
       FROM services
       WHERE service = $1
       LIMIT 1`,
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const s = result.rows[0];
    const service = {
      ...s,
      rate: parseFloat(s.rate) || 0,
      min: parseInt(s.min) || 0,
      max: parseInt(s.max) || 0,
      speed: s.speed || 'N/A',
      guarantee: s.guarantee || 'N/A',
      tier: s.tier || 'standard'
    };

    res.json(service);
  } catch (err) {
    console.error('Service lookup error:', err);
    res.status(500).json({ message: 'Failed to fetch service' });
  }
});

module.exports = router;
