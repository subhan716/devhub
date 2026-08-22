const prisma = require('../config/prisma');
const { getIo } = require('../socket');

const sendConnectionRequest = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.body.recipientId;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const conn = await prisma.connection.upsert({
      where: {
        requesterId_recipientId: {
          requesterId: currentUserId,
          recipientId: targetUserId
        }
      },
      update: { status: 'pending' },
      create: {
        requesterId: currentUserId,
        recipientId: targetUserId,
        status: 'pending'
      }
    });

    try {
      const notif = await prisma.notification.create({
        data: {
          recipientId: targetUserId,
          senderId: currentUserId,
          type: 'connection_request',
          message: 'sent you a connection request'
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } }
        }
      });

      const io = getIo();
      if (io) {
        io.to(targetUserId).emit('newNotification', {
          ...notif,
          _id: notif.id,
          sender: {
            ...notif.sender,
            _id: notif.sender.id,
            avatar: { url: notif.sender.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }
          }
        });
      }
    } catch (nErr) {}

    res.status(201).json(conn);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const conn = await prisma.connection.findUnique({ where: { id: requestId } });
    if (!conn) return res.status(404).json({ message: 'Request not found' });

    await prisma.connection.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });

    try {
      const notif = await prisma.notification.create({
        data: {
          recipientId: conn.requesterId,
          senderId: req.user.id,
          type: 'connection_accepted',
          message: 'accepted your connection request'
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } }
        }
      });

      const io = getIo();
      if (io) {
        io.to(conn.requesterId).emit('newNotification', {
          ...notif,
          _id: notif.id,
          sender: {
            ...notif.sender,
            _id: notif.sender.id,
            avatar: { url: notif.sender.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }
          }
        });
      }
    } catch (nErr) {}

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    await prisma.connection.deleteMany({
      where: { id: requestId, recipientId: req.user.id }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const removeConnection = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    await prisma.connection.deleteMany({
      where: {
        OR: [
          { requesterId: currentUserId, recipientId: targetUserId },
          { requesterId: targetUserId, recipientId: currentUserId }
        ]
      }
    });
    res.json({ message: 'Connection removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const received = await prisma.connection.findMany({
      where: { recipientId: req.user.id, status: 'pending' },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            profile: { select: { status: true, company: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const sent = await prisma.connection.findMany({
      where: { requesterId: req.user.id, status: 'pending' },
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            profile: { select: { status: true, company: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatReq = (r, userField) => {
      const u = r[userField] || {};
      const avatarUrl = u.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        ...r,
        _id: r.id,
        id: r.id,
        [userField]: {
          ...u,
          _id: u.id,
          id: u.id,
          avatar: { url: avatarUrl },
          avatarUrl: avatarUrl
        }
      };
    };

    res.json({
      received: received.map(r => formatReq(r, 'requester')),
      sent: sent.map(r => formatReq(r, 'recipient'))
    });
  } catch (e) {
    res.status(500).json({ received: [], sent: [], message: e.message });
  }
};

const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const connections = await prisma.connection.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { recipientId: userId }]
      },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true, profile: true } },
        recipient: { select: { id: true, name: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true, profile: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const peers = connections.map(c => {
      const peer = c.requesterId === userId ? c.recipient : c.requester;
      const avatarUrl = peer.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      const userObj = {
        _id: peer.id,
        id: peer.id,
        name: peer.name,
        avatar: { url: avatarUrl },
        avatarUrl: avatarUrl,
        bio: peer.profile?.bio || '',
        status: peer.profile?.status || 'Developer',
        role: peer.profile?.status || 'Developer',
        location: peer.profile?.location || '',
        isVerifiedBadge: peer.isVerifiedBadge || false,
        badgeType: peer.badgeType || 'none',
        profile: peer.profile
      };

      return {
        _id: c.id,
        id: c.id,
        connectionId: c.id,
        user: userObj,
        // Also provide top-level aliases so both conn.user.name and conn.name work cleanly
        ...userObj
      };
    });

    res.json(peers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getUserConnections = async (req, res) => {
  try {
    const userId = req.params.userId;
    const connections = await prisma.connection.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { recipientId: userId }]
      },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true, profile: true } },
        recipient: { select: { id: true, name: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true, profile: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const peers = connections.map(c => {
      const peer = c.requesterId === userId ? c.recipient : c.requester;
      const avatarUrl = peer.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      const userObj = {
        _id: peer.id,
        id: peer.id,
        name: peer.name,
        avatar: { url: avatarUrl },
        avatarUrl: avatarUrl,
        bio: peer.profile?.bio || '',
        status: peer.profile?.status || 'Developer',
        role: peer.profile?.status || 'Developer',
        location: peer.profile?.location || '',
        isVerifiedBadge: peer.isVerifiedBadge || false,
        badgeType: peer.badgeType || 'none',
        profile: peer.profile
      };

      return {
        _id: c.id,
        id: c.id,
        connectionId: c.id,
        user: userObj,
        ...userObj
      };
    });

    res.json(peers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get all user IDs that are already connected or pending
    const existingConnections = await prisma.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { recipientId: userId }]
      },
      select: { requesterId: true, recipientId: true }
    });

    const excludedUserIds = new Set([userId]);
    existingConnections.forEach(c => {
      excludedUserIds.add(c.requesterId);
      excludedUserIds.add(c.recipientId);
    });

    // 2. Query only real developer users (exclude admins, support, self, and existing connections)
    const users = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedUserIds) },
        isSuspended: false,
        role: 'user',
        email: {
          not: { contains: 'support@' }
        }
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isVerifiedBadge: true,
        badgeType: true,
        profile: { select: { status: true, company: true, githubusername: true, bio: true, location: true } }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    const suggestions = users.map(u => {
      const avatarUrl = u.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      const userObj = {
        _id: u.id,
        id: u.id,
        name: u.name,
        avatar: { url: avatarUrl },
        avatarUrl: avatarUrl,
        isVerifiedBadge: u.isVerifiedBadge,
        badgeType: u.badgeType,
        role: u.profile?.status || 'Developer',
        bio: u.profile?.bio || '',
        location: u.profile?.location || '',
        profile: u.profile
      };

      return {
        ...userObj,
        user: userObj
      };
    });

    res.json(suggestions);
  } catch (e) {
    console.error('Error in getSuggestions:', e);
    res.status(500).json([]);
  }
};

const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    const conn = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, recipientId: targetUserId },
          { requesterId: targetUserId, recipientId: currentUserId }
        ]
      }
    });

    if (!conn) return res.json({ status: 'none' });
    if (conn.status === 'accepted') return res.json({ status: 'connected' });
    if (conn.requesterId === currentUserId) return res.json({ status: 'pending_sent' });
    return res.json({ status: 'pending_received', requestId: conn.id });
  } catch (e) {
    res.status(500).json({ message: e.message });
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
