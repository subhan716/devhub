const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/:userId', protect, sendMessage);
router.put('/:userId/read', protect, markAsRead);

module.exports = router;
