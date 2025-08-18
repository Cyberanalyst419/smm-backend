const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profilesController');
const { authenticateToken } = require('../middleware/auth');

// GET user profile
router.get('/', authenticateToken, profilesController.getProfile);

// PUT update profile
router.put('/update', authenticateToken, profilesController.updateProfile);

module.exports = router;
