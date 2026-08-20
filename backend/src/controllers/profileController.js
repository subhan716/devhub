const Profile = require('../models/Profile');
const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Connection = require('../models/Connection');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { getIo, getReceiverSocketId } = require('../socket');

// @desc    Create or update user profile
// @route   POST /api/profile
// @access  Private
const createOrUpdateProfile = async (req, res) => {
  const { 
    name, 
    company, 
    website, 
    location, 
    bio, 
    about, 
    status, 
    githubusername, 
    skills, 
    youtube, 
    facebook, 
    twitter, 
    instagram, 
    linkedin, 
    openToWork, 
    providingServices,
    avatar,
    coverImage 
  } = req.body;

  try {
    const userId = req.user.id || req.user._id;

    // 1. Sync Name and Avatar on User model if provided
    const userUpdateFields = {};
    if (name && name.trim()) {
      userUpdateFields.name = name.trim();
    }
    if (avatar && avatar.url) {
      userUpdateFields.avatar = avatar;
    }
    if (Object.keys(userUpdateFields).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: userUpdateFields });
    }

    // 2. Build profileFields object
    const profileFields = { user: userId };
    if (company !== undefined) profileFields.company = company;
    if (location !== undefined) profileFields.location = location;
    if (bio !== undefined) profileFields.bio = bio;
    if (about !== undefined) profileFields.about = about;
    if (status !== undefined) profileFields.status = status;
    if (githubusername !== undefined) profileFields.githubusername = githubusername;
    if (avatar) profileFields.avatar = avatar;
    if (coverImage) profileFields.coverImage = coverImage;
    if (openToWork !== undefined) profileFields.openToWork = openToWork;
    if (providingServices !== undefined) profileFields.providingServices = providingServices;

    // Skills - Clean array with deduplication
    if (skills) {
      const rawSkills = Array.isArray(skills) ? skills : skills.split(',');
      profileFields.skills = [...new Set(rawSkills.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean))];
    }

    // Build socialLinks object
    profileFields.socialLinks = {};
    if (website !== undefined) profileFields.socialLinks.website = website;
    if (youtube !== undefined) profileFields.socialLinks.youtube = youtube;
    if (twitter !== undefined) profileFields.socialLinks.twitter = twitter;
    if (facebook !== undefined) profileFields.socialLinks.facebook = facebook;
    if (linkedin !== undefined) profileFields.socialLinks.linkedin = linkedin;
    if (instagram !== undefined) profileFields.socialLinks.instagram = instagram;

    let profile = await Profile.findOne({ user: userId });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: userId },
        { $set: profileFields },
        { new: true }
      ).populate('user', ['name', 'email', 'avatar', 'role', 'isVerifiedBadge']);
      return res.json(profile);
    }

    profile = new Profile(profileFields);
    await profile.save();
    profile = await profile.populate('user', ['name', 'email', 'avatar', 'role', 'isVerifiedBadge']);
    res.json(profile);

  } catch (err) {
    console.error('Error in createOrUpdateProfile:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getCurrentProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ message: 'There is no profile for this user' });
    }

    const connectionCount = await Connection.countDocuments({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
      status: 'accepted'
    });

    const followersCount = await Follow.countDocuments({ following: req.user.id });
    const followingCount = await Follow.countDocuments({ follower: req.user.id });

    const profileData = profile.toJSON();
    profileData.connectionCount = connectionCount;
    profileData.followersCount = followersCount;
    profileData.followingCount = followingCount;

    res.json(profileData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get profile by user ID
// @route   GET /api/profile/user/:user_id
// @access  Public
const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Track profile view
    if (req.user && req.user.id !== profile.user._id.toString()) {
      const alreadyViewedToday = profile.profileViews.some(view => {
        return view.viewer.toString() === req.user.id && 
               (Date.now() - new Date(view.viewedAt).getTime() < 24 * 60 * 60 * 1000);
      });
      
      if (!alreadyViewedToday) {
        profile.profileViews.unshift({ viewer: req.user.id });
        profile.views = (profile.views || 0) + 1;
        await profile.save();
      }
    }

    const connectionCount = await Connection.countDocuments({
      $or: [{ requester: req.params.user_id }, { recipient: req.params.user_id }],
      status: 'accepted'
    });

    const followersCount = await Follow.countDocuments({ following: req.params.user_id });
    const followingCount = await Follow.countDocuments({ follower: req.params.user_id });

    const profileData = profile.toJSON();
    profileData.connectionCount = connectionCount;
    profileData.followersCount = followersCount;
    profileData.followingCount = followingCount;

    res.json(profileData);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Add profile experience
// @route   PUT /api/profile/experience
// @access  Private
const addExperience = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(req.body);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete profile experience
// @route   DELETE /api/profile/experience/:exp_id
// @access  Private
const deleteExperience = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience = profile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add profile education
// @route   PUT /api/profile/education
// @access  Private
const addEducation = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(req.body);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete profile education
// @route   DELETE /api/profile/education/:edu_id
// @access  Private
const deleteEducation = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education = profile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add profile certification
// @route   PUT /api/profile/certifications
// @access  Private
const addCertification = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.certifications.unshift(req.body);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete profile certification
// @route   DELETE /api/profile/certifications/:cert_id
// @access  Private
const deleteCertification = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.certifications = profile.certifications.filter(
      (cert) => cert._id.toString() !== req.params.cert_id
    );
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};



// @desc    Follow a user
// @route   POST /api/profile/follow/:user_id
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.user_id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if follow relationship already exists
    const existingFollow = await Follow.findOne({ follower: currentUserId, following: targetUserId });
    if (existingFollow) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // Create Follow record
    const newFollow = new Follow({ follower: currentUserId, following: targetUserId });
    await newFollow.save();

    // Update Profiles
    await Profile.findOneAndUpdate({ user: targetUserId }, { $addToSet: { followers: currentUserId } });
    await Profile.findOneAndUpdate({ user: currentUserId }, { $addToSet: { following: targetUserId } });

    // Create Notification
    const notification = await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'follow',
      message: 'started following you.',
    });
    
    const populatedNotif = await notification.populate('sender', 'name avatar');
    const receiverSocketId = getReceiverSocketId(targetUserId);
    if (receiverSocketId) {
      getIo().to(receiverSocketId).emit('newNotification', populatedNotif);
    }

    res.json({ message: 'User followed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Unfollow a user
// @route   POST /api/profile/unfollow/:user_id
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.user_id;
    const currentUserId = req.user.id;

    const existingFollow = await Follow.findOneAndDelete({ follower: currentUserId, following: targetUserId });
    
    if (!existingFollow) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Update Profiles
    await Profile.findOneAndUpdate({ user: targetUserId }, { $pull: { followers: currentUserId } });
    await Profile.findOneAndUpdate({ user: currentUserId }, { $pull: { following: targetUserId } });

    res.json({ message: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get profile analytics (views and recent viewers)
// @route   GET /api/profile/analytics
// @access  Private
const getProfileAnalytics = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('profileViews.viewer', ['name', 'avatar', 'status']);
      
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Calculate views in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentViews = profile.profileViews.filter(view => 
      new Date(view.viewedAt) >= sevenDaysAgo
    ).length;

    res.json({
      totalViews: profile.views || 0,
      recentViews,
      viewers: profile.profileViews.slice(0, 20) // send only last 20 viewers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Search profiles
// @route   GET /api/profile/search
// @access  Private
const searchProfiles = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      const profiles = await Profile.find().populate('user', 'name avatar').limit(20);
      return res.json(profiles);
    }
    
    // 1. Parallel native text search on User (for names)
    const users = await User.find({ $text: { $search: q } }, { score: { $meta: "textScore" } }).select('_id');
    const userIds = users.map(u => u._id);

    // 2. Query Profiles for User Name matches
    const profilesFromUsersPromise = Profile.find({ user: { $in: userIds } }).populate('user', 'name avatar').lean();

    // 3. Parallel native text search on Profile (for status, company, skills, location, bio)
    const profilesFromTextPromise = Profile.find(
      { $text: { $search: q } }, 
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .populate('user', 'name avatar')
    .lean();

    // Execute both in parallel for blazing fast performance
    const [profilesFromUsers, profilesFromText] = await Promise.all([
      profilesFromUsersPromise,
      profilesFromTextPromise
    ]);

    // 4. Merge and Deduplicate Results
    const profileMap = new Map();
    
    // Text matches (Company/Skills) have implicit score sorting, we add them first if we want them prioritized, 
    // but name matches are also very important. We will add Name matches first.
    profilesFromUsers.forEach(p => profileMap.set(p._id.toString(), p));
    
    profilesFromText.forEach(p => {
      if (!profileMap.has(p._id.toString())) {
        profileMap.set(p._id.toString(), p);
      }
    });

    // Limit to top 20 combined results
    const combinedProfiles = Array.from(profileMap.values()).slice(0, 20);

    res.json(combinedProfiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get network suggestions
// @route   GET /api/profile/suggestions
// @access  Private
const getNetworkSuggestions = async (req, res) => {
  try {
    const myProfile = await Profile.findOne({ user: req.user.id });
    if (!myProfile) return res.status(404).json({ msg: 'Profile not found' });
    
    // Find profiles that are NOT the current user, and NOT already followed
    // and share skills or location (if possible), or just random limit 10
    const query = {
      user: { $ne: req.user.id },
      _id: { $nin: myProfile.following || [] }
    };

    if (myProfile.skills && myProfile.skills.length > 0) {
      query.$or = [
        { skills: { $in: myProfile.skills } },
        { location: myProfile.location }
      ];
    }

    let suggestions = await Profile.find(query).populate('user', 'name avatar').limit(10);
    
    // If we didn't find enough, just fetch recent profiles we aren't following
    if (suggestions.length < 5) {
      const moreSuggestions = await Profile.find({
        user: { $ne: req.user.id },
        _id: { $nin: myProfile.following || [] }
      }).populate('user', 'name avatar').limit(10 - suggestions.length);
      
      // Combine and remove duplicates
      const allSuggestions = [...suggestions, ...moreSuggestions];
      suggestions = Array.from(new Set(allSuggestions.map(s => s._id.toString())))
        .map(id => allSuggestions.find(s => s._id.toString() === id));
    }

    res.json(suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get followers
// @route   GET /api/profile/followers
// @access  Private
const getFollowers = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('followers', 'name avatar');
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    
    // followers array contains User IDs, we need their Profile details
    const followerProfiles = await Profile.find({ user: { $in: profile.followers } }).populate('user', 'name avatar status');
    res.json(followerProfiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get following
// @route   GET /api/profile/following
// @access  Private
const getFollowing = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    
    // following array contains User IDs
    const followingProfiles = await Profile.find({ user: { $in: profile.following } }).populate('user', 'name avatar status');
    res.json(followingProfiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Export authenticated user's complete GDPR data archive (.json)
// @route   GET /api/profile/export-data
// @access  Private
const exportSelfData = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-passwordHash -refreshToken -tokens');
    const profile = await Profile.findOne({ user: userId });
    const posts = await Post.find({ user: userId }).lean();
    const comments = await Comment.find({ user: userId }).lean();

    const dataPackage = {
      exportMetadata: {
        platform: 'DevHub Developer Network',
        standard: 'GDPR Article 20 & CCPA Machine-Readable Data Portability Archive',
        generatedAt: new Date().toISOString(),
        userId: userId.toString(),
      },
      account: user,
      profile: profile || {},
      activity: {
        totalPosts: posts.length,
        posts,
        totalComments: comments.length,
        comments,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=devhub-data-export-${userId}.json`);
    res.status(200).json(dataPackage);
  } catch (error) {
    console.error('Error exporting GDPR user data:', error);
    res.status(500).json({ message: 'Failed to generate data export archive: ' + error.message });
  }
};

module.exports = { 
  createOrUpdateProfile, 
  getCurrentProfile,
  getProfileByUserId,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addCertification,
  deleteCertification,

  followUser,
  unfollowUser,
  getProfileAnalytics,
  searchProfiles,
  getNetworkSuggestions,
  getFollowers,
  getFollowing,
  exportSelfData
};
