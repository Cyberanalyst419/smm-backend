const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const supabase = require('../config/supabase');

router.get('/me/balance', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: result.rows[0].balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;
