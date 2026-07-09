require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/socket');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Initialize Socket.io
initSocket(server);

// Handle unhandled promise rejections (e.g. database connection crash)
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
