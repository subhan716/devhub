const prisma = require('../config/prisma');

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

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
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
        author: {
          include: { profile: true }
        },
        comments: {
          include: { user: true }
        }
      }
    });

    res.status(201).json(formatPostForClient(post));
  } catch (err) {
    console.error('Error in createPost:', err);
    res.status(500).json({ message: 'Server Error creating post' });
  }
};

// @desc    Get all posts (Unified Feed)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: {
        isReported: false
      },
      include: {
        author: {
          include: { profile: true }
        },
        comments: {
          include: {
            user: { include: { profile: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        originalPost: {
          include: {
            author: { include: { profile: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const formatted = posts.map(formatPostForClient);
    res.json(formatted);
  } catch (err) {
    console.error('Error in getPosts:', err);
    res.status(500).json({ message: 'Server Error fetching feed' });
  }
};

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { include: { profile: true } },
        comments: {
          include: { user: { include: { profile: true } } }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(formatPostForClient(post));
  } catch (err) {
    console.error('Error in getPostById:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:user_id
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const targetUserId = req.params.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { authorId: targetUserId },
      include: {
        author: { include: { profile: true } },
        comments: {
          include: { user: { include: { profile: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json(posts.map(formatPostForClient));
  } catch (err) {
    console.error('Error in getUserPosts:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Private
const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const posts = await prisma.post.findMany({
      where: {
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
    console.error('Error in searchPosts:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

    const { content, codeSnippet, image } = req.body;
    let codeObj = post.codeSnippet;
    if (codeSnippet !== undefined) {
      codeObj = codeSnippet && codeSnippet.code ? { code: codeSnippet.code, language: codeSnippet.language || 'javascript' } : null;
    }

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        content: content !== undefined ? content : post.content,
        codeSnippet: codeObj,
        imageUrl: image?.url || (typeof image === 'string' ? image : post.imageUrl)
      },
      include: {
        author: { include: { profile: true } },
        comments: { include: { user: true } }
      }
    });

    res.json(formatPostForClient(updated));
  } catch (err) {
    console.error('Error in updatePost:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: 'Post removed successfully' });
  } catch (err) {
    console.error('Error in deletePost:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/like/:id
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    let likes = post.likes || [];
    const isLiked = likes.includes(userId);

    if (isLiked) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
    }

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        likes,
        likesCount: likes.length
      }
    });

    res.json(updated.likes);
  } catch (err) {
    console.error('Error in likePost:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Repost a post
// @route   POST /api/posts/repost/:id
// @access  Private
const repostPost = async (req, res) => {
  try {
    const originalPost = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!originalPost) return res.status(404).json({ message: 'Post not found' });

    const newRepost = await prisma.post.create({
      data: {
        authorId: req.user.id,
        isRepost: true,
        originalPostId: originalPost.id,
        content: req.body.content || ''
      },
      include: {
        author: { include: { profile: true } },
        originalPost: { include: { author: { include: { profile: true } } } }
      }
    });

    res.status(201).json(formatPostForClient(newRepost));
  } catch (err) {
    console.error('Error in repostPost:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getSavedPosts = async (req, res) => res.json([]);
const savePost = async (req, res) => res.json({ message: 'Post saved' });
const unsavePost = async (req, res) => res.json({ message: 'Post unsaved' });
const reportPost = async (req, res) => {
  try {
    await prisma.post.update({
      where: { id: req.params.id },
      data: { reportsCount: { increment: 1 } }
    });
    res.json({ message: 'Post reported' });
  } catch (e) {
    res.status(500).json({ message: 'Server Error' });
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
  getSavedPosts,
  savePost,
  unsavePost,
  reportPost
};
