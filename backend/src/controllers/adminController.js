const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');
const Connection = require('../models/Connection');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const AppConfig = require('../models/AppConfig');
const AuditLog = require('../models/AuditLog');
const { getIo } = require('../socket');

// Helper to log administrative actions
const logAuditAction = async (req, action, target, details) => {
  try {
    await AuditLog.create({
      actor: {
        adminId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      action,
      target: {
        entityType: target.entityType || 'User',
        entityId: target.entityId || null,
        targetEmail: target.targetEmail || '',
        targetName: target.targetName || '',
      },
      details: details || {},
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

// @desc    Get Admin Overview Metrics & 7-Day Growth Trends
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
      User.countDocuments({}),
      User.countDocuments({ isVerifiedBadge: true }),
      User.countDocuments({ isSuspended: true }),
      Post.countDocuments({}),
      Connection.countDocuments({ status: 'accepted' }),
      Message.countDocuments({}),
      Post.countDocuments({ reportsCount: { $gt: 0 } }),
      AuditLog.countDocuments({}),
    ]);

    // Calculate Signups in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate Posts in the last 7 days
    const recentPosts = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      summary: {
        totalUsers,
        totalVerified,
        totalSuspended,
        totalPosts,
        totalConnections,
        totalMessages,
        pendingReportsCount,
        recentAuditLogsCount,
      },
      trends: {
        signups: recentSignups,
        posts: recentPosts,
      },
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
};

// @desc    Get Paginated & Filtered Users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const search = req.query.search || '';
    const role = req.query.role || 'all';
    const status = req.query.status || 'all';

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role !== 'all') {
      query.role = role;
    }

    if (status === 'suspended') {
      query.isSuspended = true;
    } else if (status === 'verified') {
      query.isVerifiedBadge = true;
    } else if (status === 'active') {
      query.isSuspended = { $ne: true };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash -otp -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Fetch matching profiles for status/company details
    const userIds = users.map((u) => u._id);
    const profiles = await Profile.find({ user: { $in: userIds } })
      .select('user status company location headline')
      .lean();
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const enrichedUsers = users.map((u) => ({
      ...u,
      profile: profileMap.get(u._id.toString()) || null,
    }));

    res.json({
      users: enrichedUsers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// @desc    Update User Status, Role, or Verification Badge
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res) => {
  try {
    const { action, value, reason } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Safety check: Non-super_admins cannot modify a super_admin
    if (targetUser.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Super Administrators cannot be modified' });
    }

    let auditAction = 'USER_STATUS_UPDATED';

    if (action === 'toggleSuspend') {
      targetUser.isSuspended = value !== undefined ? value : !targetUser.isSuspended;
      targetUser.suspendedReason = targetUser.isSuspended ? (reason || 'Violation of terms') : null;
      targetUser.suspendedAt = targetUser.isSuspended ? new Date() : null;
      auditAction = targetUser.isSuspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED';
    } else if (action === 'toggleShadowban') {
      targetUser.isShadowBanned = value !== undefined ? value : !targetUser.isShadowBanned;
      auditAction = targetUser.isShadowBanned ? 'USER_SHADOWBANNED' : 'USER_SHADOWBAN_REMOVED';
    } else if (action === 'toggleVerifiedBadge') {
      targetUser.isVerifiedBadge = value !== undefined ? value : !targetUser.isVerifiedBadge;
      auditAction = targetUser.isVerifiedBadge ? 'USER_BADGE_GRANTED' : 'USER_BADGE_REVOKED';
    } else if (action === 'changeRole') {
      if (['user', 'moderator', 'admin'].includes(value)) {
        targetUser.role = value;
      } else if (value === 'super_admin' && req.user.role === 'super_admin') {
        targetUser.role = value;
      } else {
        return res.status(400).json({ message: 'Invalid role assignment' });
      }
      auditAction = 'USER_ROLE_CHANGED';
    } else {
      return res.status(400).json({ message: 'Invalid action specified' });
    }

    await targetUser.save();

    // Log to immutable audit trail
    await logAuditAction(
      req,
      auditAction,
      { entityType: 'User', entityId: targetUser._id, targetEmail: targetUser.email, targetName: targetUser.name },
      { action, value, reason }
    );

    res.json({
      message: 'User status updated successfully',
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isVerifiedBadge: targetUser.isVerifiedBadge,
        isSuspended: targetUser.isSuspended,
        isShadowBanned: targetUser.isShadowBanned,
        suspendedReason: targetUser.suspendedReason,
      },
    });
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

// @desc    Toggle Verified Badge (1-Click Shortcut)
// @route   PUT /api/admin/users/:id/badge
// @access  Private (Admin)
const toggleUserVerifiedBadge = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    targetUser.isVerifiedBadge = !targetUser.isVerifiedBadge;
    await targetUser.save();

    await logAuditAction(
      req,
      targetUser.isVerifiedBadge ? 'USER_BADGE_GRANTED' : 'USER_BADGE_REVOKED',
      { entityType: 'User', entityId: targetUser._id, targetEmail: targetUser.email, targetName: targetUser.name },
      { isVerifiedBadge: targetUser.isVerifiedBadge }
    );

    res.json({
      message: `Verified badge ${targetUser.isVerifiedBadge ? 'granted' : 'revoked'} successfully`,
      isVerifiedBadge: targetUser.isVerifiedBadge,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change User Role (Super Admin Only)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Super Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'moderator', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const prevRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await logAuditAction(
      req,
      'USER_ROLE_CHANGED',
      { entityType: 'User', entityId: targetUser._id, targetEmail: targetUser.email, targetName: targetUser.name },
      { previousRole: prevRole, newRole: role }
    );

    res.json({ message: `Role updated to ${role}`, role: targetUser.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke All Active Mobile & Web Sessions
// @route   POST /api/admin/users/:id/revoke-sessions
// @access  Private (Super Admin)
const revokeUserSessions = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    targetUser.refreshToken = null;
    await targetUser.save();

    await logAuditAction(
      req,
      'USER_SESSIONS_REVOKED',
      { entityType: 'User', entityId: targetUser._id, targetEmail: targetUser.email, targetName: targetUser.name },
      { reason: req.body?.reason || 'Administrative session revocation' }
    );

    res.json({ message: 'All active sessions for this user have been terminated.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Reported Posts Moderation Queue
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReportedContent = async (req, res) => {
  try {
    const reportedPosts = await Post.find({ reportsCount: { $gt: 0 } })
      .populate('author', 'name email avatar role isVerifiedBadge')
      .populate('reports.user', 'name avatar')
      .sort({ reportsCount: -1, updatedAt: -1 })
      .lean();

    res.json({ reportedPosts });
  } catch (error) {
    console.error('Error in getReportedContent:', error);
    res.status(500).json({ message: 'Failed to fetch reported content' });
  }
};

// @desc    Moderate Reported Post (Dismiss, Delete, or Ban Author)
// @route   POST /api/admin/reports/:id/action
// @access  Private (Admin)
const moderateReportedPost = async (req, res) => {
  try {
    const { action, reason } = req.body; // 'dismiss' | 'delete' | 'delete_and_ban'
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (action === 'dismiss') {
      post.reports = [];
      post.reportsCount = 0;
      post.isFlagged = false;
      post.isModerated = true;
      await post.save();

      await logAuditAction(
        req,
        'REPORT_DISMISSED',
        { entityType: 'Post', entityId: post._id },
        { action: 'dismiss', reason }
      );

      return res.json({ message: 'Reports dismissed successfully', postId: post._id });
    }

    if (action === 'delete') {
      const postId = post._id;
      await Post.findByIdAndDelete(post._id);

      await logAuditAction(
        req,
        'POST_DELETED_BY_ADMIN',
        { entityType: 'Post', entityId: postId },
        { action: 'delete', reason, authorId: post.author }
      );

      return res.json({ message: 'Post deleted successfully', postId });
    }

    if (action === 'delete_and_ban') {
      const postId = post._id;
      await Promise.all([
        Post.findByIdAndDelete(post._id),
        User.findByIdAndUpdate(post.author, {
          isSuspended: true,
          suspendedReason: reason || 'Severe violation of community guidelines via posted content.',
          suspendedAt: new Date(),
        }),
      ]);

      await logAuditAction(
        req,
        'POST_DELETED_AND_AUTHOR_BANNED',
        { entityType: 'Post', entityId: postId },
        { action: 'delete_and_ban', reason, authorId: post.author }
      );

      return res.json({ message: 'Post deleted and author suspended', postId });
    }

    res.status(400).json({ message: 'Invalid moderation action' });
  } catch (error) {
    console.error('Error in moderateReportedPost:', error);
    res.status(500).json({ message: 'Failed to execute moderation action' });
  }
};

// @desc    Broadcast Global Announcement / Push to All Online Users
// @route   POST /api/admin/broadcast
// @access  Private (Admin)
const broadcastNotification = async (req, res) => {
  try {
    const { title, message, type = 'system_alert', link } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Broadcast message is required' });
    }

    const payload = {
      title: title || 'DevHub System Alert',
      message,
      type,
      link: link || null,
      timestamp: new Date(),
    };

    // Emit live WebSocket event across all connected sockets
    const io = getIo();
    if (io) {
      io.emit('globalAnnouncement', payload);
    }

    await logAuditAction(
      req,
      'GLOBAL_BROADCAST_SENT',
      { entityType: 'Broadcast', entityId: null },
      payload
    );

    res.json({ message: 'Broadcast sent successfully', payload });
  } catch (error) {
    console.error('Error in broadcastNotification:', error);
    res.status(500).json({ message: 'Failed to send broadcast' });
  }
};

// @desc    Get System & Mobile App Configuration
// @route   GET /api/admin/app-config
// @access  Private (Admin)
const getAppConfig = async (req, res) => {
  try {
    let config = await AppConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = await AppConfig.create({ key: 'global_config' });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update System & Mobile App Configuration
// @route   PUT /api/admin/app-config
// @access  Private (Super Admin)
const updateAppConfig = async (req, res) => {
  try {
    const { android, ios, maintenanceMode, featureFlags } = req.body;
    let config = await AppConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = new AppConfig({ key: 'global_config' });
    }

    if (android) config.android = { ...config.android.toObject(), ...android };
    if (ios) config.ios = { ...config.ios.toObject(), ...ios };
    if (maintenanceMode) config.maintenanceMode = { ...config.maintenanceMode.toObject(), ...maintenanceMode };
    if (featureFlags) config.featureFlags = { ...config.featureFlags.toObject(), ...featureFlags };

    await config.save();

    await logAuditAction(
      req,
      'APP_CONFIG_UPDATED',
      { entityType: 'SystemConfig', entityId: config._id },
      req.body
    );

    res.json({ message: 'App configuration updated successfully', config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Public Mobile App Configuration (Client Handshake)
// @route   GET /api/app/config
// @access  Public
const getPublicAppConfig = async (req, res) => {
  try {
    let config = await AppConfig.findOne({ key: 'global_config' }).lean();
    if (!config) {
      config = {
        android: { minVersion: '1.0.0', latestVersion: '1.0.0', forceUpdate: false },
        ios: { minVersion: '1.0.0', latestVersion: '1.0.0', forceUpdate: false },
        maintenanceMode: { enabled: false },
      };
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Immutable Security Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private (Super Admin)
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a Post (Public Authenticated User Action)
// @route   POST /api/admin/report-post/:id
// @access  Private
const reportPostByUser = async (req, res) => {
  try {
    const { reason, comment } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyReported = post.reports.some((r) => r.user.toString() === req.user.id);

    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    post.reports.push({
      user: req.user.id,
      reason: reason || 'spam',
      comment: comment || '',
      reportedAt: new Date(),
    });
    post.reportsCount = (post.reportsCount || 0) + 1;
    post.isFlagged = true;

    await post.save();

    res.json({ message: 'Post reported to moderators for review' });
  } catch (error) {
    console.error('Error in reportPostByUser:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
};

module.exports = {
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
};
