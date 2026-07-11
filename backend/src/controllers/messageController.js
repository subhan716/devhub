const Message = require('../models/Message');
const User = require('../models/User');
const { getIo } = require('../socket');

// @desc    Get all conversations (users you have chatted with)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    // Extract unique user IDs that are not the current user
    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== userId) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== userId) userIds.add(msg.receiver.toString());
    });

    // Fetch user details for those IDs
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name avatar');

    // Attach the latest message for each conversation
    const conversations = users.map(user => {
      const latestMsg = messages.find(
        m => (m.sender.toString() === user._id.toString() || m.receiver.toString() === user._id.toString())
      );
      return {
        user,
        latestMessage: latestMsg
      };
    });

    // Sort conversations by latest message timestamp
    conversations.sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get message history with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 }); // Oldest to newest for chat history

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Send a new message
// @route   POST /api/messages/:userId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { text, attachment } = req.body;
    if (!text && !attachment) {
      return res.status(400).json({ msg: 'Message text or attachment is required' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver: req.params.userId,
      ...(text && { text }),
      ...(attachment && { attachment })
    });

    const savedMessage = await newMessage.save();

    // Populate sender info before emitting
    await savedMessage.populate('sender', 'name avatar');

    // Return the saved message so sender can update UI
    res.status(201).json(savedMessage);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:userId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    // Find messages sent BY userId TO current user and mark them read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ msg: 'Messages marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getConversations, getMessages, sendMessage, markAsRead };
