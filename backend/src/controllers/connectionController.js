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
    const requests = await prisma.connection.findMany({
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

    res.json(requests.map(r => {
      const avatarUrl = r.requester.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        ...r,
        _id: r.id,
        requester: {
          ...r.requester,
          _id: r.requester.id,
          avatar: { url: avatarUrl },
          avatarUrl: avatarUrl
        }
      };
    }));
  } catch (e) {
    res.status(500).json({ message: e.message });
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
        requester: { select: { id: true, name: true, avatarUrl: true, profile: true } },
        recipient: { select: { id: true, name: true, avatarUrl: true, profile: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const peers = connections.map(c => {
      const peer = c.requesterId === userId ? c.recipient : c.requester;
      const avatarUrl = peer.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        _id: peer.id,
        id: peer.id,
        name: peer.name,
        avatar: { url: avatarUrl },
        avatarUrl: avatarUrl,
        role: peer.profile?.status || 'Developer',
        profile: peer.profile
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
        requester: { select: { id: true, name: true, avatarUrl: true, profile: true } },
        recipient: { select: { id: true, name: true, avatarUrl: true, profile: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const peers = connections.map(c => {
      const peer = c.requesterId === userId ? c.recipient : c.requester;
      const avatarUrl = peer.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        _id: peer.id,
        id: peer.id,
        name: peer.name,
        avatar: { url: avatarUrl },
        avatarUrl: avatarUrl,
        role: peer.profile?.status || 'Developer',
        profile: peer.profile
      };
    });

    res.json(peers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Smart Pre-Computed Social Graph Caching (SuggestionCache)
const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Check existing unexpired SuggestionCache
    const cached = await prisma.suggestionCache.findUnique({ where: { userId } }).catch(() => null);
    if (cached && new Date(cached.expiresAt) > new Date() && Array.isArray(cached.suggestions) && cached.suggestions.length > 0) {
      return res.json(cached.suggestions);
    }

    // 2. Fast DB fallback and pre-computation
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        isSuspended: false
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isVerifiedBadge: true,
        badgeType: true,
        profile: { select: { status: true, company: true, githubusername: true } }
      },
      take: 10
    });

    const suggestions = users.map(u => {
      const avatarUrl = u.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        _id: u.id,
        id: u.id,
        name: u.name,
        avatar: { url: avatarUrl },
        avatarUrl: avatarUrl,
        isVerifiedBadge: u.isVerifiedBadge,
        badgeType: u.badgeType,
        role: u.profile?.status || 'Developer',
        profile: u.profile
      };
    });

    // 3. Asynchronously persist to SuggestionCache (TTL: 2 Hours)
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    prisma.suggestionCache.upsert({
      where: { userId },
      update: { suggestions, expiresAt, lastCalculatedAt: new Date() },
      create: { userId, suggestions, expiresAt }
    }).catch(e => console.error('SuggestionCache save error:', e.message));

    res.json(suggestions);
  } catch (e) {
    res.status(500).json({ message: e.message });
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
