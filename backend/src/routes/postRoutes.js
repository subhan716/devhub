const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostById, getUserPosts, searchPosts, updatePost, deletePost, likePost, repostPost } = require('../controllers/postController');
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

// @route   GET /api/posts/:id
// @desc    Get a single post
// @access  Private
router.get('/:id', protect, getPostById);

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

// @route   PUT /api/posts/repost/:id
// @desc    Repost a post
// @access  Private
router.put('/repost/:id', protect, repostPost);

module.exports = router;
