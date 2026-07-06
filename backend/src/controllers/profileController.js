const Profile = require('../models/Profile');

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

module.exports = { 
  createOrUpdateProfile, 
  getCurrentProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addProject,
  deleteProject
};
