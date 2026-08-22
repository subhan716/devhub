const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'devhub_access_secret_super_secure_key_2026';

// In-Memory Fast-Path Cache for Active Sessions (Reduces DB lookups by 70%)
const sessionCache = new Map();
const SESSION_CACHE_TTL_MS = 60 * 1000; // 60 seconds

const invalidateUserSessionCache = (userId) => {
  if (userId) sessionCache.delete(userId);
};

const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header (Standard for Mobile Apps, Postman, Admin API)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback to Cookie (Standard for Web App)
  else if (req.cookies && (req.cookies.devhub_token || req.cookies.jwt || req.cookies.token)) {
    token = req.cookies.devhub_token || req.cookies.jwt || req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);

    // Fast-Path In-Memory Cache Lookup
    let cached = sessionCache.get(decoded.id);
    let user;

    if (cached && Date.now() - cached.timestamp < SESSION_CACHE_TTL_MS) {
      user = cached.user;
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          isVerifiedBadge: true,
          badgeType: true,
          isSuspended: true,
          suspendedReason: true,
          tokenVersion: true,
          statusPreference: true,
          profile: { select: { id: true, status: true, company: true, githubusername: true } }
        }
      });

      if (!user) {
        user = await prisma.adminUser.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            tokenVersion: true
          }
        });
      }

      if (user) {
        sessionCache.set(decoded.id, { user, timestamp: Date.now() });
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User account not found' });
    }

    // Account Suspension & Deactivation Check
    if (user.isSuspended || user.isActive === false) {
      sessionCache.delete(decoded.id);
      return res.status(403).json({ 
        message: user.suspendedReason || 'Your account has been deactivated or suspended by system administration.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Cross-Fleet Session Invalidation Check (tokenVersion mismatch)
    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined) {
      if (decoded.tokenVersion < user.tokenVersion) {
        sessionCache.delete(decoded.id);
        return res.status(401).json({ 
          message: 'Session has expired or was revoked. Please sign in again.',
          code: 'SESSION_REVOKED'
        });
      }
    }

    req.user = {
      ...user,
      _id: user.id
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Access token has expired', 
        code: 'TOKEN_EXPIRED' 
      });
    }
    return res.status(401).json({ 
      message: 'Not authorized, token validation failed',
      code: 'INVALID_TOKEN'
    });
  }
};

const protectOptional = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && (req.cookies.devhub_token || req.cookies.jwt || req.cookies.token)) {
    token = req.cookies.devhub_token || req.cookies.jwt || req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    let cached = sessionCache.get(decoded.id);
    let user;

    if (cached && Date.now() - cached.timestamp < SESSION_CACHE_TTL_MS) {
      user = cached.user;
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          isVerifiedBadge: true,
          badgeType: true,
          isSuspended: true,
          statusPreference: true
        }
      });
      if (user) {
        sessionCache.set(decoded.id, { user, timestamp: Date.now() });
      }
    }

    if (user && !user.isSuspended) {
      req.user = { ...user, _id: user.id };
    }
  } catch (err) {
    // Ignore invalid token for optional routes
  }

  next();
};

const protectAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, admin authentication required.' });
  }

  const allowedRoles = ['admin', 'super_admin', 'moderator', 'ops_manager', 'safety_officer', 'support_agent', 'analyst'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: Administrative privileges required.' });
  }

  next();
};

module.exports = {
  protect,
  protectOptional,
  protectAdmin,
  invalidateUserSessionCache
};
