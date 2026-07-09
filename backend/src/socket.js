const socketIo = require('socket.io');
const User = require('./models/User');

let io;
// Keep track of connected users: { userId: socketId }
const onlineUsers = new Map();

// Optional: Keep track of user preferences (invisible mode)
// { userId: 'online' | 'invisible' }
const userStatusPrefs = new Map();

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: 'http://localhost:5173', // Vite default
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins and registers their userId
    socket.on('setup', (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      
      // Emit updated list of online users (excluding invisible ones)
      emitOnlineUsers();
    });

    // Toggle invisible mode
    socket.on('setStatusPref', async ({ userId, status }) => {
      userStatusPrefs.set(userId, status); // 'online' or 'invisible'
      emitOnlineUsers();
      
      try {
        // Save to MongoDB so it persists across sessions
        await User.findByIdAndUpdate(userId, { statusPreference: status });
      } catch (err) {
        console.error('Error saving status preference', err);
      }
    });

    // Handle sending message
    socket.on('sendMessage', (message) => {
      const receiverSocket = onlineUsers.get(message.receiver);
      if (receiverSocket) {
        // Direct emit to the receiver's socket
        io.to(receiverSocket).emit('messageReceived', message);
      }
    });

    // Typing indicators
    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('typing', senderId);
      }
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('stopTyping', senderId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove from onlineUsers
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
  // Only broadcast users who haven't set their status to invisible
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

module.exports = { initSocket, getIo };
