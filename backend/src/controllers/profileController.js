const prisma = require('../config/prisma');

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
const getCurrentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            isVerifiedBadge: true,
            badgeType: true,
            statusPreference: true
          }
        }
      }
    });

    if (!profile) {
      // Auto-create default profile if missing
      profile = await prisma.profile.create({
        data: {
          userId,
          skills: [],
          openToWork: { isLooking: false, jobTitles: [], workplaces: [], locations: [] },
          providingServices: { isProviding: false, services: [], details: '' },
          socialLinks: { github: '', linkedin: '', twitter: '', website: '' }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              role: true,
              isVerifiedBadge: true,
              badgeType: true,
              statusPreference: true
            }
          }
        }
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error in getCurrentProfile:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create or update user profile (Onboarding Wizard & Settings)
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
    avatarUrl,
    coverImageUrl,
    experience,
    education,
    certifications
  } = req.body;

  try {
    const userId = req.user.id;

    // 1. Update User basic info (Name, Avatar)
    const userUpdates = {};
    if (name && name.trim()) userUpdates.name = name.trim();
    if (avatarUrl) userUpdates.avatarUrl = avatarUrl;

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdates
      });
    }

    // 2. Format Social Links
    const socialLinks = {
      github: githubusername || '',
      linkedin: linkedin || '',
      twitter: twitter || '',
      website: website || '',
      youtube: youtube || '',
      facebook: facebook || '',
      instagram: instagram || ''
    };

    // 3. Format Skills array
    let skillsArray = [];
    if (skills) {
      skillsArray = Array.isArray(skills) 
        ? skills.map(s => s.trim()).filter(Boolean)
        : skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    // 4. Upsert Profile on Supabase PostgreSQL
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        company: company !== undefined ? company : undefined,
        location: location !== undefined ? location : undefined,
        bio: bio !== undefined ? bio : undefined,
        about: about !== undefined ? about : undefined,
        status: status !== undefined ? status : undefined,
        githubusername: githubusername !== undefined ? githubusername : undefined,
        avatarUrl: avatarUrl || undefined,
        coverImageUrl: coverImageUrl || undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
        openToWork: openToWork || undefined,
        providingServices: providingServices || undefined,
        socialLinks: socialLinks || undefined,
        experience: experience || undefined,
        education: education || undefined,
        certifications: certifications || undefined
      },
      create: {
        userId,
        company: company || '',
        location: location || '',
        bio: bio || '',
        about: about || '',
        status: status || '',
        githubusername: githubusername || '',
        avatarUrl: avatarUrl || undefined,
        coverImageUrl: coverImageUrl || undefined,
        skills: skillsArray,
        openToWork: openToWork || { isLooking: false, jobTitles: [], workplaces: [], locations: [] },
        providingServices: providingServices || { isProviding: false, services: [], details: '' },
        socialLinks: socialLinks,
        experience: experience || [],
        education: education || [],
        certifications: certifications || []
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            isVerifiedBadge: true,
            badgeType: true
          }
        }
      }
    });

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error in createOrUpdateProfile:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all profiles
// @route   GET /api/profile
// @access  Public
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isVerifiedBadge: true,
            badgeType: true
          }
        }
      },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error in getAllProfiles:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get profile by User ID
// @route   GET /api/profile/user/:user_id
// @access  Public
const getProfileByUserId = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.params.user_id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isVerifiedBadge: true,
            badgeType: true,
            statusPreference: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error in getProfileByUserId:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Onboarding Suggestions (Top Verified Creators & Innovators)
// @route   GET /api/profile/suggestions/onboarding
// @access  Private
const getOnboardingSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const suggestions = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isSuspended: false
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isVerifiedBadge: true,
        badgeType: true,
        profile: {
          select: {
            status: true,
            company: true,
            location: true,
            skills: true
          }
        }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error in getOnboardingSuggestions:', error);
    res.status(500).json({ success: false, suggestions: [] });
  }
};

// @desc    Delete profile & user account
// @route   DELETE /api/profile
// @access  Private
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.user.delete({ where: { id: userId } });
    res.status(200).json({ message: 'User account and profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Follow a user
// @route   POST /api/profile/follow/:id
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId
      }
    });

    // Create Notification
    try {
      await prisma.notification.create({
        data: {
          recipientId: targetUserId,
          senderId: currentUserId,
          type: 'follow',
          message: 'started following you.'
        }
      });
    } catch (nErr) {}

    res.status(200).json({ success: true, message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/profile/follow/:id
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    await prisma.follow.deleteMany({
      where: {
        followerId: currentUserId,
        followingId: targetUserId
      }
    });

    res.status(200).json({ success: true, message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helpers for Experience & Education
const addExperience = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const exp = profile?.experience || [];
    const updatedExp = [req.body, ...exp];
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { experience: updatedExp }
    });
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteExperience = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const exp = (profile?.experience || []).filter((_, i) => i.toString() !== req.params.exp_id);
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { experience: exp }
    });
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const addEducation = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const edu = profile?.education || [];
    const updatedEdu = [req.body, ...edu];
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { education: updatedEdu }
    });
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteEducation = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const edu = (profile?.education || []).filter((_, i) => i.toString() !== req.params.edu_id);
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { education: edu }
    });
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const addCertification = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const certs = profile?.certifications || [];
    const updatedCerts = [req.body, ...certs];
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { certifications: updatedCerts }
    });
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteCertification = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const certs = (profile?.certifications || []).filter((_, i) => i.toString() !== req.params.cert_id);
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { certifications: certs }
    });
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// Additional Profile Operations for Parity
const getProfileAnalytics = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    res.status(200).json({
      success: true,
      analytics: {
        views: profile?.views || 0,
        profileViews: profile?.profileViews || []
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, analytics: { views: 0, profileViews: [] } });
  }
};

const searchProfiles = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q || '', mode: 'insensitive' } },
          { email: { contains: q || '', mode: 'insensitive' } }
        ]
      },
      include: { profile: true },
      take: 20
    });
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json([]);
  }
};

const getNetworkSuggestions = async (req, res) => {
  return getOnboardingSuggestions(req, res);
};

const getFollowers = async (req, res) => {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: req.user.id },
      include: { follower: { include: { profile: true } } }
    });
    res.status(200).json(followers.map(f => f.follower));
  } catch (e) {
    res.status(500).json([]);
  }
};

const getFollowing = async (req, res) => {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      include: { following: { include: { profile: true } } }
    });
    res.status(200).json(following.map(f => f.following));
  } catch (e) {
    res.status(500).json([]);
  }
};

const exportSelfData = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true, posts: true, comments: true }
    });
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getProfileAnalytics,
  searchProfiles,
  getNetworkSuggestions,
  getFollowers,
  getFollowing,
  exportSelfData,
  getCurrentProfile,
  createOrUpdateProfile,
  getAllProfiles,
  getProfileByUserId,
  getOnboardingSuggestions,
  deleteProfile,
  followUser,
  unfollowUser,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addCertification,
  deleteCertification
};
