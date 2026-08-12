const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment, likeComment, editComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/comments/:postId
// @desc    Add a comment to a post
// @access  Private
router.post('/:postId', protect, addComment);

// @route   GET /api/comments/:postId
// @desc    Get all comments for a post
// @access  Private
router.get('/:postId', protect, getComments);

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:commentId', protect, deleteComment);

// @route   PUT /api/comments/:commentId
// @desc    Edit a comment
// @access  Private
router.put('/:commentId', protect, editComment);

// @route   PUT /api/comments/like/:commentId
// @desc    Like / Unlike a comment
// @access  Private
router.put('/like/:commentId', protect, likeComment);

module.exports = router;
