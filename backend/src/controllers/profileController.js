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

module.exports = { createOrUpdateProfile, getCurrentProfile };
