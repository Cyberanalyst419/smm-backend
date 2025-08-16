// src/controllers/userController.js
const supabase = require('../config/supabase');

async function getAllUsers(req, res) {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows); // send list of users
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getAllUsers };
