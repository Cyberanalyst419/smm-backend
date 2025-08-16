const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  addReply,
  getReplies
} = require('../controllers/ticketReplyController');

router.post('/', authenticateToken, addReply);
router.get('/:ticketId', authenticateToken, getReplies);

module.exports = router;
