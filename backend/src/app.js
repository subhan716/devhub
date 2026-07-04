const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent (for refresh tokens later)
  })
);

// Body Parser
app.use(express.json());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
const authRoutes = require('./routes/authRoutes');

// Basic Route for testing
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Welcome to the DevHub API!' });
});

// Mount Routes
app.use('/api/auth', authRoutes);

module.exports = app;
