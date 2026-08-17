const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');
const Connection = require('../models/Connection');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { getIo } = require('../socket');

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
      pendingReportsCount
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isVerifiedBadge: true }),
      User.countDocuments({ isSuspended: true }),
      Post.countDocuments({}),
      Connection.countDocuments({ status: 'accepted' }),
      Message.countDocuments({}),
      Post.countDocuments({ reportsCount: { $gt: 0 } })
    ]);

    // Calculate Signups in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate Posts in the last 7 days
    const recentPosts = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      summary: {
        totalUsers,
        totalVerified,
        totalSuspended,
        totalPosts,
        totalConnections,
        totalMessages,
        pendingReportsCount
      },
      trends: {
        signups: recentSignups,
        posts: recentPosts
      }
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
        { email: { $regex: search, $options: 'i' } }
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
    const userIds = users.map(u => u._id);
    const profiles = await Profile.find({ user: { $in: userIds } }).select('user status company location').lean();
    const profileMap = new Map(profiles.map(p => [p.user.toString(), p]));

    const enrichedUsers = users.map(u => ({
      ...u,
      profile: profileMap.get(u._id.toString()) || null
    }));

    res.json({
      users: enrichedUsers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
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

    if (action === 'toggleSuspend') {
      targetUser.isSuspended = value !== undefined ? value : !targetUser.isSuspended;
      targetUser.suspensionReason = targetUser.isSuspended ? (reason || 'Violation of terms') : null;
    } else if (action === 'toggleShadowban') {
      targetUser.isShadowBanned = value !== undefined ? value : !targetUser.isShadowBanned;
    } else if (action === 'toggleVerifiedBadge') {
      targetUser.isVerifiedBadge = value !== undefined ? value : !targetUser.isVerifiedBadge;
    } else if (action === 'changeRole') {
      if (['user', 'moderator', 'admin'].includes(value)) {
        targetUser.role = value;
      } else if (value === 'super_admin' && req.user.role === 'super_admin') {
        targetUser.role = value;
      } else {
        return res.status(400).json({ message: 'Invalid role assignment' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid action specified' });
    }

    await targetUser.save();

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
        suspensionReason: targetUser.suspensionReason
      }
    });
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    res.status(500).json({ message: 'Failed to update user status' });
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
    const { action } = req.body; // 'dismiss' | 'delete' | 'delete_and_ban'
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
      return res.json({ message: 'Reports dismissed successfully', postId: post._id });
    }

    if (action === 'delete') {
      await Post.findByIdAndDelete(post._id);
      return res.json({ message: 'Post deleted successfully', postId: post._id });
    }

    if (action === 'delete_and_ban') {
      await Promise.all([
        Post.findByIdAndDelete(post._id),
        User.findByIdAndUpdate(post.author, {
          isSuspended: true,
          suspensionReason: 'Severe violation of community guidelines via posted content.'
        })
      ]);
      return res.json({ message: 'Post deleted and author suspended', postId: post._id });
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
      timestamp: new Date()
    };

    // Emit live WebSocket event across all connected sockets
    const io = getIo();
    if (io) {
      io.emit('globalAnnouncement', payload);
    }

    res.json({ message: 'Broadcast sent successfully', payload });
  } catch (error) {
    console.error('Error in broadcastNotification:', error);
    res.status(500).json({ message: 'Failed to send broadcast' });
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

    const alreadyReported = post.reports.some(
      r => r.user.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    post.reports.push({
      user: req.user.id,
      reason: reason || 'spam',
      comment: comment || '',
      reportedAt: new Date()
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
  getReportedContent,
  moderateReportedPost,
  broadcastNotification,
  reportPostByUser
};
