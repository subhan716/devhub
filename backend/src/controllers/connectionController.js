const mongoose = require('mongoose');
const Connection = require('../models/Connection');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const { getIo, getReceiverSocketId } = require('../socket');

// @desc    Send connection request
// @route   POST /api/network/connect/:userId
// @access  Private
const sendConnectionRequest = async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const requesterId = req.user._id;

    if (recipientId === requesterId.toString()) {
      return res.status(400).json({ message: 'You cannot connect with yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if a connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingConnection) {
      if (existingConnection.status === 'rejected') {
        // Clean up old rejected request and proceed to create a new one
        await Connection.findByIdAndDelete(existingConnection._id);
      } else {
        return res.status(400).json({ message: `Connection already exists with status: ${existingConnection.status}` });
      }
    }

    const newConnection = await Connection.create({
      requester: requesterId,
      recipient: recipientId,
    });

    // Create Notification
    const notification = await Notification.create({
      recipient: recipientId,
      sender: requesterId,
      type: 'connection_request',
      message: 'wants to connect with you.',
    });

    // Populate sender info for real-time emission
    const populatedNotif = await notification.populate('sender', 'name avatar');
    
    // Emit real-time notification
    const receiverSocketId = getReceiverSocketId(recipientId);
    if (receiverSocketId) {
      getIo().to(receiverSocketId).emit('newNotification', populatedNotif);
    }

    res.status(201).json(newConnection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept connection request
// @route   PUT /api/network/accept/:requestId
// @access  Private
const acceptConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.requestId);

    if (!connection) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Ensure the current user is the recipient
    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ message: `Cannot accept request with status: ${connection.status}` });
    }

    connection.status = 'accepted';
    await connection.save();

    // Create Notification for the requester (who sent the request)
    const notification = await Notification.create({
      recipient: connection.requester,
      sender: req.user._id, // The one who accepted
      type: 'connection_accepted',
      message: 'accepted your connection request.',
    });

    const populatedNotif = await notification.populate('sender', 'name avatar');
    
    // Emit real-time notification
    const receiverSocketId = getReceiverSocketId(connection.requester);
    if (receiverSocketId) {
      getIo().to(receiverSocketId).emit('newNotification', populatedNotif);
    }

    res.status(200).json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject (Ignore) connection request
// @route   PUT /api/network/reject/:requestId
// @access  Private
const rejectConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.requestId);

    if (!connection) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    // Completely delete the request so it resets the state
    await Connection.findByIdAndDelete(req.params.requestId);

    res.status(200).json({ message: 'Request ignored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove an accepted connection
// @route   DELETE /api/network/remove/:userId
// @access  Private
const removeConnection = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const userId = req.user._id;

    const connection = await Connection.findOneAndDelete({
      $or: [
        { requester: userId, recipient: otherUserId },
        { requester: otherUserId, recipient: userId },
      ],
    });

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    res.status(200).json({ message: 'Connection removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending connection requests (received and sent)
// @route   GET /api/network/pending
// @access  Private
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const receivedRequests = await Connection.find({ recipient: userId, status: 'pending' })
      .populate('requester', 'name avatar email')
      .sort('-createdAt');
      
    const sentRequests = await Connection.find({ requester: userId, status: 'pending' })
      .populate('recipient', 'name avatar email')
      .sort('-createdAt');

    res.status(200).json({ received: receivedRequests, sent: sentRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get accepted connections
// @route   GET /api/network/connections
// @access  Private
const getConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const limit = parseInt(req.query.limit) || 50;
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'name avatar email role').limit(limit);

    const connectedUsersMap = connections.map(conn => {
      return conn.requester._id.toString() === userId.toString() ? conn.recipient : conn.requester;
    });
    
    const userIds = connectedUsersMap.map(u => u._id);
    const profiles = await Profile.find({ user: { $in: userIds } }).select('user bio location status');

    // Format the response to just return a list of connected users
    const connectedUsers = connections.map(conn => {
      const otherUser = conn.requester._id.toString() === userId.toString() ? conn.recipient : conn.requester;
      const profile = profiles.find(p => p.user.toString() === otherUser._id.toString());
      
      return {
        connectionId: conn._id,
        user: {
          ...otherUser.toObject(),
          bio: profile ? profile.bio : '',
          location: profile ? profile.location : '',
          status: profile ? profile.status : ''
        },
        connectedAt: conn.updatedAt
      };
    });

    res.status(200).json(connectedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get accepted connections for any user
// @route   GET /api/network/connections/:userId
// @access  Private
const getUserConnections = async (req, res) => {
  try {
    const userId = req.params.userId;

    const limit = parseInt(req.query.limit) || 50;
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'name avatar email role').limit(limit);

    const connectedUsersMap = connections.map(conn => {
      return conn.requester._id.toString() === userId.toString() ? conn.recipient : conn.requester;
    });
    
    const userIds = connectedUsersMap.map(u => u._id);
    const profiles = await Profile.find({ user: { $in: userIds } }).select('user bio location status');

    // Format the response to just return a list of connected users
    const connectedUsers = connections.map(conn => {
      const otherUser = conn.requester._id.toString() === userId.toString() ? conn.recipient : conn.requester;
      const profile = profiles.find(p => p.user.toString() === otherUser._id.toString());
      
      return {
        connectionId: conn._id,
        user: {
          ...otherUser.toObject(),
          bio: profile ? profile.bio : '',
          location: profile ? profile.location : '',
          status: profile ? profile.status : ''
        },
        connectedAt: conn.updatedAt
      };
    });

    res.json(connectedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get suggested connections (users not connected and not pending)
// @route   GET /api/network/suggestions
// @access  Private
const getSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // 1. Get current user's 1st-degree connections (accepted or pending to exclude them)
    const directConnections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }]
    });

    const excludeIds = new Set([userId.toString()]);
    const firstDegreeIds = new Set();
    
    directConnections.forEach(conn => {
      const otherId = conn.requester.toString() === userId.toString() ? conn.recipient.toString() : conn.requester.toString();
      excludeIds.add(otherId);
      if (conn.status === 'accepted') {
        firstDegreeIds.add(otherId);
      }
    });

    const excludeObjectIds = Array.from(excludeIds).map(id => new mongoose.Types.ObjectId(id));
    const firstDegreeObjectIds = Array.from(firstDegreeIds).map(id => new mongoose.Types.ObjectId(id));

    let suggestions = [];

    // 2. Intelligent Mutual Connections Algorithm (2nd Degree Network)
    if (firstDegreeObjectIds.length > 0) {
      const mutualSuggestions = await Connection.aggregate([
        // Find connections where one of the parties is a 1st degree connection
        {
          $match: {
            status: 'accepted',
            $or: [
              { requester: { $in: firstDegreeObjectIds } },
              { recipient: { $in: firstDegreeObjectIds } }
            ]
          }
        },
        // Determine the ID of the 2nd degree connection
        {
          $project: {
            secondDegreeUser: {
              $cond: {
                if: { $in: ["$requester", firstDegreeObjectIds] },
                then: "$recipient",
                else: "$requester"
              }
            }
          }
        },
        // Exclude anyone already in our 1st degree network or ourselves
        {
          $match: {
            secondDegreeUser: { $nin: excludeObjectIds }
          }
        },
        // Group by the 2nd degree user and count mutuals!
        {
          $group: {
            _id: "$secondDegreeUser",
            mutualCount: { $sum: 1 }
          }
        },
        // Sort by highest mutual connections
        { $sort: { mutualCount: -1 } },
        { $limit: limit }
      ]);

      if (mutualSuggestions.length > 0) {
        const suggestionIds = mutualSuggestions.map(s => s._id);
        const usersInfo = await User.find({ _id: { $in: suggestionIds } }).select('name avatar role');
        
        // Merge with mutual count
        suggestions = usersInfo.map(user => {
          const match = mutualSuggestions.find(m => m._id.toString() === user._id.toString());
          return {
            ...user.toObject(),
            mutualConnections: match ? match.mutualCount : 0
          };
        }).sort((a, b) => b.mutualConnections - a.mutualConnections);
      }
    }

    // 3. Fallback: If not enough mutual connections, fill the rest with diverse sampling
    if (suggestions.length < limit) {
      const remainingLimit = limit - suggestions.length;
      
      // Update exclude list to avoid duplicates
      const currentSuggestionIds = suggestions.map(s => new mongoose.Types.ObjectId(s._id));
      const fullExcludeList = [...excludeObjectIds, ...currentSuggestionIds];

      const fallbackSuggestions = await User.aggregate([
        { $match: { _id: { $nin: fullExcludeList } } },
        { $sample: { size: remainingLimit } }, // Highly efficient randomized fallback
        { $project: { name: 1, avatar: 1, role: 1 } }
      ]);

      const formattedFallbacks = fallbackSuggestions.map(user => ({
        ...user,
        mutualConnections: 0
      }));

      suggestions = [...suggestions, ...formattedFallbacks];
    }

    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get connection status with a user
// @route   GET /api/network/status/:userId
// @access  Private
const getConnectionStatus = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const userId = req.user._id;

    if (otherUserId === userId.toString()) {
      return res.status(200).json({ status: 'self' });
    }

    const connection = await Connection.findOne({
      $or: [
        { requester: userId, recipient: otherUserId },
        { requester: otherUserId, recipient: userId },
      ],
    });

    if (!connection || connection.status === 'rejected') {
      return res.status(200).json({ status: 'none' });
    }

    res.status(200).json({ status: connection.status, requestId: connection._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getPendingRequests,
  getConnections,
  getUserConnections,
  getSuggestions,
  getConnectionStatus
};
