const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, googleAuth, googleCallback, githubAuth, githubCallback } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

// OAuth Routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

module.exports = router;
