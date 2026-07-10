const express = require('express');
const router = express.Router();
const { 
  sendConnectionRequest, 
  acceptConnectionRequest, 
  rejectConnectionRequest, 
  removeConnection, 
  getPendingRequests, 
  getConnections, 
  getSuggestions,
  getConnectionStatus
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/connect/:userId', protect, sendConnectionRequest);
router.put('/accept/:requestId', protect, acceptConnectionRequest);
router.put('/reject/:requestId', protect, rejectConnectionRequest);
router.delete('/remove/:userId', protect, removeConnection);

router.get('/pending', protect, getPendingRequests);
router.get('/connections', protect, getConnections);
router.get('/suggestions', protect, getSuggestions);
router.get('/status/:userId', protect, getConnectionStatus);

module.exports = router;
