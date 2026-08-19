const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
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

// @desc    Get 360° Comprehensive User Forensics (Parallel Aggregation)
// @route   GET /api/admin/users/:id/forensics
// @access  Private (Admin)
const getUserForensics = async (req, res) => {
  try {
    const userId = req.params.id;

    // Execute covered queries in parallel for sub-10ms performance
    const [
      targetUser,
      profile,
      postsCount,
      commentsCount,
      connectionsCount,
      reportsCount,
      recentPosts,
      auditLogs,
    ] = await Promise.all([
      User.findById(userId).select('-passwordHash -otp -refreshToken').lean(),
      Profile.findOne({ user: userId }).lean(),
      Post.countDocuments({ author: userId }),
      Comment.countDocuments({ user: userId }),
      Connection.countDocuments({
        $or: [{ requester: userId }, { recipient: userId }],
        status: 'accepted',
      }),
      Post.countDocuments({ author: userId, reportsCount: { $gt: 0 } }),
      Post.find({ author: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('content codeSnippet image commentsCount likesCount createdAt reportsCount isFlagged')
        .lean(),
      AuditLog.find({ 'target.entityId': userId })
        .sort({ createdAt: -1 })
        .limit(25)
        .lean(),
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    res.json({
      user: targetUser,
      profile: profile || null,
      telemetry: {
        postsCount,
        commentsCount,
        connectionsCount,
        reportsCount,
        strikesCount: targetUser.strikesCount || 0,
        tokenVersion: targetUser.tokenVersion || 0,
      },
      warnings: targetUser.warnings || [],
      recentPosts: recentPosts || [],
      auditLogs: auditLogs || [],
    });
  } catch (error) {
    console.error('Error in getUserForensics:', error);
    res.status(500).json({ message: 'Failed to aggregate user forensics' });
  }
};

// @desc    Issue Official Warning Strike (Automated Tier Governance)
// @route   POST /api/admin/users/:id/strike
// @access  Private (Admin, Super Admin)
const issueUserStrike = async (req, res) => {
  try {
    const { reason, autoSuspend = true } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'A valid justification reason is required to issue a strike.' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    targetUser.strikesCount = (targetUser.strikesCount || 0) + 1;
    targetUser.warnings = targetUser.warnings || [];
    targetUser.warnings.unshift({
      reason: reason.trim(),
      issuedBy: req.user._id,
      issuedAt: new Date(),
    });

    let autoSuspended = false;
    if (targetUser.strikesCount >= 3 && autoSuspend) {
      targetUser.isSuspended = true;
      targetUser.suspendedReason = `Account automatically suspended after accumulating ${targetUser.strikesCount} strikes. Latest strike: ${reason}`;
      targetUser.suspendedAt = new Date();
      targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
      autoSuspended = true;
    }

    await targetUser.save();

    // Create In-App Notification for the user
    await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      type: 'admin_notice',
      title: `Official Community Warning (Strike #${targetUser.strikesCount})`,
      message: `You have received an official strike for: "${reason}". Please review community guidelines.`,
      read: false,
    });

    // Real-time socket emission if user is connected
    try {
      const io = getIo();
      io.to(targetUser._id.toString()).emit('notification_received', {
        title: `Official Community Warning (Strike #${targetUser.strikesCount})`,
        message: reason,
        type: 'warning',
      });
      if (autoSuspended) {
        io.to(targetUser._id.toString()).emit('force_logout', {
          reason: 'Your account has been suspended due to 3 accumulated strikes.',
        });
      }
    } catch (sockErr) {
      console.warn('Socket emit ignored:', sockErr.message);
    }

    // Immutable Audit Log
    await logAuditAction(
      req,
      'USER_STRIKE_ISSUED',
      { entityType: 'User', entityId: targetUser._id, targetEmail: targetUser.email, targetName: targetUser.name },
      { strikeNumber: targetUser.strikesCount, reason, autoSuspended }
    );

    res.json({
      message: `Strike #${targetUser.strikesCount} issued successfully.${autoSuspended ? ' Account automatically suspended!' : ''}`,
      strikesCount: targetUser.strikesCount,
      isSuspended: targetUser.isSuspended,
      warnings: targetUser.warnings,
    });
  } catch (error) {
    console.error('Error in issueUserStrike:', error);
    res.status(500).json({ message: error.message || 'Failed to issue strike' });
  }
};

// @desc    Send Direct Official Admin Notice to User In-App Inbox
// @route   POST /api/admin/users/:id/send-notice
// @access  Private (Admin, Super Admin)
const sendAdminDirectNotice = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      type: 'admin_notice',
      title: title?.trim() || 'DevHub Trust & Safety Message',
      message: message.trim(),
      read: false,
    });

    try {
      getIo().to(targetUser._id.toString()).emit('notification_received', notification);
    } catch (sockErr) {
      console.warn('Socket notification emit skipped:', sockErr.message);
    }

    await logAuditAction(
      req,
      'ADMIN_DIRECT_NOTICE_SENT',
      { entityType: 'User', entityId: targetUser._id, targetEmail: targetUser.email, targetName: targetUser.name },
      { title, message }
    );

    res.json({ message: 'Direct notice sent to user inbox.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export Complete GDPR User Data Package (JSON)
// @route   GET /api/admin/users/:id/export-data
// @access  Private (Super Admin)
const exportUserDataPackage = async (req, res) => {
  try {
    const userId = req.params.id;
    const [user, profile, posts, comments, connections] = await Promise.all([
      User.findById(userId).select('-passwordHash -otp').lean(),
      Profile.findOne({ user: userId }).lean(),
      Post.find({ author: userId }).lean(),
      Comment.find({ user: userId }).lean(),
      Connection.find({
        $or: [{ requester: userId }, { recipient: userId }],
      }).lean(),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logAuditAction(
      req,
      'USER_DATA_EXPORTED',
      { entityType: 'User', entityId: user._id, targetEmail: user.email, targetName: user.name },
      { exportFormat: 'JSON', recordsCount: { posts: posts.length, comments: comments.length } }
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="devhub-export-${user.email}-${Date.now()}.json"`);
    res.json({
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.email,
        complianceStandard: 'GDPR / CCPA Data Portability Package',
      },
      user,
      profile: profile || {},
      posts,
      comments,
      connections,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate data export' });
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
      if (targetUser.isSuspended) {
        targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1; // Instant session purge
      }
      auditAction = targetUser.isSuspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED';
    } else if (action === 'toggleShadowban') {
      targetUser.isShadowBanned = value !== undefined ? value : !targetUser.isShadowBanned;
      auditAction = targetUser.isShadowBanned ? 'USER_SHADOWBANNED' : 'USER_SHADOWBAN_REMOVED';
    } else if (action === 'toggleVerifiedBadge') {
      targetUser.isVerifiedBadge = value !== undefined ? value : !targetUser.isVerifiedBadge;
      targetUser.badgeType = targetUser.isVerifiedBadge ? 'verified_developer' : 'none';
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
        badgeType: targetUser.badgeType,
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
    targetUser.badgeType = targetUser.isVerifiedBadge ? 'verified_developer' : 'none';
    await targetUser.save();

    await logAuditAction(
      req,
      targetUser.isVerifiedBadge ? 'USER_BADGE_GRANTED' : 'USER_BADGE_REVOKED',
      { entityType: 'User', entityId: targetUser._id, targetEmail: targetUser.email, targetName: targetUser.name },
      { isVerifiedBadge: targetUser.isVerifiedBadge, badgeType: targetUser.badgeType }
    );

    res.json({
      message: `Verified badge ${targetUser.isVerifiedBadge ? 'granted' : 'revoked'} successfully`,
      isVerifiedBadge: targetUser.isVerifiedBadge,
      badgeType: targetUser.badgeType,
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

// @desc    Revoke All Active Mobile & Web Sessions ($O(1) Token Version Invalidation)
// @route   POST /api/admin/users/:id/revoke-sessions
// @access  Private (Super Admin)
const revokeUserSessions = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    targetUser.refreshToken = null;
    await targetUser.save();

    // Disconnect active socket connections
    try {
      getIo().to(targetUser._id.toString()).emit('force_logout', {
        reason: 'Your sessions have been remotely terminated by security administrator.',
      });
    } catch (sockErr) {
      console.warn('Socket force_logout emit skipped:', sockErr.message);
    }

    await logAuditAction(
      req,
      'USER_SESSIONS_REVOKED',
      { entityType: 'User', entityId: targetUser._id, targetEmail: targetUser.email, targetName: targetUser.name },
      { reason: req.body?.reason || 'Administrative session revocation', newTokenVersion: targetUser.tokenVersion }
    );

    res.json({
      message: 'All active sessions for this user have been terminated successfully.',
      tokenVersion: targetUser.tokenVersion,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Reported Posts Moderation Queue
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReportedContent = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { reportsCount: { $gt: 0 } };

    if (category && category !== 'all') {
      query['reports.category'] = category;
    }

    const reportedPosts = await Post.find(query)
      .populate('author', 'name email avatar role isVerifiedBadge strikesCount isSuspended createdAt')
      .populate('reports.user', 'name email avatar')
      .populate('reports.reporter', 'name email avatar')
      .sort({ reportsCount: -1, updatedAt: -1 })
      .lean();

    res.json({ reportedPosts });
  } catch (error) {
    console.error('Error in getReportedContent:', error);
    res.status(500).json({ message: 'Failed to fetch reported content' });
  }
};

// @desc    Moderate Reported Post (Dismiss, Delete, Strike, Ban, or Shadow-filter)
// @route   POST /api/admin/reports/:id/action
// @access  Private (Admin)
const moderateReportedPost = async (req, res) => {
  try {
    const { action, reason } = req.body; // 'dismiss' | 'delete' | 'delete_and_strike' | 'delete_and_ban' | 'shadow_filter'
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Reported post not found or already deleted' });
    }

    const author = await User.findById(post.author);

    if (action === 'dismiss') {
      post.reports = [];
      post.reportsCount = 0;
      post.isFlagged = false;
      post.isReported = false;
      await post.save();

      await logAuditAction(
        req,
        'REPORT_DISMISSED',
        { entityType: 'Post', entityId: post._id },
        { action: 'dismiss', reason: reason || 'Dismissed as false report' }
      );

      return res.json({ message: 'Reports dismissed and post cleared successfully', postId: post._id });
    }

    if (action === 'delete') {
      const postId = post._id;
      await Post.findByIdAndDelete(post._id);

      if (author) {
        await Notification.create({
          recipient: author._id,
          sender: req.user._id,
          type: 'admin_notice',
          title: 'Post Removed by Trust & Safety',
          message: `Your post was removed for violating community guidelines. Justification: "${reason || 'Unspecified policy violation'}"`,
          read: false,
        });
      }

      try {
        getIo().emit('post_deleted', { postId });
      } catch (sockErr) {
        console.warn('Socket post_deleted emit skipped:', sockErr.message);
      }

      await logAuditAction(
        req,
        'POST_DELETED_BY_ADMIN',
        { entityType: 'Post', entityId: postId },
        { action: 'delete', reason, authorId: post.author, authorEmail: author?.email }
      );

      return res.json({ message: 'Post deleted and removed from all feeds', postId });
    }

    if (action === 'delete_and_strike') {
      const postId = post._id;
      await Post.findByIdAndDelete(post._id);

      let autoSuspended = false;
      if (author) {
        author.strikesCount = (author.strikesCount || 0) + 1;
        author.warnings = author.warnings || [];
        author.warnings.unshift({
          reason: `Content violation on post: ${reason || 'Inappropriate content'}`,
          issuedBy: req.user._id,
          issuedAt: new Date(),
        });

        if (author.strikesCount >= 3) {
          author.isSuspended = true;
          author.suspendedReason = `Account automatically suspended after reaching 3 strikes. Latest strike on post removal: ${reason}`;
          author.suspendedAt = new Date();
          author.tokenVersion = (author.tokenVersion || 0) + 1;
          autoSuspended = true;
        }

        await author.save();

        await Notification.create({
          recipient: author._id,
          sender: req.user._id,
          type: 'admin_notice',
          title: `Post Removed & Official Strike #${author.strikesCount} Issued`,
          message: `Your post was removed and a strike was recorded: "${reason || 'Policy breach'}". ${autoSuspended ? 'Your account has been suspended.' : ''}`,
          read: false,
        });
      }

      try {
        getIo().emit('post_deleted', { postId });
      } catch (sockErr) {
        console.warn('Socket post_deleted emit skipped:', sockErr.message);
      }

      await logAuditAction(
        req,
        'POST_DELETED_AND_STRIKE_ISSUED',
        { entityType: 'Post', entityId: postId },
        { action: 'delete_and_strike', reason, authorId: post.author, strikesCount: author?.strikesCount, autoSuspended }
      );

      return res.json({
        message: `Post deleted and Strike #${author?.strikesCount || 1} issued to author.${autoSuspended ? ' Author account suspended!' : ''}`,
        postId,
        strikesCount: author?.strikesCount,
      });
    }

    if (action === 'delete_and_ban') {
      const postId = post._id;
      await Promise.all([
        Post.findByIdAndDelete(post._id),
        User.findByIdAndUpdate(post.author, {
          isSuspended: true,
          suspendedReason: reason || 'Severe content violation resulting in immediate account ban.',
          suspendedAt: new Date(),
          $inc: { tokenVersion: 1 },
        }),
      ]);

      try {
        getIo().emit('post_deleted', { postId });
        getIo().to(post.author.toString()).emit('force_logout', {
          reason: 'Your account was suspended due to severe content violations.',
        });
      } catch (sockErr) {
        console.warn('Socket force_logout emit skipped:', sockErr.message);
      }

      await logAuditAction(
        req,
        'POST_DELETED_AND_AUTHOR_BANNED',
        { entityType: 'Post', entityId: postId },
        { action: 'delete_and_ban', reason, authorId: post.author }
      );

      return res.json({ message: 'Post deleted and author permanently suspended', postId });
    }

    if (action === 'shadow_filter') {
      post.isShadowFiltered = true;
      post.isFlagged = false;
      post.reports = [];
      post.reportsCount = 0;
      await post.save();

      await logAuditAction(
        req,
        'POST_SHADOW_FILTERED',
        { entityType: 'Post', entityId: post._id },
        { action: 'shadow_filter', reason }
      );

      return res.json({ message: 'Post placed in stealth shadow-filter', postId: post._id });
    }

    return res.status(400).json({ message: 'Invalid moderation action specified' });
  } catch (error) {
    console.error('Error in moderateReportedPost:', error);
    res.status(500).json({ message: 'Failed to execute moderation action' });
  }
};

// @desc    Broadcast Notification Across Network
// @route   POST /api/admin/broadcast
// @access  Private (Admin)
const broadcastNotification = async (req, res) => {
  try {
    const { title, message, type, link } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Broadcast message is required' });
    }

    const broadcastPayload = {
      title: title || 'DevHub Announcement',
      message,
      type: type || 'system_alert',
      link: link || null,
      timestamp: new Date().toISOString(),
    };

    // Emit live WebSocket event
    try {
      getIo().emit('global_broadcast', broadcastPayload);
    } catch (sockErr) {
      console.warn('Socket broadcast emit failed:', sockErr.message);
    }

    await logAuditAction(
      req,
      'GLOBAL_BROADCAST_SENT',
      { entityType: 'System', entityId: null },
      broadcastPayload
    );

    res.json({ message: 'Broadcast announcement dispatched live to all users' });
  } catch (error) {
    console.error('Error in broadcastNotification:', error);
    res.status(500).json({ message: 'Failed to broadcast notification' });
  }
};

// @desc    Get Dynamic Mobile App Configuration
// @route   GET /api/admin/app-config
// @access  Private (Admin)
const getAppConfig = async (req, res) => {
  try {
    let config = await AppConfig.findOne({ key: 'global_config' }).lean();
    if (!config) {
      config = await AppConfig.create({
        key: 'global_config',
        android: { minVersion: '1.0.0', latestVersion: '1.0.0', forceUpdate: false, storeUrl: '' },
        ios: { minVersion: '1.0.0', latestVersion: '1.0.0', forceUpdate: false, storeUrl: '' },
        maintenanceMode: { enabled: false, message: 'Platform under scheduled maintenance' },
        featureFlags: { codeSharing: true, videoUploads: true, directMessaging: true },
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Dynamic Mobile App Configuration
// @route   PUT /api/admin/app-config
// @access  Private (Super Admin)
const updateAppConfig = async (req, res) => {
  try {
    const { android, ios, maintenanceMode, featureFlags } = req.body;
    let config = await AppConfig.findOne({ key: 'global_config' });

    if (!config) {
      config = new AppConfig({ key: 'global_config' });
    }

    if (android) config.android = { ...config.android, ...android };
    if (ios) config.ios = { ...config.ios, ...ios };
    if (maintenanceMode) config.maintenanceMode = { ...config.maintenanceMode, ...maintenanceMode };
    if (featureFlags) config.featureFlags = { ...config.featureFlags, ...featureFlags };

    await config.save();

    await logAuditAction(
      req,
      'APP_CONFIG_UPDATED',
      { entityType: 'AppConfig', entityId: config._id },
      { android: config.android, ios: config.ios, maintenanceMode: config.maintenanceMode }
    );

    res.json({ message: 'Mobile app configuration updated successfully', config });
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
    const { category, reason, comment } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const currentUserId = req.user._id ? req.user._id.toString() : req.user.id;
    const alreadyReported = post.reports.some(
      (r) => (r.user && r.user.toString() === currentUserId) || (r.reporter && r.reporter.toString() === currentUserId)
    );

    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    const selectedCategory = category || 'spam';
    post.reports.push({
      user: currentUserId,
      reporter: currentUserId,
      category: selectedCategory,
      reason: reason || selectedCategory,
      comment: comment || '',
      reportedAt: new Date(),
    });
    post.reportsCount = (post.reportsCount || 0) + 1;
    post.isFlagged = true;
    post.isReported = true;

    await post.save();

    // Alert Admin Operations Sentinel via Socket
    try {
      getIo().emit('new_post_reported', {
        postId: post._id,
        category: selectedCategory,
        reportsCount: post.reportsCount,
      });
    } catch (sockErr) {
      console.warn('Socket report notification emit skipped:', sockErr.message);
    }

    res.json({
      message: 'Thank you. The content has been reported to the Trust & Safety team for review.',
      reportsCount: post.reportsCount,
    });
  } catch (error) {
    console.error('Error in reportPostByUser:', error);
    res.status(500).json({ message: 'Failed to submit report' });
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
  broadcastNotification,
  getAppConfig,
  updateAppConfig,
  getPublicAppConfig,
  getAuditLogs,
  reportPostByUser,
};
