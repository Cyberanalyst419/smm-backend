const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  createTicket,
  getUserTickets,
  getAllTickets
} = require('../controllers/supportController');

// Protected Routes
router.post('/', authenticateToken, createTicket);
router.get('/', authenticateToken, getUserTickets);

// Admin only (you can enhance this with role-check middleware)
router.get('/all', authenticateToken, getAllTickets);

module.exports = router;
