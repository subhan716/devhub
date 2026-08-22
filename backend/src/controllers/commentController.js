const prisma = require('../config/prisma');

// @desc    Add comment to a post
// @route   POST /api/comments/:postId
// @access  Private
const addComment = async (req, res) => {
  try {
    const postId = req.params.postId || req.params.post_id;
    const { text, content } = req.body;
    const commentText = text || content;
    if (!commentText || !commentText.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        postId: postId,
        userId: req.user.id,
        text: commentText.trim()
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true } }
      }
    });

    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } }
    });

    res.status(201).json({
      _id: comment.id,
      id: comment.id,
      user: {
        _id: comment.userId,
        id: comment.userId,
        name: comment.user?.name || 'Developer',
        avatar: comment.user?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        avatarUrl: comment.user?.avatarUrl
      },
      text: comment.text,
      likes: comment.likes || [],
      likesCount: comment.likesCount || 0,
      createdAt: comment.createdAt
    });
  } catch (err) {
    console.error('Error in addComment:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Private
const getComments = async (req, res) => {
  try {
    const postId = req.params.postId || req.params.post_id;
    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(comments.map(c => ({
      _id: c.id,
      id: c.id,
      user: {
        _id: c.userId,
        id: c.userId,
        name: c.user?.name || 'Developer',
        avatar: c.user?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        avatarUrl: c.user?.avatarUrl
      },
      text: c.text,
      likes: c.likes || [],
      likesCount: c.likesCount || 0,
      createdAt: c.createdAt
    })));
  } catch (err) {
    console.error('Error in getComments:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId || req.params.comment_id;
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    await prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } }
    });

    res.json({ message: 'Comment removed successfully' });
  } catch (err) {
    console.error('Error in deleteComment:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Edit comment
// @route   PUT /api/comments/:commentId
// @access  Private
const editComment = async (req, res) => {
  try {
    const commentId = req.params.commentId || req.params.comment_id;
    const { text, content } = req.body;
    const commentText = text || content;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { text: commentText }
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Like / Unlike comment
// @route   PUT /api/comments/like/:commentId
// @access  Private
const likeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId || req.params.comment_id;
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userId = req.user.id;
    let likes = comment.likes || [];
    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { likes, likesCount: likes.length }
    });

    res.json(updated.likes);
  } catch (e) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  editComment,
  likeComment,
  addReply: async (req, res) => res.json({ message: 'Reply added' })
};
