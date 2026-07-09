const express = require('express');
const router = express.Router();
const { createPost, getPosts, getUserPosts, searchPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post('/', protect, createPost);

// @route   GET /api/posts
// @desc    Get all posts
// @access  Private
router.get('/', protect, getPosts);

// @route   GET /api/posts/search
// @desc    Search posts
// @access  Private
router.get('/search', protect, searchPosts);

// @route   GET /api/posts/user/:user_id
// @desc    Get user posts
// @access  Private
router.get('/user/:user_id', protect, getUserPosts);

module.exports = router;
