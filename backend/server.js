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

const { startSuggestionCronJob } = require('./src/services/suggestionService');

// Initialize Socket.io
initSocket(server);

// Initialize Background Jobs
startSuggestionCronJob();

// --- SELF-PING MECHANISM FOR RENDER FREE TIER ---
// Ping the server every 14 minutes to prevent it from going to sleep
const https = require('https');
setInterval(() => {
  const url = 'https://devhub-api-node.onrender.com/api';
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log('Self-ping successful. Server kept alive.');
    } else {
      console.log(`Self-ping failed with status code: ${res.statusCode}`);
    }
  }).on('error', (e) => {
    console.log(`Self-ping error: ${e.message}`);
  });
}, 14 * 60 * 1000); // 14 minutes
// ------------------------------------------------

// Handle unhandled promise rejections (e.g. database connection crash)
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
