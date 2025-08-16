const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const autoOrdersController = require('../controllers/autoOrdersController');

router.get('/', auth, autoOrdersController.getAutoOrders);
router.post('/', auth, autoOrdersController.createAutoOrder);
router.delete('/:id', auth, autoOrdersController.deleteAutoOrder);

module.exports = router;
