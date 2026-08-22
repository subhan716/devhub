const prisma = require('../config/prisma');
const { getIo } = require('../socket');

const formatPostForClient = (post) => {
  if (!post) return null;
  const authorName = post.author?.name || 'Developer';
  const authorAvatar = post.author?.avatarUrl || post.author?.profile?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  
  return {
    _id: post.id,
    id: post.id,
    author: {
      _id: post.authorId,
      id: post.authorId,
      name: authorName,
      avatar: { url: authorAvatar },
      avatarUrl: authorAvatar,
      isVerifiedBadge: post.author?.isVerifiedBadge || false,
      badgeType: post.author?.badgeType || 'none'
    },
    authorProfile: {
      status: post.author?.profile?.status || 'Developer',
      handle: post.author?.profile?.githubusername || authorName.toLowerCase().replace(/\s+/g, '')
    },
    content: post.content || '',
    codeSnippet: post.codeSnippet || null,
    image: post.imageUrl ? { url: post.imageUrl } : undefined,
    imageUrl: post.imageUrl || null,
    images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    likes: post.likes || [],
    likesCount: post.likesCount || (post.likes ? post.likes.length : 0),
    commentsCount: post.commentsCount || (post.comments ? post.comments.length : 0),
    comments: (post.comments || []).map(c => {
      const cAvatar = c.user?.avatarUrl || c.user?.profile?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
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
        text: c.text || '',
        likes: c.likes || [],
        likesCount: c.likesCount || 0,
        createdAt: c.createdAt
      };
    }),
    isRepost: post.isRepost || false,
    originalPost: post.originalPost ? formatPostForClient(post.originalPost) : null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
};

const createPost = async (req, res) => {
    invalidateFeedCache();
  try {
    const { content, codeSnippet, image } = req.body;
    const userId = req.user.id;

    let codeObj = null;
    if (codeSnippet && codeSnippet.code && codeSnippet.code.trim()) {
      codeObj = { code: codeSnippet.code, language: codeSnippet.language || 'javascript' };
    }

    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: content || '',
        codeSnippet: codeObj,
        imageUrl: image?.url || (typeof image === 'string' ? image : null)
      },
      include: {
        author: { include: { profile: true } },
        comments: { include: { user: true } }
      }
    });

    res.status(201).json(formatPostForClient(post));
  } catch (err) {
    console.error('Error in createPost:', err);
    res.status(500).json({ message: 'Server Error creating post' });
  }
};

// High-Speed In-Memory Feed Cache for sub-millisecond response times
let feedCache = null;
let feedCacheExpiry = 0;

const invalidateFeedCache = () => {
  feedCache = null;
  feedCacheExpiry = 0;
};

// Keyset Cursor-Based & Offset Hybrid Pagination with Sub-Millisecond Cache
const getPosts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const cursor = req.query.cursor;
    const page = parseInt(req.query.page) || 1;

    // Fast-path for initial page feed
    if (page === 1 && !cursor && feedCache && Date.now() < feedCacheExpiry) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(feedCache);
    }

    let queryArgs = {
      where: { isReported: false },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        codeSnippet: true,
        likes: true,
        likesCount: true,
        commentsCount: true,
        repostsCount: true,
        isRepost: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerifiedBadge: true,
            badgeType: true,
            profile: { select: { status: true, githubusername: true } }
          }
        },
        comments: {
          take: 2,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            text: true,
            likes: true,
            likesCount: true,
            createdAt: true,
            userId: true,
            user: { select: { id: true, name: true, avatarUrl: true } }
          }
        },
        originalPost: {
          select: {
            id: true,
            content: true,
            imageUrl: true,
            codeSnippet: true,
            likes: true,
            likesCount: true,
            createdAt: true,
            author: { select: { id: true, name: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    };

    if (cursor) {
      queryArgs.take = limit + 1;
      queryArgs.cursor = { id: cursor };
      queryArgs.skip = 1;
    } else {
      queryArgs.take = limit;
      queryArgs.skip = (page - 1) * limit;
    }

    const rawPosts = await prisma.post.findMany(queryArgs);
    let nextCursor = null;

    if (cursor && rawPosts.length > limit) {
      const nextItem = rawPosts.pop();
      nextCursor = nextItem.id;
    }

    const formatted = rawPosts.map(formatPostForClient);

    // Cache initial feed for 10 seconds
    if (page === 1 && !cursor) {
      feedCache = formatted;
      feedCacheExpiry = Date.now() + 10000;
      res.setHeader('X-Cache', 'MISS');
    }

    if (cursor !== undefined) {
      res.json({ posts: formatted, nextCursor, hasMore: Boolean(nextCursor) });
    } else {
      res.json(formatted);
    }
  } catch (err) {
    console.error('Error in getPosts:', err);
    res.status(500).json({ message: 'Server Error fetching feed' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { include: { profile: true } },
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'asc' }
        },
        originalPost: {
          include: { author: { include: { profile: true } } }
        }
      }
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(formatPostForClient(post));
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: req.params.user_id, isReported: false },
      include: {
        author: { include: { profile: true } },
        comments: { include: { user: true } },
        originalPost: { include: { author: { include: { profile: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts.map(formatPostForClient));
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const posts = await prisma.post.findMany({
      where: {
        isReported: false,
        content: { contains: q, mode: 'insensitive' }
      },
      include: {
        author: { include: { profile: true } },
        comments: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(posts.map(formatPostForClient));
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { content, codeSnippet } = req.body;
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        content: content !== undefined ? content : post.content,
        codeSnippet: codeSnippet !== undefined ? codeSnippet : post.codeSnippet
      },
      include: {
        author: { include: { profile: true } },
        comments: { include: { user: true } }
      }
    });

    res.json(formatPostForClient(updated));
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deletePost = async (req, res) => {
    invalidateFeedCache();
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: 'Post removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Atomic Transaction for Like / Unlike
const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id: postId } });
      if (!post) throw new Error('Post not found');

      let likes = post.likes || [];
      const isLiked = likes.includes(userId);

      if (isLiked) {
        likes = likes.filter(id => id !== userId);
      } else {
        likes.push(userId);

        // Auto-dispatch Notification in transaction
        if (post.authorId !== userId) {
          await tx.notification.create({
            data: {
              recipientId: post.authorId,
              senderId: userId,
              type: 'like',
              relatedPostId: post.id,
              message: 'liked your post'
            }
          });
        }
      }

      const updated = await tx.post.update({
        where: { id: postId },
        data: { likes, likesCount: likes.length }
      });

      return { likes: updated.likes, authorId: post.authorId, isLiked: !isLiked };
    });

    // Real-time socket broadcast outside transaction
    if (result.isLiked && result.authorId !== userId) {
      const io = getIo();
      if (io) {
        io.to(result.authorId).emit('newNotification', {
          recipientId: result.authorId,
          type: 'like',
          message: 'liked your post',
          sender: {
            id: req.user.id,
            _id: req.user.id,
            name: req.user.name,
            avatar: { url: req.user.avatarUrl },
            avatarUrl: req.user.avatarUrl
          }
        });
      }
    }

    res.json(result.likes);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const repostPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const original = await tx.post.findUnique({ where: { id: postId } });
      if (!original) throw new Error('Post not found');

      let reposts = original.reposts || [];
      const isReposted = reposts.includes(userId);

      if (isReposted) {
        reposts = reposts.filter(id => id !== userId);
        await tx.post.deleteMany({
          where: { authorId: userId, originalPostId: original.id }
        });
      } else {
        reposts.push(userId);
        await tx.post.create({
          data: {
            authorId: userId,
            isRepost: true,
            originalPostId: original.id,
            content: original.content
          }
        });

        if (original.authorId !== userId) {
          await tx.notification.create({
            data: {
              recipientId: original.authorId,
              senderId: userId,
              type: 'system',
              relatedPostId: original.id,
              message: 'reposted your update'
            }
          });
        }
      }

      const updated = await tx.post.update({
        where: { id: postId },
        data: { reposts, repostsCount: reposts.length }
      });

      return updated.reposts;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  getUserPosts,
  searchPosts,
  updatePost,
  deletePost,
  likePost,
  repostPost,
  formatPostForClient
};
