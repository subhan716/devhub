const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  toggleUserVerifiedBadge,
  updateUserRole,
  revokeUserSessions,
  getReportedContent,
  moderateReportedPost,
  broadcastNotification,
  getAppConfig,
  updateAppConfig,
  getPublicAppConfig,
  getAuditLogs,
  reportPostByUser,
} = require('../controllers/adminController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// Public Mobile App Handshake Endpoint (Flutter App queries on startup)
router.get('/public/app-config', getPublicAppConfig);

// Public User Action: Report any post
router.post('/report-post/:id', protect, reportPostByUser);

// Protected Admin Routes (Requires role: 'admin', 'super_admin', or 'moderator')
router.get('/stats', protect, protectAdmin, getAdminStats);
router.get('/users', protect, protectAdmin, getAllUsers);
router.put('/users/:id/status', protect, protectAdmin, updateUserStatus);
router.put('/users/:id/badge', protect, protectAdmin, toggleUserVerifiedBadge);
router.put('/users/:id/role', protect, protectAdmin, updateUserRole);
router.post('/users/:id/revoke-sessions', protect, protectAdmin, revokeUserSessions);

router.get('/reports', protect, protectAdmin, getReportedContent);
router.post('/reports/:id/action', protect, protectAdmin, moderateReportedPost);
router.post('/broadcast', protect, protectAdmin, broadcastNotification);

router.get('/app-config', protect, protectAdmin, getAppConfig);
router.put('/app-config', protect, protectAdmin, updateAppConfig);
router.get('/audit-logs', protect, protectAdmin, getAuditLogs);

module.exports = router;
