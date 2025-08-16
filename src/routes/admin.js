const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const adminController = require('../controllers/adminController');

// All routes are admin-protected
router.use(auth, isAdmin);

router.get('/users', adminController.getUsers);
router.get('/payments', adminController.getPayments);
router.post('/payments/approve/:id', adminController.approvePayment);
router.get('/tickets', adminController.getTickets);
router.post('/tickets/reply/:id', adminController.replyToTicket);
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);
router.post('/orders/:id/resubmit', adminController.resubmitOrder);

// ✅ ADD THESE:
router.get('/services', adminController.getServices);
router.put('/services/:id', adminController.updateService);

module.exports = router;
