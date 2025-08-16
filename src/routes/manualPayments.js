// src/routes/manualPayments.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/manualPaymentsController');

router.post('/', controller.submitManualPayment);
router.get('/pending', controller.getPendingPayments);
router.put('/mark-paid/:reference', controller.markAsPaid);

module.exports = router;
