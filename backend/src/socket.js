const socketIo = require('socket.io');
const prisma = require('./config/prisma');

let io;
const onlineUsers = new Map(); // { userId: socketId }
const userStatusPrefs = new Map(); // { userId: 'online' | 'invisible' }

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'https://devhub-sub.vercel.app',
        'https://devhub-admin.vercel.app'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Register user to personal room
    socket.on('setup', (userId) => {
      if (userId) {
        socket.join(userId);
        onlineUsers.set(userId, socket.id);
        emitOnlineUsers();
      }
    });

    // Invisible mode toggle
    socket.on('setStatusPref', async ({ userId, status }) => {
      if (userId && status) {
        userStatusPrefs.set(userId, status);
        emitOnlineUsers();
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { statusPreference: status }
          });
        } catch (err) {
          console.error('Error saving status preference to PostgreSQL:', err.message);
        }
      }
    });

    // Real-time Chat message forwarding
    socket.on('sendMessage', (message) => {
      const recipientId = message.receiver || message.recipient || message.receiverId;
      if (recipientId) {
        io.to(recipientId).emit('messageReceived', message);
      }
    });

    // Real-time Typing indicators
    socket.on('typing', ({ senderId, receiverId }) => {
      if (receiverId) {
        io.to(receiverId).emit('typing', senderId);
      }
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
      if (receiverId) {
        io.to(receiverId).emit('stopTyping', senderId);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      emitOnlineUsers();
    });
  });
};

const emitOnlineUsers = () => {
  const visibleUsers = Array.from(onlineUsers.keys()).filter(
    userId => userStatusPrefs.get(userId) !== 'invisible'
  );
  if (io) {
    io.emit('getOnlineUsers', visibleUsers);
  }
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIo
};
