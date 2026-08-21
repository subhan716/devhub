const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'devhub_access_secret_super_secure_key_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'devhub_refresh_secret_super_secure_key_2026';

const generateAccessToken = (user) => {
  const id = typeof user === 'object' ? user.id || user._id : user;
  const role = typeof user === 'object' ? user.role : 'user';
  const email = typeof user === 'object' ? user.email : '';
  const tokenVersion = typeof user === 'object' ? (user.tokenVersion ?? 0) : 0;

  return jwt.sign(
    { id, email, role, tokenVersion },
    ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

const generateRefreshToken = (user) => {
  const id = typeof user === 'object' ? user.id || user._id : user;
  const tokenVersion = typeof user === 'object' ? (user.tokenVersion ?? 0) : 0;

  return jwt.sign(
    { id, tokenVersion },
    REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
