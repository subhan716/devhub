const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, googleAuth, googleCallback, githubAuth, githubCallback, updateStatusPreference, verifyOtp, resendOtp, updatePassword, getSecurityForensics, revokeAllSessions, requestPasswordOtp, verifyPasswordOtp, resendPasswordOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate Limiters for Scalability & Security
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' }
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: { message: 'Too many OTP requests from this IP, please try again after 10 minutes' }
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/status', protect, updateStatusPreference);
router.put('/update-password', protect, updatePassword);
router.post('/request-password-otp', protect, requestPasswordOtp);
router.post('/verify-password-otp', protect, verifyPasswordOtp);
router.post('/resend-password-otp', protect, resendPasswordOtp);
router.get('/security-forensics', protect, getSecurityForensics);
router.post('/revoke-all-sessions', protect, revokeAllSessions);

// OTP Verification Routes
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);

// OAuth Routes
router.get('/google', authLimiter, googleAuth);
router.get('/google/callback', googleCallback);

router.get('/github', authLimiter, githubAuth);
router.get('/github/callback', githubCallback);

module.exports = router;
