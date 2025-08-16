const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profilesController');
const auth = require('../middleware/auth');

// 🔐 User profile routes
router.get('/', auth, profilesController.getProfile);
router.put('/update', auth, profilesController.updateProfile);

module.exports = router;
