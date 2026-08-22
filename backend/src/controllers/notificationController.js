const prisma = require('../config/prisma');

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerifiedBadge: true,
            badgeType: true
          }
        },
        relatedPost: { select: { id: true, content: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(notifications.map(n => {
      const sAvatar = n.sender?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        _id: n.id,
        id: n.id,
        type: n.type,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
        sender: n.sender ? {
          _id: n.sender.id,
          id: n.sender.id,
          name: n.sender.name,
          avatar: { url: sAvatar },
          avatarUrl: sAvatar,
          isVerifiedBadge: n.sender.isVerifiedBadge,
          badgeType: n.sender.badgeType
        } : null,
        post: n.relatedPost ? { _id: n.relatedPost.id, id: n.relatedPost.id, content: n.relatedPost.content } : null
      };
    }));
  } catch (err) {
    console.error('Error in getNotifications:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, recipientId: req.user.id },
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
      where: { recipientId: req.user.id, read: false },
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
