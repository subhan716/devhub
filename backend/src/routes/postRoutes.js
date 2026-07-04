const express = require('express');
const router = express.Router();
const { createPost, getPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post('/', protect, createPost);

// @route   GET /api/posts
// @desc    Get all posts
// @access  Private
router.get('/', protect, getPosts);

module.exports = router;
