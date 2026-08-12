const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { getIo, getReceiverSocketId } = require('../socket');

// @desc    Add a comment (or reply) to a post
// @route   POST /api/comments/:postId
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text, parentCommentId } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post: postId,
      user: userId,
      text,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // Increment post comments count
    post.commentsCount += 1;
    await post.save();
    
    try {
      getIo().emit('post_updated', { postId: post._id, commentsCount: post.commentsCount });
      getIo().emit('comment_added', { postId: post._id, comment });
    } catch(e) {}

    // Populate user details for returning
    await comment.populate('user', ['name', 'avatar']);

    // Handle Notification
    let notificationRecipientId = null;
    let notificationMessage = '';

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.user.toString() !== userId) {
        notificationRecipientId = parentComment.user;
        notificationMessage = `${req.user.name || 'Someone'} replied to your comment.`;
      }
    } else if (post.author.toString() !== userId) {
      notificationRecipientId = post.author;
      notificationMessage = `${req.user.name || 'Someone'} commented on your post.`;
    }

    if (notificationRecipientId) {
      const notification = new Notification({
        recipient: notificationRecipientId,
        sender: userId,
        type: 'comment',
        relatedPost: postId,
        relatedComment: comment._id,
        message: notificationMessage
      });
      await notification.save();

      const io = getIo();
      const receiverSocketId = getReceiverSocketId(notificationRecipientId.toString());
      if (receiverSocketId) {
        // We can populate sender details before emitting
        await notification.populate('sender', 'name avatar');
        io.to(receiverSocketId).emit('newNotification', notification);
      }
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Private
const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { sort } = req.query; // 'newest', 'oldest', 'top'

    let sortObj = { createdAt: -1 }; // default newest
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'top') sortObj = { likesCount: -1, createdAt: -1 };

    const comments = await Comment.find({ post: postId })
      .populate('user', ['name', 'avatar'])
      .sort(sortObj);

    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check user (only comment author or post author can delete)
    const post = await Post.findById(comment.post);
    if (comment.user.toString() !== req.user.id && (!post || post.author.toString() !== req.user.id)) {
      return res.status(401).json({ message: 'User not authorized to delete this comment' });
    }

    // If it's a top-level comment, find all replies
    let deleteCount = 1;
    if (!comment.parentComment) {
      const replies = await Comment.find({ parentComment: comment._id });
      deleteCount += replies.length;
      await Comment.deleteMany({ parentComment: comment._id });
    }

    await comment.deleteOne();

    // Decrement post comments count
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - deleteCount);
      await post.save();
      try {
        getIo().emit('post_updated', { postId: post._id, commentsCount: post.commentsCount });
        getIo().emit('comment_deleted', { postId: post._id, commentId: req.params.commentId });
      } catch(e) {}
    }

    res.json({ message: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Like / Unlike a comment
// @route   PUT /api/comments/like/:commentId
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the comment has already been liked by this user
    if (comment.likes.some(like => like.toString() === req.user.id)) {
      // Unlike
      comment.likes = comment.likes.filter(like => like.toString() !== req.user.id);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      // Like
      comment.likes.unshift(req.user.id);
      comment.likesCount += 1;
    }

    await comment.save();
    try {
      getIo().emit('comment_updated', { commentId: comment._id, likes: comment.likes, postId: comment.post });
    } catch(e) {}
    res.json(comment.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(500).send('Server Error');
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  likeComment
};
