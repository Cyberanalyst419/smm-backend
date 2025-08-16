const express = require('express');
const router = express.Router();
const { handlePaystackPayment } = require('../controllers/paymentController');

router.post('/paystack', handlePaystackPayment);

module.exports = router;
