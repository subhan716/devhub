const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    try {
      // Get token from cookie
      token = req.cookies.jwt;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (req.user.isSuspended) {
        return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const protectAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no user found' });
  }

  const allowedRoles = ['admin', 'super_admin', 'moderator'];
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
  if (req.cookies.jwt) {
    try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
    } catch (error) {
      // Ignore token errors for optional protection
    }
  }
  next();
};

module.exports = { protect, protectOptional, admin, protectAdmin };
