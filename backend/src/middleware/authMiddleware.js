const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');

const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header (Standard for Mobile Apps & Admin API)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback to Cookie (Standard for Web App)
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Check User collection first, then AdminUser collection
      let user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        user = await AdminUser.findById(decoded.id).select('-passwordHash');
      }

      req.user = user;

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (req.user.isSuspended || req.user.isActive === false) {
        return res.status(403).json({ message: 'Your account has been deactivated or suspended.' });
      }

      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const protectAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no user found' });
  }

  const allowedRoles = ['super_admin', 'admin', 'ops_manager', 'safety_officer', 'moderator'];
  if (allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
};

const admin = (req, res, next) => {
  return protectAdmin(req, res, next);
};

const protectOptional = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      let user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        user = await AdminUser.findById(decoded.id).select('-passwordHash');
      }
      req.user = user;
    } catch (error) {
      // Ignore token errors for optional protection
    }
  }
  next();
};

module.exports = { protect, protectOptional, admin, protectAdmin };
