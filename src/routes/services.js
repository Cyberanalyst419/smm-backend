// src/routes/services.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const serviceController = require('../controllers/serviceController');

// GET /api/services - fetch all services
router.get('/', auth, serviceController.getAllServices);

// GET /api/services/:platform - fetch services by platform
router.get('/:platform', auth, serviceController.getByPlatform);

module.exports = router;
