const Post = require('../models/Post');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Follow = require('../models/Follow');
const mongoose = require('mongoose');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, codeSnippet, image } = req.body;

    const newPost = new Post({
      author: req.user.id,
      content,
      codeSnippet: codeSnippet && codeSnippet.code && codeSnippet.code.trim() ? { code: codeSnippet.code, language: codeSnippet.language || 'javascript' } : undefined,
      image: image && image.url ? { url: image.url } : undefined,
    });

    const post = await newPost.save();

    // Populate author details before returning
    const populatedPost = await Post.findById(post._id).populate('author', 'name avatar');
    res.status(201).json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the list of users the current user follows
    const follows = await Follow.find({ follower: userId });
    const followingIds = follows.map(f => f.following);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let posts = [];

    // Unified Feed - Highly Scalable Aggregation Pipeline
      const pipeline = [
        // 1. Filter: Only process posts from the last 14 days and exclude user's own reposts
        { 
          $match: { 
            createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
            $or: [
              { isRepost: { $ne: true } },
              { author: { $ne: new mongoose.Types.ObjectId(userId) } }
            ]
          } 
        },
        
        // 2. Pre-compute fields for scoring
        {
          $addFields: {
            isFollowing: { $in: ["$author", followingIds] },
            ageInHours: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60] },
            contentLen: { $strLenCP: { $ifNull: ["$content", ""] } },
            hasMedia: { 
              $or: [
                { $gt: [{ $type: "$image.url" }, "missing"] },
                { $gt: [{ $type: "$video.url" }, "missing"] }
              ]
            }
          }
        },
        
        // 3. Calculate Base Score and Multipliers
        {
          $addFields: {
            baseScore: { 
              $add: [
                1, // Base point
                { $ifNull: ["$likesCount", 0] }, // 1 point per like
                { $multiply: [{ $ifNull: ["$commentsCount", 0] }, 5] } // 5 points per comment (LinkedIn style)
              ] 
            },
            contentBoost: {
              $cond: {
                 if: { $gt: ["$contentLen", 100] }, then: 1.1, // Long-form insight boost
                 else: { $cond: { if: { $lt: ["$contentLen", 15] }, then: 0.3, else: 1.0 } } // Spam penalty
              }
            },
            mediaBoost: { $cond: [{ $eq: ["$hasMedia", true] }, 1.2, 1.0] },
            networkBoost: { $cond: [{ $eq: ["$isFollowing", true] }, 2.0, 1.0] },
            echoPenalty: { $cond: [{ $eq: ["$author", new mongoose.Types.ObjectId(userId)] }, 0.2, 1.0] }
          }
        },
        
        // 4. Calculate Final Gravity Score
        {
          $addFields: {
            finalScore: { 
              $divide: [
                { $multiply: ["$baseScore", "$contentBoost", "$mediaBoost", "$networkBoost", "$echoPenalty"] },
                { $pow: [{ $add: ["$ageInHours", 2] }, 1.5] } // Gravity penalty
              ]
            }
          }
        },
        
        // 5. Sort by Final Score and Limit
        { $sort: { finalScore: -1 } },
        { $skip: skip },
        { $limit: limit }
      ];

    const rawPosts = await Post.aggregate(pipeline);
    // Populate author details and originalPost after aggregation
    posts = await Post.populate(rawPosts, [
      { path: 'author', select: 'name avatar' },
      { path: 'originalPost', populate: { path: 'author', select: 'name avatar' } }
    ]);
    
    // For a real app, we would aggregate the Profile data (status, handle) with the User data.
    const postsWithProfiles = await Promise.all(posts.map(async (post) => {
      // Handle the case where post is a lean object from aggregate or full Mongoose document
      const authorId = post.author?._id || post.author;
      if (!authorId) {
        return {
          ...(post._doc || post),
          authorProfile: { status: 'Deleted User', handle: 'deleted' }
        };
      }
      const profile = await Profile.findOne({ user: authorId });
      return {
        ...(post._doc || post),
        authorProfile: profile ? {
          status: profile.status,
          handle: profile.githubusername || post.author.name.toLowerCase().replace(/\s+/g, ''),
        } : { status: 'Professional', handle: 'user' }
      };
    }));

    res.json(postsWithProfiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name avatar');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:user_id
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.params.user_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name avatar')
      .populate({ path: 'originalPost', populate: { path: 'author', select: 'name avatar' } });
    
    const postsWithProfiles = await Promise.all(posts.map(async (post) => {
      const profile = await Profile.findOne({ user: post.author._id });
      return {
        ...post._doc,
        authorProfile: profile ? {
          status: profile.status,
          handle: profile.githubusername || post.author.name.toLowerCase().replace(/\s+/g, ''),
        } : { status: 'Developer', handle: 'dev' }
      };
    }));

    res.json(postsWithProfiles);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Private
const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const posts = await Post.find({
      $text: { $search: q }
    }, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatar')
    .limit(20);

    const postsWithProfiles = await Promise.all(posts.map(async (post) => {
      const profile = await Profile.findOne({ user: post.author._id });
      return {
        ...post._doc,
        authorProfile: profile ? {
          status: profile.status,
          handle: profile.githubusername || post.author.name.toLowerCase().replace(/\s+/g, ''),
        } : { status: 'Developer', handle: 'dev' }
      };
    }));

    res.json(postsWithProfiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user permission (must be author)
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { content, codeSnippet, image } = req.body;
    post.content = content || post.content;
    
    if (codeSnippet && codeSnippet.code && codeSnippet.code.trim()) {
      post.codeSnippet = { code: codeSnippet.code, language: codeSnippet.language || 'javascript' };
    } else {
      post.codeSnippet = undefined;
    }

    if (image && image.url) {
      post.image = { url: image.url };
    } else {
      post.image = undefined;
    }

    await post.save();
    const populatedPost = await Post.findById(post._id).populate('author', 'name avatar');
    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user permission (must be author)
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Post.deleteOne({ _id: req.params.id });
    res.json({ message: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/like/:id
// @access  Private
const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasLiked = post.likes.includes(userId);
    let updatedPost;

    // Use highly scalable Atomic Operations ($pull, $push, $inc) to prevent race conditions on concurrent likes
    if (hasLiked) {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { 
          $pull: { likes: userId },
          $inc: { likesCount: -1 } 
        },
        { new: true }
      );
      if (updatedPost && updatedPost.likesCount < 0) {
        updatedPost = await Post.findByIdAndUpdate(postId, { likesCount: 0 }, { new: true });
      }
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { 
          $push: { likes: {
             $each: [userId],
             $position: 0 
          }},
          $inc: { likesCount: 1 } 
        },
        { new: true }
      );
    }

    try {
      const { getIo } = require('../socket');
      getIo().emit('post_updated', { 
        postId: updatedPost._id, 
        likes: updatedPost.likes,
        likesCount: updatedPost.likesCount
      });
    } catch (e) {
      console.log('Socket emit failed', e.message);
    }

    res.json({
      _id: updatedPost._id,
      likes: updatedPost.likes,
      likesCount: updatedPost.likesCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Repost a post (Atomic)
// @route   PUT /api/posts/repost/:id
// @access  Private
const repostPost = async (req, res) => {
  try {
    const originalPostId = req.params.id;
    const userId = req.user.id;

    const originalPost = await Post.findById(originalPostId);
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reposted
    const existingRepost = await Post.findOne({ author: userId, isRepost: true, originalPost: originalPostId });

    let updatedPost;

    if (existingRepost) {
      // Undo repost
      await Post.findByIdAndDelete(existingRepost._id);
      
      updatedPost = await Post.findByIdAndUpdate(
        originalPostId,
        { 
          $pull: { reposts: userId },
          $inc: { repostsCount: -1 } 
        },
        { new: true }
      );
    } else {
      // Create repost
      await Post.create({
        author: userId,
        isRepost: true,
        originalPost: originalPostId,
      });

      updatedPost = await Post.findByIdAndUpdate(
        originalPostId,
        { 
          $addToSet: { reposts: userId },
          $inc: { repostsCount: 1 } 
        },
        { new: true }
      );
    }

    try {
      const { getIo } = require('../socket');
      getIo().emit('post_updated', { 
        postId: updatedPost._id, 
        repostsCount: updatedPost.repostsCount,
        reposts: updatedPost.reposts
      });
    } catch (e) {
      console.log('Socket emit failed', e.message);
    }

    res.json({ repostsCount: updatedPost.repostsCount, reposts: updatedPost.reposts });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server Error');
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
};
