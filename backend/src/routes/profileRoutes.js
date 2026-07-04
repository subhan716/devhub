const express = require('express');
const router = express.Router();
const { createOrUpdateProfile, getCurrentProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrUpdateProfile);
router.get('/me', protect, getCurrentProfile);

module.exports = router;
