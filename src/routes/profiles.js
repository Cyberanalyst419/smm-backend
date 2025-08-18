const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profilesController');
const auth = require('../middleware/auth');

// 🔐 Get current user profile
router.get('/', auth, profilesController.getProfile);

// 🔐 Update current user profile (optional)
router.put('/update', auth, profilesController.updateProfile);

module.exports = router;
