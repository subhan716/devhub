const Profile = require('../models/Profile');
const Follow = require('../models/Follow');

// @desc    Create or update user profile
// @route   POST /api/profile
// @access  Private
const createOrUpdateProfile = async (req, res) => {
  const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;
  
  // Skills - Spilt into array if it's a comma separated string
  if (skills) {
    profileFields.skills = Array.isArray(skills) ? skills : skills.split(',').map((skill) => skill.trim());
  }

  // Build socialLinks object
  profileFields.socialLinks = {};
  if (website) profileFields.socialLinks.website = website;
  if (youtube) profileFields.socialLinks.youtube = youtube;
  if (twitter) profileFields.socialLinks.twitter = twitter;
  if (facebook) profileFields.socialLinks.facebook = facebook;
  if (linkedin) profileFields.socialLinks.linkedin = linkedin;
  if (instagram) profileFields.socialLinks.instagram = instagram;

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create new profile
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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

    res.json(profile);
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

    res.json(profile);
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

// @desc    Add profile project
// @route   PUT /api/profile/projects
// @access  Private
const addProject = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.projects.unshift(req.body);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete profile project
// @route   DELETE /api/profile/projects/:prj_id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.projects = profile.projects.filter(
      (prj) => prj._id.toString() !== req.params.prj_id
    );
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Edit profile project
// @route   PUT /api/profile/projects/:prj_id
// @access  Private
const editProject = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const projectIndex = profile.projects.findIndex(
      (prj) => prj._id.toString() === req.params.prj_id
    );

    if (projectIndex === -1) {
      return res.status(404).json({ message: 'Project not found' });
    }

    profile.projects[projectIndex] = { _id: req.params.prj_id, ...req.body };
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
    const { q, skill, location } = req.query;
    const query = {};
    
    if (q) {
      query.$or = [
        { 'user.name': { $regex: q, $options: 'i' } },
        { status: { $regex: q, $options: 'i' } }
      ];
    }
    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const profiles = await Profile.find(query).populate('user', 'name avatar').limit(20);
    res.json(profiles);
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
    
    // following array contains Profile IDs
    const followingProfiles = await Profile.find({ _id: { $in: profile.following } }).populate('user', 'name avatar status');
    res.json(followingProfiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
  addProject,
  deleteProject,
  editProject,
  followUser,
  unfollowUser,
  getProfileAnalytics,
  searchProfiles,
  getNetworkSuggestions,
  getFollowers,
  getFollowing
};
