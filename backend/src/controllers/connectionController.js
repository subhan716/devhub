const Connection = require('../models/Connection');
const User = require('../models/User');
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
      return res.status(400).json({ message: `Connection already exists with status: ${existingConnection.status}` });
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

// @desc    Reject connection request
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

    if (connection.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject request with status: ${connection.status}` });
    }

    connection.status = 'rejected';
    await connection.save();

    res.status(200).json({ message: 'Request rejected' });
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
        { requester: userId, recipient: otherUserId, status: 'accepted' },
        { requester: otherUserId, recipient: userId, status: 'accepted' },
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

    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'name avatar email role');

    // Format the response to just return a list of connected users
    const connectedUsers = connections.map(conn => {
      const otherUser = conn.requester._id.toString() === userId.toString() ? conn.recipient : conn.requester;
      return {
        connectionId: conn._id,
        user: otherUser,
        connectedAt: conn.updatedAt
      };
    });

    res.status(200).json(connectedUsers);
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

    // Get all connections (pending, accepted, rejected)
    const existingConnections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }]
    });

    const excludeUserIds = existingConnections.reduce((acc, conn) => {
      acc.push(conn.requester.toString());
      acc.push(conn.recipient.toString());
      return acc;
    }, [userId.toString()]); // Also exclude the current user

    // Find users who are not in the exclude list
    const suggestions = await User.find({
      _id: { $nin: excludeUserIds }
    })
      .select('name avatar role')
      .limit(10);

    res.status(200).json(suggestions);
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
  getSuggestions
};
