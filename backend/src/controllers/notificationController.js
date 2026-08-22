const prisma = require('../config/prisma');

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        relatedPost: true
      },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    res.json(notifications.map(n => ({
      _id: n.id,
      id: n.id,
      sender: n.sender,
      type: n.type,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt
    })));
  } catch (err) {
    console.error('Error in getNotifications:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, id: req.params.id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
