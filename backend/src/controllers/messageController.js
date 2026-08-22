const prisma = require('../config/prisma');
const { getIo } = require('../socket');

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerifiedBadge: true,
            badgeType: true,
            profile: { select: { status: true } }
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerifiedBadge: true,
            badgeType: true,
            profile: { select: { status: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const userMap = new Map();
    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (otherUser && !userMap.has(otherUser.id)) {
        const avatar = otherUser.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
        userMap.set(otherUser.id, {
          _id: otherUser.id,
          id: otherUser.id,
          user: {
            ...otherUser,
            _id: otherUser.id,
            avatar: { url: avatar },
            avatarUrl: avatar
          },
          lastMessage: {
            text: msg.text,
            createdAt: msg.createdAt,
            read: msg.read
          }
        });
      }
    }

    res.json(Array.from(userMap.values()));
  } catch (err) {
    console.error('Error in getConversations:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    const cursor = req.query.cursor || req.query.before;
    const limit = parseInt(req.query.limit) || 50;

    let queryArgs = {
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      take: limit
    };

    if (cursor) {
      if (cursor.includes('T') || cursor.includes('-')) {
        queryArgs.where.createdAt = { lt: new Date(cursor) };
      } else {
        queryArgs.cursor = { id: cursor };
        queryArgs.skip = 1;
      }
    }

    const messages = await prisma.message.findMany(queryArgs);

    // Auto mark received messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        read: false
      },
      data: { read: true }
    });

    const formatted = messages.map(m => ({
      _id: m.id,
      id: m.id,
      sender: m.senderId,
      receiver: m.receiverId,
      recipient: m.receiverId,
      text: m.text || '',
      attachment: m.attachment || null,
      reactions: Array.isArray(m.reactions) ? m.reactions : [],
      forwarded: m.forwarded || false,
      read: m.read,
      createdAt: m.createdAt
    }));

    // Return both formatted object with messages property AND array-compatible response
    res.json({
      messages: formatted,
      hasMore: formatted.length >= limit
    });
  } catch (err) {
    console.error('Error in getMessages:', err);
    res.status(500).json({ message: 'Server Error', messages: [] });
  }
};

const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId || req.body.receiverId || req.body.recipientId;
    const { text, attachment } = req.body;

    if (!targetUserId || !text) {
      return res.status(400).json({ message: 'Recipient and text are required' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: currentUserId,
        receiverId: targetUserId,
        text,
        attachment: attachment || undefined
      }
    });

    const payload = {
      _id: message.id,
      id: message.id,
      sender: message.senderId,
      receiver: message.receiverId,
      recipient: message.receiverId,
      text: message.text,
      attachment: message.attachment,
      read: message.read,
      createdAt: message.createdAt
    };

    try {
      const io = getIo();
      if (io) {
        io.to(targetUserId).emit('messageReceived', payload);
      }
    } catch (sErr) {}

    res.status(201).json(payload);
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const senderId = req.params.userId;

    await prisma.message.updateMany({
      where: {
        senderId: senderId,
        receiverId: currentUserId,
        read: false
      },
      data: { read: true }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (msg.senderId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { text, edited: true }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (msg.senderId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await prisma.message.delete({ where: { id: messageId } });
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { recipientId } = req.body;
    const original = await prisma.message.findUnique({ where: { id: messageId } });
    if (!original) return res.status(404).json({ message: 'Original message not found' });

    const forwarded = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: recipientId,
        text: original.text,
        forwarded: true,
        attachment: original.attachment || undefined
      }
    });

    res.status(201).json({
      _id: forwarded.id,
      id: forwarded.id,
      sender: forwarded.senderId,
      receiver: forwarded.receiverId,
      text: forwarded.text,
      forwarded: true,
      createdAt: forwarded.createdAt
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    let reactions = Array.isArray(msg.reactions) ? msg.reactions : [];
    const exists = reactions.find(r => r.userId === req.user.id && r.emoji === emoji);

    if (exists) {
      reactions = reactions.filter(r => !(r.userId === req.user.id && r.emoji === emoji));
    } else {
      reactions.push({ userId: req.user.id, emoji, createdAt: new Date() });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { reactions }
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  editMessage,
  deleteMessage,
  forwardMessage,
  toggleReaction
};
