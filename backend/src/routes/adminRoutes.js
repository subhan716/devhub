const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getReportedContent,
  moderateReportedPost,
  broadcastNotification,
  reportPostByUser
} = require('../controllers/adminController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// Public User Action: Report any post
router.post('/report-post/:id', protect, reportPostByUser);

// Protected Admin Routes (Requires role: 'admin', 'super_admin', or 'moderator')
router.get('/stats', protect, protectAdmin, getAdminStats);
router.get('/users', protect, protectAdmin, getAllUsers);
router.put('/users/:id/status', protect, protectAdmin, updateUserStatus);
router.get('/reports', protect, protectAdmin, getReportedContent);
router.post('/reports/:id/action', protect, protectAdmin, moderateReportedPost);
router.post('/broadcast', protect, protectAdmin, broadcastNotification);

module.exports = router;
