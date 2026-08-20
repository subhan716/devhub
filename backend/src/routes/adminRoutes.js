const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  getUserForensics,
  issueUserStrike,
  sendAdminDirectNotice,
  exportUserDataPackage,
  updateUserStatus,
  toggleUserVerifiedBadge,
  updateUserRole,
  revokeUserSessions,
  getReportedContent,
  moderateReportedPost,
  broadcastNotification,
  getActiveBroadcasts,
  getAllBroadcasts,
  toggleBroadcastStatus,
  deleteBroadcast,
  getAppConfig,
  updateAppConfig,
  getPublicAppConfig,
  getAuditLogs,
  reportPostByUser,
  reportUserByUser,
} = require('../controllers/adminController');
const {
  getPolicyBySlug,
  getAllPolicies,
  updatePolicy,
} = require('../controllers/policyController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// Public Mobile & Web App Handshake & Active Alert Banners
router.get('/public/app-config', getPublicAppConfig);
router.get('/public/broadcasts/active', getActiveBroadcasts);

// Public User Actions: Report post or user profile
router.post('/report-post/:id', protect, reportPostByUser);
router.post('/report-user/:id', protect, reportUserByUser);

// Protected Admin Routes (Requires role: 'admin', 'super_admin', or 'moderator')
router.get('/stats', protect, protectAdmin, getAdminStats);
router.get('/users', protect, protectAdmin, getAllUsers);
router.get('/users/:id/forensics', protect, protectAdmin, getUserForensics);
router.post('/users/:id/strike', protect, protectAdmin, issueUserStrike);
router.post('/users/:id/send-notice', protect, protectAdmin, sendAdminDirectNotice);
router.get('/users/:id/export-data', protect, protectAdmin, exportUserDataPackage);
router.put('/users/:id/status', protect, protectAdmin, updateUserStatus);
router.put('/users/:id/verified-badge', protect, protectAdmin, toggleUserVerifiedBadge);
router.put('/users/:id/role', protect, protectAdmin, updateUserRole);
router.post('/users/:id/revoke-sessions', protect, protectAdmin, revokeUserSessions);

// Trust & Safety Content Moderation Queue
router.get('/reports', protect, protectAdmin, getReportedContent);
router.post('/reports/:id/action', protect, protectAdmin, moderateReportedPost);

// Network Broadcast & Emergency Alerts Console
router.get('/broadcasts', protect, protectAdmin, getAllBroadcasts);
router.post('/broadcast', protect, protectAdmin, broadcastNotification);
router.put('/broadcasts/:id/status', protect, protectAdmin, toggleBroadcastStatus);
router.delete('/broadcasts/:id', protect, protectAdmin, deleteBroadcast);

// Mobile App Fleet Governance & OTA Config
router.get('/app-config', protect, protectAdmin, getAppConfig);
router.put('/app-config', protect, protectAdmin, updateAppConfig);

// Dynamic Legal & Policy CMS Console
router.get('/policies', protect, protectAdmin, getAllPolicies);
router.get('/policies/:slug', protect, protectAdmin, getPolicyBySlug);
router.put('/policies/:slug', protect, protectAdmin, updatePolicy);

// Immutable Forensic Audit Logs
router.get('/audit-logs', protect, protectAdmin, getAuditLogs);

module.exports = router;
