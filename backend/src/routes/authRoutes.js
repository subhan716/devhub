const express = require('express');
const router = express.Router();
const {
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
  inSessionForgotPassword,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  debugEnv
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Standard & Enterprise Auth Routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);

// 3-Min OTP Smart Password Recovery (Public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// OAuth 2.0 Token Grant & Auto-Refresh Gateway
router.post('/oauth/token', oauthTokenGrant);
router.post('/refresh', refreshToken);

// Session Lifecycle & Security (Protected)
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/status-preference', protect, updateStatusPreference);
router.put('/password', protect, updatePassword);
router.post('/revoke-all-sessions', protect, revokeAllSessions);
router.get('/security-forensics', protect, getSecurityForensics);

// Phase 4: In-Session Step-Up Password Security & Recovery (Protected)
router.post('/request-password-otp', protect, requestPasswordOtp);
router.post('/verify-password-otp', protect, verifyPasswordOtp);
router.post('/resend-password-otp', protect, inSessionForgotPassword);
router.post('/in-session-forgot-password', protect, inSessionForgotPassword);

// 1-Click Social OAuth & Mobile Handshake
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);
router.get('/debug-env', debugEnv);

module.exports = router;
