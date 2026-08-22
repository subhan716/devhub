const prisma = require('../config/prisma');

const sendMessage = async (req, res) => {
  try {
    const { recipientId, receiverId, text, attachment } = req.body;
    const targetUserId = receiverId || recipientId;

    if (!targetUserId || !text) {
      return res.status(400).json({ message: 'Recipient and text are required' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: targetUserId,
        text,
        attachment: attachment || undefined
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    res.status(201).json({
      _id: message.id,
      id: message.id,
      sender: message.senderId,
      receiver: message.receiverId,
      recipient: message.receiverId,
      text: message.text,
      read: message.read,
      createdAt: message.createdAt
    });
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages.map(m => ({
      _id: m.id,
      id: m.id,
      sender: m.senderId,
      receiver: m.receiverId,
      recipient: m.receiverId,
      text: m.text,
      read: m.read,
      createdAt: m.createdAt
    })));
  } catch (err) {
    console.error('Error in getMessages:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const userMap = new Map();
    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (otherUser && !userMap.has(otherUser.id)) {
        userMap.set(otherUser.id, {
          _id: otherUser.id,
          id: otherUser.id,
          user: otherUser,
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

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead: async (req, res) => res.json({ success: true })
};
