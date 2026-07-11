const Message = require('../models/Message');
const User = require('../models/User');
const { getIo, getReceiverSocketId } = require('../socket');

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

// @desc    Get message history with a specific user (paginated)
// @route   GET /api/messages/:userId?limit=30&before=<ISO date>
// @access  Private
const getMessages = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const { before } = req.query;

    const filter = {
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    };

    // Cursor: only fetch messages older than the given timestamp
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    // Fetch newest `limit + 1` (extra one tells us if more exist)
    const found = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name avatar' }
      })
      .populate('reactions.user', 'name avatar');

    const hasMore = found.length > limit;
    const page = hasMore ? found.slice(0, limit) : found;

    // Return oldest -> newest so the UI can append directly
    const messages = page.reverse();

    res.json({ messages, hasMore });
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
    const { text, attachment, replyTo } = req.body;
    if (!text && !attachment) {
      return res.status(400).json({ msg: 'Message text or attachment is required' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver: req.params.userId,
      ...(text && { text }),
      ...(attachment && { attachment }),
      ...(replyTo && { replyTo })
    });

    const savedMessage = await newMessage.save();

    // Populate sender info, replyTo, and reactions before emitting
    await savedMessage.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'replyTo', populate: { path: 'sender', select: 'name avatar' } },
      { path: 'reactions.user', select: 'name avatar' }
    ]);

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
    const result = await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );

    // Emit real-time read receipt to the sender
    if (result.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(req.params.userId);
      if (senderSocketId) {
        getIo().to(senderSocketId).emit('messagesRead', { readerId: req.user.id });
      }
    }

    res.json({ msg: 'Messages marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Edit a message (only sender, only text)
// @route   PUT /api/messages/message/:messageId
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Message text is required' });
    }

    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Only the sender can edit their own message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to edit this message' });
    }

    message.text = text;
    message.edited = true;
    const updated = await message.save();
    await updated.populate('sender', 'name avatar');

    // Notify the other participant in real time
    const receiverSocketId = getReceiverSocketId(message.receiver.toString());
    if (receiverSocketId) {
      getIo().to(receiverSocketId).emit('messageEdited', updated);
    }

    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a message (only sender)
// @route   DELETE /api/messages/message/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Only the sender can delete their own message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this message' });
    }

    const receiverId = message.receiver.toString();
    await message.deleteOne();

    // Notify the other participant in real time
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      getIo().to(receiverSocketId).emit('messageDeleted', { messageId: req.params.messageId });
    }

    res.json({ msg: 'Message deleted', messageId: req.params.messageId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Toggle an emoji reaction on a message
// @route   POST /api/messages/react/:messageId
// @access  Private
const toggleReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) {
      return res.status(400).json({ msg: 'Emoji is required' });
    }

    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    const userId = req.user.id;
    // Check if the user already has this exact emoji reaction on this message
    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId && r.emoji === emoji
    );

    const added = existingIndex === -1;
    if (existingIndex > -1) {
      // Remove it (toggle off)
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add it (toggle on)
      message.reactions.push({ user: userId, emoji });
    }

    const updated = await message.save();
    await updated.populate('reactions.user', 'name avatar');

    // Notify participants
    const participants = [updated.sender.toString(), updated.receiver.toString()];
    participants.forEach((pId) => {
      const pSocket = getReceiverSocketId(pId);
      if (pSocket) {
        getIo().to(pSocket).emit('messageReacted', {
          messageId: updated._id,
          reactions: updated.reactions,
          reactorId: userId,
          reactorName: req.user.name,
          emoji,
          messageSenderId: updated.sender.toString(),
          added
        });
      }
    });

    res.json(updated.reactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Forward a message to target users
// @route   POST /api/messages/forward
// @access  Private
const forwardMessage = async (req, res) => {
  try {
    const { messageId, targetUserIds, comment } = req.body;
    if (!messageId || !targetUserIds || !Array.isArray(targetUserIds) || targetUserIds.length === 0) {
      return res.status(400).json({ msg: 'Original message ID and target user IDs are required' });
    }

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ msg: 'Original message not found' });
    }

    const forwardedMessages = [];

    for (const targetUserId of targetUserIds) {
      // 1. If there's an optional comment, send it as a preceding normal message
      if (comment && comment.trim()) {
        const commentMsg = new Message({
          sender: req.user.id,
          receiver: targetUserId,
          text: comment.trim()
        });
        const savedComment = await commentMsg.save();
        await savedComment.populate('sender', 'name avatar');
        
        const socketId = getReceiverSocketId(targetUserId);
        if (socketId) {
          getIo().to(socketId).emit('messageReceived', savedComment);
        }
      }

      // 2. Clone and save the forwarded message
      const forwardMsg = new Message({
        sender: req.user.id,
        receiver: targetUserId,
        text: originalMessage.text,
        attachment: originalMessage.attachment,
        forwarded: true
      });
      const savedForward = await forwardMsg.save();
      await savedForward.populate('sender', 'name avatar');

      const socketId = getReceiverSocketId(targetUserId);
      if (socketId) {
        getIo().to(socketId).emit('messageReceived', savedForward);
      }

      forwardedMessages.push(savedForward);
    }

    res.json({ msg: 'Message forwarded successfully', messages: forwardedMessages });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markAsRead, 
  editMessage, 
  deleteMessage,
  toggleReaction,
  forwardMessage
};
