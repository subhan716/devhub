const prisma = require('../config/prisma');

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

    res.status(201).json(conn);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    await prisma.connection.updateMany({
      where: { id: requestId, recipientId: req.user.id },
      data: { status: 'accepted' }
    });
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
        requester: { select: { id: true, name: true, avatarUrl: true, profile: true } }
      }
    });
    res.json(requests);
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
      }
    });

    const peers = connections.map(c => c.requesterId === userId ? c.recipient : c.requester);
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
      }
    });

    const peers = connections.map(c => c.requesterId === userId ? c.recipient : c.requester);
    res.json(peers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
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
        profile: true
      },
      take: 10
    });
    res.json(users);
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
