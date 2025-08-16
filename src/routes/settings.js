const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');

// 🔐 Protected routes (for admin use if needed)
router.get('/', auth, settingsController.getSettings);
router.put('/update', auth, settingsController.updateSetting);

module.exports = router;
