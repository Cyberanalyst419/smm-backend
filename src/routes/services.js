// src/routes/services.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// Get all services
router.get('/', auth, serviceController.getAllServices);

// Get services by platform
router.get('/:platform', auth, serviceController.getByPlatform);

module.exports = router;
