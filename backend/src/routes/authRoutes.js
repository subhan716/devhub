const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, googleAuth, googleCallback, githubAuth, githubCallback, updateStatusPreference } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/status', protect, updateStatusPreference);

// OAuth Routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

module.exports = router;
