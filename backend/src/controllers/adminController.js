const prisma = require('../config/prisma');
const { getIo } = require('../socket');

// Helper to log administrative actions
const logAuditAction = async (req, action, target, details) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: req.user?.id || req.user?._id || 'SYSTEM',
        adminName: req.user?.name || 'Admin',
        adminEmail: req.user?.email || 'admin@devhub.com',
        adminRole: req.user?.role || 'admin',
        action,
        entityType: target.entityType || 'User',
        entityId: target.entityId || null,
        targetEmail: target.targetEmail || '',
        targetName: target.targetName || '',
        details: details || {},
        ipAddress: req.ip || req.connection?.remoteAddress || '',
        userAgent: req.headers['user-agent'] || ''
      }
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

// @desc    Get Admin Overview Metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVerified,
      totalSuspended,
      totalPosts,
      totalConnections,
      totalMessages,
      pendingReportsCount,
      recentAuditLogsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerifiedBadge: true } }),
      prisma.user.count({ where: { isSuspended: true } }),
      prisma.post.count(),
      prisma.connection.count({ where: { status: 'accepted' } }),
      prisma.message.count(),
      prisma.post.count({ where: { isReported: true } }),
      prisma.auditLog.count()
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignupsCount = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    res.status(200).json({
      metrics: {
        totalUsers,
        totalVerified,
        totalSuspended,
        totalPosts,
        totalConnections,
        totalMessages,
        pendingReportsCount,
        recentAuditLogsCount,
        recentSignupsCount,
        growthPercentage: totalUsers > 0 ? ((recentSignupsCount / totalUsers) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ message: 'Failed to retrieve stats: ' + error.message });
  }
};

// @desc    Get All Users with search & pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role && role !== 'all') where.role = role;
    if (status === 'suspended') where.isSuspended = true;
    if (status === 'active') where.isSuspended = false;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      })
    ]);

    res.status(200).json({
      users: users.map(u => ({
        ...u,
        _id: u.id,
        avatar: { url: u.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }
      })),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get User Forensics
// @route   GET /api/admin/users/:id/forensics
// @access  Private (Admin)
const getUserForensics = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { profile: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [postsCount, commentsCount, connectionsCount, auditLogs] = await Promise.all([
      prisma.post.count({ where: { authorId: user.id } }),
      prisma.comment.count({ where: { userId: user.id } }),
      prisma.connection.count({ where: { OR: [{ requesterId: user.id }, { recipientId: user.id }], status: 'accepted' } }),
      prisma.auditLog.findMany({ where: { entityId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 })
    ]);

    res.status(200).json({
      user: { ...user, _id: user.id },
      stats: { postsCount, commentsCount, connectionsCount },
      auditLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue User Strike
// @route   POST /api/admin/users/:id/strike
// @access  Private (Admin)
const issueUserStrike = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { strikesCount: { increment: 1 } }
    });
    await logAuditAction(req, 'USER_STRIKE_ISSUED', { entityId: user.id, targetEmail: user.email }, { reason });
    res.status(200).json({ success: true, strikesCount: user.strikesCount });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Send Admin Direct Notice
// @route   POST /api/admin/users/:id/send-notice
// @access  Private (Admin)
const sendAdminDirectNotice = async (req, res) => {
  try {
    const { message } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await prisma.notification.create({
      data: {
        recipientId: user.id,
        senderId: req.user.id,
        type: 'admin_notice',
        title: 'Official Administration Notice',
        message: message || 'Notice from DevHub Administration'
      }
    });

    await logAuditAction(req, 'ADMIN_NOTICE_SENT', { entityId: user.id, targetEmail: user.email }, { message });
    res.status(200).json({ success: true, message: 'Notice dispatched successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Export User Data Package (GDPR Compliance)
// @route   GET /api/admin/users/:id/export-data
// @access  Private (Admin)
const exportUserDataPackage = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { profile: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [posts, comments, messages] = await Promise.all([
      prisma.post.findMany({ where: { authorId: user.id } }),
      prisma.comment.findMany({ where: { userId: user.id } }),
      prisma.message.findMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }] } })
    ]);

    res.status(200).json({ user, posts, comments, messages });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Update User Status (Suspend / Reactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res) => {
  try {
    const { isSuspended, suspendedReason } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isSuspended: Boolean(isSuspended),
        suspendedReason: isSuspended ? suspendedReason : null,
        tokenVersion: { increment: 1 }
      }
    });
    await logAuditAction(req, isSuspended ? 'USER_SUSPENDED' : 'USER_REACTIVATED', { entityId: user.id, targetEmail: user.email }, { reason: suspendedReason });
    res.status(200).json({ success: true, user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Toggle Verified Badge
// @route   PUT /api/admin/users/:id/verified-badge
// @access  Private (Admin)
const toggleUserVerifiedBadge = async (req, res) => {
  try {
    const { isVerifiedBadge, badgeType } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isVerifiedBadge: Boolean(isVerifiedBadge),
        badgeType: badgeType || 'none'
      }
    });
    await logAuditAction(req, 'BADGE_UPDATED', { entityId: user.id, targetEmail: user.email }, { isVerifiedBadge, badgeType });
    res.status(200).json({ success: true, user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Update User Role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role, tokenVersion: { increment: 1 } }
    });
    await logAuditAction(req, 'ROLE_UPDATED', { entityId: user.id, targetEmail: user.email }, { role });
    res.status(200).json({ success: true, user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Revoke User Sessions
// @route   POST /api/admin/users/:id/revoke-sessions
// @access  Private (Admin)
const revokeUserSessions = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { tokenVersion: { increment: 1 } }
    });
    await logAuditAction(req, 'SESSIONS_REVOKED', { entityId: user.id, targetEmail: user.email });
    res.status(200).json({ success: true, message: 'All active user sessions revoked.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Get Reported Content Queue
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReportedContent = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isReported: true },
      include: { author: { include: { profile: true } } },
      orderBy: { updatedAt: 'desc' }
    });
    res.status(200).json({ reports: posts });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Moderate Reported Post
// @route   POST /api/admin/reports/:id/action
// @access  Private (Admin)
const moderateReportedPost = async (req, res) => {
  try {
    const { action } = req.body;
    if (action === 'delete') {
      await prisma.post.delete({ where: { id: req.params.id } });
    } else {
      await prisma.post.update({
        where: { id: req.params.id },
        data: { isReported: false }
      });
    }
    await logAuditAction(req, 'POST_MODERATED', { entityType: 'Post', entityId: req.params.id }, { action });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Report Post by User
// @route   POST /api/admin/report-post/:id
// @access  Private
const reportPostByUser = async (req, res) => {
  try {
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: { isReported: true, reportsCount: { increment: 1 } }
    });
    res.status(200).json({ success: true, message: 'Report submitted to Trust & Safety Desk.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Report User by User
// @route   POST /api/admin/report-user/:id
// @access  Private
const reportUserByUser = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { reportsCount: { increment: 1 } }
    });
    res.status(200).json({ success: true, message: 'User report submitted.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Broadcast Handlers
const getAllBroadcasts = async (req, res) => res.json({ broadcasts: [] });
const getActiveBroadcasts = async (req, res) => res.json({ broadcasts: [] });
const broadcastNotification = async (req, res) => res.json({ success: true });
const toggleBroadcastStatus = async (req, res) => res.json({ success: true });
const deleteBroadcast = async (req, res) => res.json({ success: true });

// App Config Handlers
const getAppConfig = async (req, res) => res.json({ config: { maintenanceMode: false } });
const updateAppConfig = async (req, res) => res.json({ success: true });
const getPublicAppConfig = async (req, res) => res.json({ maintenanceMode: false, currentVersion: '3.0.0' });

// Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.status(200).json({ logs });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
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
  reportPostByUser,
  reportUserByUser,
  broadcastNotification,
  getActiveBroadcasts,
  getAllBroadcasts,
  toggleBroadcastStatus,
  deleteBroadcast,
  getAppConfig,
  updateAppConfig,
  getPublicAppConfig,
  getAuditLogs
};
