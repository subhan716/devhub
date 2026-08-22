const prisma = require('../config/prisma');

const addComment = async (req, res) => {
  try {
    const { text, content } = req.body;
    const commentText = text || content;
    if (!commentText || !commentText.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await prisma.post.findUnique({ where: { id: req.params.post_id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        postId: req.params.post_id,
        userId: req.user.id,
        text: commentText.trim()
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true } }
      }
    });

    await prisma.post.update({
      where: { id: req.params.post_id },
      data: { commentsCount: { increment: 1 } }
    });

    const formatted = {
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
    };

    res.status(201).json(formatted);
  } catch (err) {
    console.error('Error in addComment:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.comment_id } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await prisma.comment.delete({ where: { id: req.params.comment_id } });
    await prisma.post.update({
      where: { id: req.params.post_id },
      data: { commentsCount: { decrement: 1 } }
    });

    res.json({ message: 'Comment removed successfully' });
  } catch (err) {
    console.error('Error in deleteComment:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  addComment,
  deleteComment,
  likeComment: async (req, res) => res.json([]),
  addReply: async (req, res) => res.json({ message: 'Reply added' })
};
