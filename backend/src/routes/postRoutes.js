const express = require('express');
const router = express.Router();
const { createPost, getPosts, getUserPosts, searchPosts, updatePost, deletePost, likePost } = require('../controllers/postController');
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

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', protect, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, deletePost);

// @route   PUT /api/posts/like/:id
// @desc    Like / Unlike a post
// @access  Private
router.put('/like/:id', protect, likePost);

module.exports = router;
