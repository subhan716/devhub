const express = require('express');
const router = express.Router();
const { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markAsRead, 
  editMessage, 
  deleteMessage,
  toggleReaction,
  forwardMessage 
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.post('/forward', protect, forwardMessage);
router.post('/react/:messageId', protect, toggleReaction);
router.put('/message/:messageId', protect, editMessage);
router.delete('/message/:messageId', protect, deleteMessage);
router.get('/:userId', protect, getMessages);
router.post('/:userId', protect, sendMessage);
router.put('/:userId/read', protect, markAsRead);

module.exports = router;
