const prisma = require('../config/prisma');
const { invalidateFeedCache } = require('./postController');
const { getIo } = require('../socket');

const addComment = async (req, res) => {
  invalidateFeedCache();
  try {
    const postId = req.params.postId || req.params.post_id;
    const { text, content, parentCommentId } = req.body;
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

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
      select: { id: true, commentsCount: true, authorId: true }
    });

    const cAvatar = comment.user?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    const formattedComment = {
      _id: comment.id,
      id: comment.id,
      postId: postId,
      parentComment: parentCommentId || null,
      user: {
        _id: comment.userId,
        id: comment.userId,
        name: comment.user?.name || 'Developer',
        avatar: { url: cAvatar },
        avatarUrl: cAvatar,
        isVerifiedBadge: comment.user?.isVerifiedBadge || false,
        badgeType: comment.user?.badgeType || 'none'
      },
      text: comment.text,
      likes: comment.likes || [],
      likesCount: comment.likesCount || 0,
      replies: [],
      createdAt: comment.createdAt
    };

    // Broadcast Real-Time Events via Socket.IO
    const io = getIo();
    if (io) {
      io.emit('comment_added', { postId, comment: formattedComment });
      io.emit('post_updated', { postId, commentsCount: updatedPost.commentsCount });
    }

    // Auto-dispatch Notification to Post Author
    if (post.authorId !== req.user.id) {
      try {
        const notif = await prisma.notification.create({
          data: {
            recipientId: post.authorId,
            senderId: req.user.id,
            type: 'comment',
            relatedPostId: post.id,
            relatedCommentId: comment.id,
            message: `${req.user.name || 'A developer'} commented on your post: "${commentText.substring(0, 40)}..."`
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } }
          }
        });

        if (io) {
          io.to(post.authorId).emit('newNotification', {
            ...notif,
            _id: notif.id,
            sender: {
              ...notif.sender,
              _id: notif.sender.id,
              avatar: { url: notif.sender.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }
            }
          });
        }
      } catch (nErr) {
        console.error('Comment notification error:', nErr.message);
      }
    }

    res.status(201).json(formattedComment);
  } catch (err) {
    console.error('Error in addComment:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

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

    res.json(comments.map(c => {
      const cAvatar = c.user?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        _id: c.id,
        id: c.id,
        user: {
          _id: c.userId,
          id: c.userId,
          name: c.user?.name || 'Developer',
          avatar: { url: cAvatar },
          avatarUrl: cAvatar
        },
        text: c.text,
        likes: c.likes || [],
        likesCount: c.likesCount || 0,
        createdAt: c.createdAt
      };
    }));
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteComment = async (req, res) => {
  invalidateFeedCache();
  try {
    const commentId = req.params.commentId || req.params.comment_id;
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    const updatedPost = await prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
      select: { id: true, commentsCount: true }
    });

    const io = getIo();
    if (io) {
      io.emit('comment_deleted', { postId: comment.postId, commentId });
      io.emit('post_updated', { postId: comment.postId, commentsCount: updatedPost.commentsCount });
    }

    res.json({ message: 'Comment removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

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
