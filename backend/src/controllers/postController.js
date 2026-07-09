const Post = require('../models/Post');
const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, codeSnippet } = req.body;

    const newPost = new Post({
      author: req.user.id,
      content,
      codeSnippet: codeSnippet ? { code: codeSnippet.code, language: codeSnippet.language || 'javascript' } : undefined,
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
    // Sort by newest first
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name avatar');
    
    // For a real app, we would aggregate the Profile data (status, handle) with the User data.
    // We'll map through posts and fetch the profile for each author to get their handle/status.
    
    const postsWithProfiles = await Promise.all(posts.map(async (post) => {
      if (!post.author) {
        return {
          ...post._doc,
          authorProfile: { status: 'Deleted User', handle: 'deleted' }
        };
      }
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

// @desc    Get user posts
// @route   GET /api/posts/user/:user_id
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.user_id })
      .sort({ createdAt: -1 })
      .populate('author', 'name avatar');
    
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
      $or: [
        { content: { $regex: q, $options: 'i' } }
      ]
    })
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

module.exports = { createPost, getPosts, getUserPosts, searchPosts };
