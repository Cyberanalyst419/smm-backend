const express = require('express');
const router = express.Router();
const {
  initiateDeposit,
  verifyDeposit,
  manualPayment,
} = require('../controllers/paymentController');

router.post('/initiate', initiateDeposit); // Auth optional for testing
router.post('/verify', verifyDeposit);
router.post('/manual', manualPayment);

module.exports = router;
