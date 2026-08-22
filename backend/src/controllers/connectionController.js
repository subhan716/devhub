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
    const conn = await prisma.connection.updateMany({
      where: {
        id: req.params.requestId,
        recipientId: req.user.id
      },
      data: { status: 'accepted' }
    });
    res.json({ success: true });
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

const getPendingRequests = async (req, res) => {
  try {
    const requests = await prisma.connection.findMany({
      where: {
        recipientId: req.user.id,
        status: 'pending'
      },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true, profile: true } }
      }
    });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest: async (req, res) => res.json({ success: true }),
  getConnections,
  getPendingRequests
};
