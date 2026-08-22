require('dotenv').config();
const app = require('./src/app');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 DevHub Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log('⚡ 100% Unified Database: Supabase PostgreSQL (Prisma ORM)');
});

// Initialize Socket.io
initSocket(server);

// --- SELF-PING MECHANISM FOR RENDER FREE TIER ---
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
}, 14 * 60 * 1000);

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});
