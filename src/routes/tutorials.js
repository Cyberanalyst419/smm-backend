const express = require('express');
const router = express.Router();
const tutorialsController = require('../controllers/tutorialsController');
const auth = require('../middleware/auth');

// 🔓 Public (or use auth if needed)
router.get('/', tutorialsController.getAllTutorials);

module.exports = router;
