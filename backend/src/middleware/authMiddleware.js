const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'devhub_access_secret_super_secure_key_2026';

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

    // Query Supabase PostgreSQL for active user or admin
    let user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { profile: true }
    });

    if (!user) {
      // Fallback check in AdminUser table
      user = await prisma.adminUser.findUnique({
        where: { id: decoded.id }
      });
    }

    if (!user) {
      return res.status(401).json({ message: 'User account not found' });
    }

    // Account Suspension & Deactivation Check
    if (user.isSuspended || user.isActive === false) {
      return res.status(403).json({ 
        message: user.suspendedReason || 'Your account has been deactivated or suspended by system administration.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Cross-Fleet Session Invalidation Check (tokenVersion mismatch)
    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined) {
      if (decoded.tokenVersion < user.tokenVersion) {
        return res.status(401).json({ 
          message: 'Session has expired or was revoked. Please sign in again.',
          code: 'SESSION_REVOKED'
        });
      }
    }

    // Attach user context (without password hash)
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token validation failed', code: 'INVALID_TOKEN' });
  }
};

const protectAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no user context' });
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
  } else if (req.cookies && (req.cookies.devhub_token || req.cookies.jwt || req.cookies.token)) {
    token = req.cookies.devhub_token || req.cookies.jwt || req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      let user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { profile: true }
      });
      if (!user) {
        user = await prisma.adminUser.findUnique({
          where: { id: decoded.id }
        });
      }
      if (user && !user.isSuspended && user.isActive !== false) {
        const { passwordHash, ...safeUser } = user;
        req.user = safeUser;
      }
    } catch (error) {
      // Ignore optional token errors
    }
  }
  next();
};

module.exports = { protect, protectOptional, admin, protectAdmin };
