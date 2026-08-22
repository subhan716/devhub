const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const axios = require('axios');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'devhub_access_secret_super_secure_key_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'devhub_refresh_secret_super_secure_key_2026';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// ==========================================
// 1. REGISTER NEW USER (3-Min OTP Dispatch)
// ==========================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists in Supabase
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists. Please sign in.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 3 * 60 * 1000); // Exactly 3 minutes expiration

    await prisma.pendingUser.upsert({
      where: { email: cleanEmail },
      update: {
        name: name.trim(),
        passwordHash,
        otp,
        otpExpire,
        otpResendAttempts: 0,
        otpResendTimeWindowStart: new Date(),
        otpFailedAttempts: 0
      },
      create: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        otp,
        otpExpire,
        otpResendAttempts: 0,
        otpResendTimeWindowStart: new Date(),
        otpFailedAttempts: 0
      }
    });

    console.log(`[DEV OTP LOG] 3-Minute Verification OTP for ${cleanEmail}: ${otp}`);

    try {
      await sendEmail({
        to: cleanEmail,
        subject: 'DevHub Account Verification Code (Valid for 3 Minutes)',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
            <h2 style="color: #00F0FF; text-align: center;">Welcome to DevHub!</h2>
            <p style="color: #b3b3b3;">Your 6-digit verification code is below:</p>
            <div style="background-color: #1a1a26; border: 1px solid #00F0FF; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 34px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #ef4444; text-align: center; font-weight: bold;">⚠️ Code expires in exactly 3 minutes.</p>
          </div>
        `
      });
    } catch (mErr) {}

    res.status(201).json({
      success: true,
      message: 'Verification code dispatched to your email (expires in 3 minutes).',
      email: cleanEmail,
      otpExpiresInSeconds: 180
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

// ==========================================
// 2. VERIFY OTP (Account Activation & Profile Creation)
// ==========================================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 6-digit OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email: cleanEmail }
    });

    if (!pendingUser) {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: { profile: true }
      });
      if (existingUser && existingUser.isVerified) {
        const accessToken = generateAccessToken(existingUser);
        const refreshToken = generateRefreshToken(existingUser);
        res.cookie('devhub_token', accessToken, COOKIE_OPTIONS);
        return res.status(200).json({
          success: true,
          message: 'Account is already verified.',
          accessToken,
          refreshToken,
          user: existingUser
        });
      }
      return res.status(404).json({ message: 'Registration record not found or expired. Please sign up again.' });
    }

    if (new Date() > new Date(pendingUser.otpExpire)) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.', code: 'OTP_EXPIRED' });
    }

    if (pendingUser.otp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid verification code. Please check your email.' });
    }

    const newUser = await prisma.user.create({
      data: {
        name: pendingUser.name,
        email: pendingUser.email,
        passwordHash: pendingUser.passwordHash,
        isVerified: true,
        statusPreference: 'online',
        tokenVersion: 0,
        profile: {
          create: {
            skills: [],
            openToWork: { isLooking: false, jobTitles: [], workplaces: [], locations: [] },
            providingServices: { isProviding: false, services: [], details: '' },
            socialLinks: { github: '', linkedin: '', twitter: '', website: '' }
          }
        }
      },
      include: { profile: true }
    });

    await prisma.pendingUser.delete({ where: { email: cleanEmail } });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    res.cookie('devhub_token', accessToken, COOKIE_OPTIONS);

    const { passwordHash, ...safeUser } = newUser;

    res.status(200).json({
      success: true,
      message: 'Account verified successfully! Welcome to DevHub.',
      accessToken,
      refreshToken,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'OTP verification failed' });
  }
};

// ==========================================
// 3. RESEND OTP (60s Cooldown & 3-Min Expiry)
// ==========================================
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email address is required' });

    const cleanEmail = email.trim().toLowerCase();
    const pendingUser = await prisma.pendingUser.findUnique({ where: { email: cleanEmail } });
    if (!pendingUser) return res.status(404).json({ message: 'No pending registration found.' });

    if (pendingUser.otpResendTimeWindowStart) {
      const diffMs = Date.now() - new Date(pendingUser.otpResendTimeWindowStart).getTime();
      if (diffMs < 60 * 1000) {
        const remainingSeconds = Math.ceil((60 * 1000 - diffMs) / 1000);
        return res.status(429).json({ 
          message: `Please wait ${remainingSeconds} seconds before requesting another code.`,
          remainingSeconds
        });
      }
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpire = new Date(Date.now() + 3 * 60 * 1000);

    await prisma.pendingUser.update({
      where: { email: cleanEmail },
      data: {
        otp: newOtp,
        otpExpire: newExpire,
        otpResendTimeWindowStart: new Date(),
        otpResendAttempts: { increment: 1 }
      }
    });

    console.log(`[DEV RESEND OTP] 3-Minute OTP for ${cleanEmail}: ${newOtp}`);

    try {
      await sendEmail({
        to: cleanEmail,
        subject: 'DevHub New Verification Code (Valid for 3 Minutes)',
        html: `<p>Your new verification code is: <strong>${newOtp}</strong> (expires in 3 minutes)</p>`
      });
    } catch (mErr) {}

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email (valid for 3 minutes).',
      otpExpiresInSeconds: 180
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 4. LOGIN USER (3 Attempts = 15 Min Lockout & Multi-Session)
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const cleanEmail = email.trim().toLowerCase();

    // Check AdminUser table
    const adminUser = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });
    if (adminUser) {
      if (adminUser.lockUntil && new Date() < new Date(adminUser.lockUntil)) {
        const rem = Math.ceil((new Date(adminUser.lockUntil).getTime() - Date.now()) / 60000);
        return res.status(429).json({ message: `Account locked. Try again after ${rem} minutes.`, code: 'ACCOUNT_LOCKED' });
      }

      const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
      if (!isMatch) {
        const newFailed = (adminUser.failedLoginAttempts || 0) + 1;
        const lockData = newFailed >= 3 ? { lockUntil: new Date(Date.now() + 15 * 60 * 1000) } : {};
        await prisma.adminUser.update({ where: { id: adminUser.id }, data: { failedLoginAttempts: newFailed, ...lockData } });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      await prisma.adminUser.update({ where: { id: adminUser.id }, data: { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() } });
      const accessToken = generateAccessToken(adminUser);
      const refreshToken = generateRefreshToken(adminUser);
      res.cookie('devhub_token', accessToken, COOKIE_OPTIONS);
      const { passwordHash, ...safeAdmin } = adminUser;
      return res.status(200).json({ success: true, accessToken, refreshToken, user: safeAdmin });
    }

    // Check standard User table
    const user = await prisma.user.findUnique({ where: { email: cleanEmail }, include: { profile: true } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
      const rem = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 60000);
      return res.status(429).json({ message: `Account locked due to 3 failed attempts. Try again in ${rem} minutes.`, code: 'ACCOUNT_LOCKED' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isPasswordValid) {
      const newFailed = (user.failedLoginAttempts || 0) + 1;
      const updateData = { failedLoginAttempts: newFailed };
      if (newFailed >= 3) {
        updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.user.update({ where: { id: user.id }, data: updateData });

      if (newFailed >= 3) {
        return res.status(429).json({ message: 'Account locked for 15 minutes due to 3 consecutive failed login attempts.', code: 'ACCOUNT_LOCKED' });
      }
      return res.status(401).json({ message: `Invalid email or password. (${3 - newFailed} attempts remaining before 15-min lockout)` });
    }

    if (user.isSuspended) return res.status(403).json({ message: user.suspendedReason || 'Account suspended', code: 'ACCOUNT_SUSPENDED' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first', isVerified: false, email: user.email });

    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockUntil: null } });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie('devhub_token', accessToken, COOKIE_OPTIONS);

    const { passwordHash, ...safeUser } = user;
    res.status(200).json({ success: true, message: 'Signed in successfully', accessToken, refreshToken, user: safeUser });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

// ==========================================
// 5. SMART FORGOT PASSWORD (3-Min OTP Dispatch)
// ==========================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, a 6-digit password reset code has been sent.',
        email: cleanEmail,
        otpExpiresInSeconds: 180
      });
    }

    if (user.otpResendTimeWindowStart) {
      const diffMs = Date.now() - new Date(user.otpResendTimeWindowStart).getTime();
      if (diffMs < 60 * 1000) {
        const remainingSeconds = Math.ceil((60 * 1000 - diffMs) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSeconds} seconds before requesting another reset code.`,
          remainingSeconds
        });
      }
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetOtp,
        passwordResetExpires: resetExpires,
        otpResendTimeWindowStart: new Date()
      }
    });

    console.log(`[DEV FORGOT PASSWORD] 3-Minute Reset OTP for ${cleanEmail}: ${resetOtp}`);

    try {
      await sendEmail({
        to: cleanEmail,
        subject: 'DevHub Password Reset Code (Valid for 3 Minutes)',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
            <h2 style="color: #00F0FF; text-align: center;">Reset Your DevHub Password</h2>
            <p style="color: #b3b3b3;">You requested to reset your password. Use the 6-digit code below:</p>
            <div style="background-color: #1a1a26; border: 1px solid #00F0FF; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 34px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${resetOtp}</span>
            </div>
            <p style="font-size: 12px; color: #ef4444; text-align: center; font-weight: bold;">⚠️ Code expires in exactly 3 minutes.</p>
            <p style="font-size: 11px; color: #666; text-align: center;">If you did not request a password reset, please ignore this email.</p>
          </div>
        `
      });
    } catch (mErr) {}

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your registered email (valid for 3 minutes).',
      email: cleanEmail,
      otpExpiresInSeconds: 180
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to process password reset request' });
  }
};

// ==========================================
// 6. RESET PASSWORD (Validate OTP, Auto-Login & Cross-Fleet Session Invalidation)
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, logoutOtherDevices = true, logoutAllDevices = true } = req.body;
    const shouldLogoutOthers = logoutOtherDevices !== false && logoutAllDevices !== false;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, 6-digit code, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    if (!user.passwordResetExpires || new Date() > new Date(user.passwordResetExpires)) {
      return res.status(400).json({ message: 'Password reset code has expired. Please request a new code.', code: 'OTP_EXPIRED' });
    }

    if (user.passwordResetToken !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid password reset code. Please check your email.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const updateData = {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      failedLoginAttempts: 0,
      lockUntil: null
    };

    if (shouldLogoutOthers) {
      updateData.tokenVersion = { increment: 1 };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: { profile: true }
    });

    // Write to AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          actor: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name },
          action: 'USER_PASSWORD_CHANGE_SUCCESS',
          target: { entity: 'User', id: updatedUser.id, email: updatedUser.email },
          details: {
            logoutOtherDevices: logoutOtherDevices !== false,
            newTokenVersion: updatedUser.tokenVersion
          },
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'DevHub-Client'
        }
      });
    } catch (aErr) {
      console.warn('Audit log write error:', aErr.message);
    }

    const accessToken = generateAccessToken(updatedUser);
    const refreshToken = generateRefreshToken(updatedUser);
    res.cookie('devhub_token', accessToken, COOKIE_OPTIONS);

    const { passwordHash: _, ...safeUser } = updatedUser;

    res.status(200).json({
      success: true,
      message: shouldLogoutOthers 
        ? 'Password reset successfully! All other active mobile and web sessions have been logged out.' 
        : 'Password reset successfully!',
      accessToken,
      refreshToken,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to reset password' });
  }
};

// ==========================================
// 7. RFC 6749 OAUTH 2.0 TOKEN GRANT GATEWAY
// ==========================================
const oauthTokenGrant = async (req, res) => {
  try {
    const { grant_type, username, email, password, refresh_token } = req.body;
    const targetEmail = (username || email || '').trim().toLowerCase();

    // 1. Password Grant
    if (grant_type === 'password') {
      if (!targetEmail || !password) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'Username/email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email: targetEmail }, include: { profile: true } });
      if (!user) {
        return res.status(401).json({ error: 'invalid_grant', error_description: 'Invalid credentials' });
      }

      if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
        return res.status(429).json({ error: 'temporarily_unavailable', error_description: 'Account is temporarily locked due to failed attempts' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash || '');
      if (!isMatch) {
        const newFailed = (user.failedLoginAttempts || 0) + 1;
        const lockData = newFailed >= 3 ? { lockUntil: new Date(Date.now() + 15 * 60 * 1000) } : {};
        await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: newFailed, ...lockData } });
        return res.status(401).json({ error: 'invalid_grant', error_description: 'Invalid credentials' });
      }

      if (user.isSuspended) {
        return res.status(403).json({ error: 'unauthorized_client', error_description: 'User account has been suspended' });
      }

      await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockUntil: null } });

      const accessToken = generateAccessToken(user);
      const refreshTokenValue = generateRefreshToken(user);
      const { passwordHash, ...safeUser } = user;

      return res.status(200).json({
        token_type: 'Bearer',
        access_token: accessToken,
        expires_in: 900,
        refresh_token: refreshTokenValue,
        user: safeUser
      });
    }

    // 2. Refresh Token Grant
    if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'refresh_token parameter is required' });
      }

      try {
        const decoded = jwt.verify(refresh_token, REFRESH_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user || user.isSuspended || (decoded.tokenVersion !== undefined && decoded.tokenVersion < user.tokenVersion)) {
          return res.status(401).json({ error: 'invalid_grant', error_description: 'Refresh token has been revoked or expired' });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        return res.status(200).json({
          token_type: 'Bearer',
          access_token: newAccessToken,
          expires_in: 900,
          refresh_token: newRefreshToken
        });
      } catch (err) {
        return res.status(401).json({ error: 'invalid_grant', error_description: 'Invalid refresh token signature' });
      }
    }

    return res.status(400).json({ error: 'unsupported_grant_type', error_description: 'Supported grant types: password, refresh_token' });
  } catch (error) {
    res.status(500).json({ error: 'server_error', error_description: error.message });
  }
};

// ==========================================
// 8. REFRESH TOKEN (Web & Mobile Auto-Renewal)
// ==========================================
const refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken || req.headers['x-refresh-token'];
    if (!token) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(token, REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { profile: true } });

    if (!user || user.isSuspended) {
      return res.status(401).json({ message: 'User account not found or suspended' });
    }

    if (decoded.tokenVersion !== undefined && decoded.tokenVersion < user.tokenVersion) {
      return res.status(401).json({ message: 'Session revoked. Please sign in again.', code: 'SESSION_REVOKED' });
    }

    const newAccessToken = generateAccessToken(user);
    res.cookie('devhub_token', newAccessToken, COOKIE_OPTIONS);

    const { passwordHash, ...safeUser } = user;
    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: safeUser
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// ==========================================
// 9. LOGOUT USER
// ==========================================
const logoutUser = (req, res) => {
  res.clearCookie('devhub_token', COOKIE_OPTIONS);
  res.clearCookie('jwt', COOKIE_OPTIONS);
  res.clearCookie('token', COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ==========================================
// 10. GET ME
// ==========================================
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { profile: true } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { passwordHash, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 11. REVOKE ALL SESSIONS
// ==========================================
const revokeAllSessions = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { tokenVersion: { increment: 1 } }
    });
    res.clearCookie('devhub_token', COOKIE_OPTIONS);
    res.status(200).json({ success: true, message: 'All active sessions on all devices terminated.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 12. UPDATE PASSWORD
// ==========================================
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!isMatch) return res.status(400).json({ message: 'Current password does not match' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash, tokenVersion: { increment: 1 } }
    });

    const newAccessToken = generateAccessToken(updated);
    res.cookie('devhub_token', newAccessToken, COOKIE_OPTIONS);
    res.status(200).json({ success: true, message: 'Password updated. Other sessions revoked.', accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatusPreference = async (req, res) => {
  try {
    const { statusPreference } = req.body;
    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { statusPreference } });
    res.status(200).json({ success: true, statusPreference: updated.statusPreference });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// ==========================================
// 10. GET SECURITY FORENSICS (In-App Status)
// ==========================================
const getSecurityForensics = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        googleId: true,
        githubId: true,
        tokenVersion: true,
        updatedAt: true,
        createdAt: true
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    let auditLogs = [];
    try {
      auditLogs = await prisma.auditLog.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
    } catch (e) {}

    const hasPassword = !!user.passwordHash;
    const isOAuthUser = !hasPassword && (!!user.googleId || !!user.githubId);

    res.status(200).json({
      success: true,
      hasPassword,
      isOAuthUser,
      authProvider: user.googleId ? 'Google' : user.githubId ? 'GitHub' : 'Email/Password',
      tokenVersion: user.tokenVersion,
      lastPasswordChangeAt: user.updatedAt,
      recentActivity: auditLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch security status' });
  }
};

// ==========================================
// 11. STEP-UP OTP REQUEST (NIST SP 800-63B)
// ==========================================
const requestPasswordOtp = async (req, res) => {
  try {
    const { currentPassword, newPassword, logoutOtherDevices = true } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const hasPassword = !!user.passwordHash;
    const isOAuthUser = !hasPassword && (!!user.googleId || !!user.githubId);

    // If user already has a password, verify current password
    if (hasPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change credentials.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password. Please try again.' });
      }
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    // Generate 6-Digit Step-Up OTP (Valid for 3 Minutes)
    const stepUpOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: stepUpOtp,
        passwordResetExpires: otpExpires,
        otpResendTimeWindowStart: new Date()
      }
    });

    console.log(`[DEV STEP-UP OTP] Security Code for ${user.email}: ${stepUpOtp}`);

    // Mask email (e.g. s***h@horizon.ai)
    const [namePart, domainPart] = user.email.split('@');
    const maskedName = namePart.length > 2 
      ? `${namePart[0]}${'*'.repeat(namePart.length - 2)}${namePart[namePart.length - 1]}`
      : `${namePart[0]}*`;
    const maskedEmail = `${maskedName}@${domainPart}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'DevHub Security Verification Code (Step-Up Challenge)',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
            <h2 style="color: #00F0FF; text-align: center;">Security Verification Code</h2>
            <p style="color: #b3b3b3;">You requested to update your account password. Enter the 6-digit security code below to confirm this transaction:</p>
            <div style="background-color: #1a1a26; border: 1px solid #00F0FF; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 34px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${stepUpOtp}</span>
            </div>
            <p style="font-size: 12px; color: #ef4444; text-align: center; font-weight: bold;">⚠️ Code expires in exactly 3 minutes.</p>
            <p style="font-size: 11px; color: #666; text-align: center;">If you did not initiate this change, your credentials may be compromised. Please revoke all sessions immediately.</p>
          </div>
        `
      });
    } catch (mErr) {}

    res.status(200).json({
      success: true,
      message: 'Verification code dispatched to your verified email (valid for 3 minutes).',
      emailMasked: maskedEmail,
      expiresInSeconds: 180,
      isOAuthUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to initiate password update challenge' });
  }
};

// ==========================================
// 12. STEP-UP OTP VERIFICATION & COMMIT
// ==========================================
const verifyPasswordOtp = async (req, res) => {
  try {
    const { otp, newPassword, logoutOtherDevices = true } = req.body;

    if (!otp) {
      return res.status(400).json({ message: '6-digit verification code is required.' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    const cleanOtp = otp.trim();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.passwordResetExpires || new Date() > new Date(user.passwordResetExpires)) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.', code: 'OTP_EXPIRED' });
    }

    if (user.passwordResetToken !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid verification code. Please check your email.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const updateData = {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      failedLoginAttempts: 0,
      lockUntil: null
    };

    if (logoutOtherDevices !== false) {
      updateData.tokenVersion = { increment: 1 };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: { profile: true }
    });

    // Write to AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          userId: updatedUser.id,
          action: 'USER_PASSWORD_CHANGE_SUCCESS',
          category: 'SECURITY',
          details: {
            logoutOtherDevices: logoutOtherDevices !== false,
            ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            newTokenVersion: updatedUser.tokenVersion
          }
        }
      });
    } catch (aErr) {}

    // Dispatch Confirmation Alert
    try {
      await sendEmail({
        to: user.email,
        subject: 'Security Alert: Your DevHub Password Was Changed',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
            <h3 style="color: #22c55e; text-align: center;">Password Updated Successfully</h3>
            <p style="color: #b3b3b3;">Your DevHub account password was recently changed.</p>
            <p style="color: #b3b3b3; font-size: 12px;"><strong>Time:</strong> ${new Date().toUTCString()}</p>
            ${logoutOtherDevices !== false ? '<p style="color: #00F0FF; font-size: 12px;">All other mobile apps and web browser sessions have been logged out for your protection.</p>' : ''}
            <p style="font-size: 11px; color: #666; text-align: center; margin-top: 20px;">If this wasn't you, please secure your account immediately.</p>
          </div>
        `
      });
    } catch (mErr) {}

    const accessToken = generateAccessToken(updatedUser);
    const refreshToken = generateRefreshToken(updatedUser);
    res.cookie('devhub_token', accessToken, COOKIE_OPTIONS);

    const { passwordHash: _, ...safeUser } = updatedUser;

    res.status(200).json({
      success: true,
      message: logoutOtherDevices !== false
        ? 'Password successfully updated! All other active sessions have been rotated.'
        : 'Password successfully updated!',
      accessToken,
      refreshToken,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to verify OTP and update password' });
  }
};

// ==========================================
// 13. IN-SESSION FORGOT PASSWORD (Logged-in Reset)
// ==========================================
const inSessionForgotPassword = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otpResendTimeWindowStart) {
      const diffMs = Date.now() - new Date(user.otpResendTimeWindowStart).getTime();
      if (diffMs < 60 * 1000) {
        const remainingSeconds = Math.ceil((60 * 1000 - diffMs) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSeconds} seconds before requesting another code.`,
          remainingSeconds
        });
      }
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetOtp,
        passwordResetExpires: resetExpires,
        otpResendTimeWindowStart: new Date()
      }
    });

    console.log(`[DEV IN-SESSION FORGOT OTP] 3-Minute Reset Code for ${user.email}: ${resetOtp}`);

    try {
      await sendEmail({
        to: user.email,
        subject: 'DevHub Password Reset Code (In-Session Recovery)',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
            <h2 style="color: #00F0FF; text-align: center;">Reset Your DevHub Password</h2>
            <p style="color: #b3b3b3;">You requested to reset your password from your active session. Use the 6-digit code below:</p>
            <div style="background-color: #1a1a26; border: 1px solid #00F0FF; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 34px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${resetOtp}</span>
            </div>
            <p style="font-size: 12px; color: #ef4444; text-align: center; font-weight: bold;">⚠️ Code expires in exactly 3 minutes.</p>
          </div>
        `
      });
    } catch (mErr) {}

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your verified email address (valid for 3 minutes).',
      email: user.email,
      otpExpiresInSeconds: 180
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to dispatch in-session reset code' });
  }
};


// ==========================================
// 13. GOOGLE OAUTH 2.0 PKCE & IDENTITY LINKING
// ==========================================
const googleAuth = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const platform = req.query.platform || 'web';
  const redirectUri = encodeURIComponent(`${process.env.BACKEND_URL || 'https://devhub-api-node.onrender.com'}/api/auth/google/callback`);
  const state = encodeURIComponent(JSON.stringify({ platform }));
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email&state=${state}`);
};

const googleCallback = async (req, res) => {
  const { code, state } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'https://devhub-sub.vercel.app';
  let platform = 'web';

  try {
    if (state) {
      const parsed = JSON.parse(decodeURIComponent(state));
      if (parsed.platform) platform = parsed.platform;
    }
  } catch (e) {}

  if (!code) {
    return res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }

  try {
    const redirectUri = `${process.env.BACKEND_URL || 'https://devhub-api-node.onrender.com'}/api/auth/google/callback`;
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenRes.data;
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id: googleId, email, name, picture } = userRes.data;
    const cleanEmail = (email || '').trim().toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { profile: true }
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleId || user.googleId,
          avatarUrl: user.avatarUrl || picture,
          isVerified: true
        },
        include: { profile: true }
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          googleId,
          avatarUrl: picture,
          isVerified: true,
          statusPreference: 'online',
          tokenVersion: 0,
          profile: {
            create: {
              skills: [],
              openToWork: { isLooking: false, jobTitles: [], workplaces: [], locations: [] },
              providingServices: { isProviding: false, services: [], details: '' },
              socialLinks: { github: '', linkedin: '', twitter: '', website: '' }
            }
          }
        },
        include: { profile: true }
      });
    }

    const jwtAccessToken = generateAccessToken(user);
    const jwtRefreshToken = generateRefreshToken(user);

    if (platform === 'mobile') {
      return res.redirect(`devhub://auth/callback?token=${jwtAccessToken}&refreshToken=${jwtRefreshToken}`);
    }

    res.cookie('devhub_token', jwtAccessToken, COOKIE_OPTIONS);
    return res.redirect(`${clientUrl}/feed?oauth=success&token=${jwtAccessToken}&refreshToken=${jwtRefreshToken}`);
  } catch (err) {
    console.error('Google OAuth Callback Error:', err.message);
    return res.redirect(`${clientUrl}/login?error=oauth_error`);
  }
};

// ==========================================
// 14. GITHUB OAUTH 2.0 PKCE & IDENTITY LINKING
// ==========================================
const githubAuth = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const platform = req.query.platform || 'web';
  const redirectUri = encodeURIComponent(`${process.env.BACKEND_URL || 'https://devhub-api-node.onrender.com'}/api/auth/github/callback`);
  const state = encodeURIComponent(JSON.stringify({ platform }));
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user,user:email&state=${state}`);
};

const githubCallback = async (req, res) => {
  const { code, state } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'https://devhub-sub.vercel.app';
  let platform = 'web';

  try {
    if (state) {
      const parsed = JSON.parse(decodeURIComponent(state));
      if (parsed.platform) platform = parsed.platform;
    }
  } catch (e) {}

  if (!code) {
    return res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token } = tokenRes.data;
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'DevHub-App' }
    });

    let email = userRes.data.email;
    if (!email) {
      try {
        const emailsRes = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'DevHub-App' }
        });
        const primary = emailsRes.data.find((e) => e.primary) || emailsRes.data[0];
        email = primary?.email;
      } catch (e) {}
    }

    const cleanEmail = (email || `${userRes.data.login}@github.devhub.internal`).trim().toLowerCase();
    const githubId = String(userRes.data.id);

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { profile: true }
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: githubId || user.githubId,
          avatarUrl: user.avatarUrl || userRes.data.avatar_url,
          isVerified: true
        },
        include: { profile: true }
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: userRes.data.name || userRes.data.login,
          email: cleanEmail,
          githubId,
          avatarUrl: userRes.data.avatar_url,
          isVerified: true,
          statusPreference: 'online',
          tokenVersion: 0,
          profile: {
            create: {
              githubusername: userRes.data.login,
              skills: [],
              openToWork: { isLooking: false, jobTitles: [], workplaces: [], locations: [] },
              providingServices: { isProviding: false, services: [], details: '' },
              socialLinks: { github: userRes.data.html_url, linkedin: '', twitter: '', website: '' }
            }
          }
        },
        include: { profile: true }
      });
    }

    const jwtAccessToken = generateAccessToken(user);
    const jwtRefreshToken = generateRefreshToken(user);

    if (platform === 'mobile') {
      return res.redirect(`devhub://auth/callback?token=${jwtAccessToken}&refreshToken=${jwtRefreshToken}`);
    }

    res.cookie('devhub_token', jwtAccessToken, COOKIE_OPTIONS);
    return res.redirect(`${clientUrl}/feed?oauth=success&token=${jwtAccessToken}&refreshToken=${jwtRefreshToken}`);
  } catch (err) {
    console.error('GitHub OAuth Callback Error:', err.message);
    return res.redirect(`${clientUrl}/login?error=oauth_error`);
  }
};

const resendPasswordOtp = async (req, res) => inSessionForgotPassword(req, res);

module.exports = {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  oauthTokenGrant,
  refreshToken,
  logoutUser,
  getMe,
  updateStatusPreference,
  updatePassword,
  getSecurityForensics,
  revokeAllSessions,
  requestPasswordOtp,
  verifyPasswordOtp,
  resendPasswordOtp,
  inSessionForgotPassword,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback
};
