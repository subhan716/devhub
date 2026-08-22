const prisma = require('../config/prisma');
const { getRankedSuggestions, invalidateUserSuggestions } = require('../services/suggestionService');

const formatProfileForClient = async (profile) => {
  if (!profile) return null;
  const avatarUrl = profile.avatarUrl || profile.user?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  
  const [followersCount, followingCount, connectionCount, followerRows, followingRows] = await Promise.all([
    prisma.follow.count({ where: { followingId: profile.userId } }).catch(() => 0),
    prisma.follow.count({ where: { followerId: profile.userId } }).catch(() => 0),
    prisma.connection.count({
      where: {
        status: 'accepted',
        OR: [{ requesterId: profile.userId }, { recipientId: profile.userId }]
      }
    }).catch(() => 0),
    prisma.follow.findMany({
      where: { followingId: profile.userId },
      select: { followerId: true }
    }).catch(() => []),
    prisma.follow.findMany({
      where: { followerId: profile.userId },
      select: { followingId: true }
    }).catch(() => [])
  ]);

  return {
    ...profile,
    _id: profile.id,
    avatar: { url: avatarUrl },
    avatarUrl: avatarUrl,
    coverImageUrl: profile.coverImageUrl || null,
    coverImage: profile.coverImageUrl ? { url: profile.coverImageUrl } : null,
    followers: followerRows.map(f => f.followerId),
    following: followingRows.map(f => f.followingId),
    followersCount,
    followingCount,
    connectionCount,
    user: profile.user ? {
      ...profile.user,
      _id: profile.user.id,
      avatar: { url: profile.user.avatarUrl || avatarUrl },
      avatarUrl: profile.user.avatarUrl || avatarUrl
    } : undefined
  };
};

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
            isVerifiedBadge: true,
            badgeType: true
          }
        }
      }
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId,
          status: 'Developer',
          skills: []
        },
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
        }
      });
    }

    invalidateUserSuggestions(userId);
    const formatted = await formatProfileForClient(profile);
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error in getCurrentProfile:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update profile
// @route   POST /api/profile
// @access  Private
const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      company,
      location,
      bio,
      about,
      status,
      githubusername,
      skills,
      socialLinks,
      openToWork,
      providingServices,
      experience,
      education,
      certifications,
      coverImageUrl
    } = req.body;

    const dataObj = {};
    if (company !== undefined) dataObj.company = company;
    if (location !== undefined) dataObj.location = location;
    if (bio !== undefined) dataObj.bio = bio;
    if (about !== undefined) dataObj.about = about;
    if (status !== undefined) dataObj.status = status;
    if (githubusername !== undefined) dataObj.githubusername = githubusername;
    if (skills !== undefined) {
      dataObj.skills = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
    }
    if (socialLinks !== undefined) dataObj.socialLinks = socialLinks;
    if (openToWork !== undefined) dataObj.openToWork = openToWork;
    if (providingServices !== undefined) dataObj.providingServices = providingServices;
    if (experience !== undefined) dataObj.experience = experience;
    if (education !== undefined) dataObj.education = education;
    if (certifications !== undefined) dataObj.certifications = certifications;
    if (coverImageUrl !== undefined) dataObj.coverImageUrl = coverImageUrl;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: dataObj,
      create: { userId, ...dataObj },
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
      }
    });

    const formatted = await formatProfileForClient(profile);
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error in createOrUpdateProfile:', error);
    res.status(500).json({ message: error.message });
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
      }
    });

    const formatted = await Promise.all(profiles.map(p => formatProfileForClient(p)));
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error in getAllProfiles:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get profile by user ID or handle/username
// @route   GET /api/profile/user/:user_id
// @access  Public (Optional auth)
const getProfileByUserId = async (req, res) => {
  try {
    const rawTarget = req.params.user_id || req.params.id;
    const targetUserId = rawTarget.startsWith('@') ? rawTarget.slice(1) : rawTarget;

    let profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { userId: targetUserId },
          { user: { id: targetUserId } },
          { user: { name: { equals: targetUserId, mode: 'insensitive' } } },
          { user: { email: { startsWith: `${targetUserId}@`, mode: 'insensitive' } } },
          { githubusername: { equals: targetUserId, mode: 'insensitive' } }
        ]
      },
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
      }
    });

    if (!profile) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: targetUserId },
            { name: { equals: targetUserId, mode: 'insensitive' } },
            { email: { startsWith: `${targetUserId}@`, mode: 'insensitive' } }
          ]
        },
        select: { id: true, name: true, email: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true }
      });

      if (!user) return res.status(404).json({ message: 'Profile not found' });

      profile = await prisma.profile.create({
        data: { userId: user.id, status: 'Developer', skills: [] },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true } } }
      });
    }

    const resolvedUserId = profile.userId || profile.user?.id;

    // Increment views if viewer is different
    if (req.user?.id && req.user.id !== resolvedUserId) {
      await prisma.profile.update({
        where: { userId: resolvedUserId },
        data: { views: { increment: 1 } }
      }).catch(() => {});
    }

    const formatted = await formatProfileForClient(profile);
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error in getProfileByUserId:', error);
    res.status(500).json({ message: error.message });
  }
};

const addExperience = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const exp = profile?.experience || [];
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { experience: [req.body, ...exp] }
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
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { education: [req.body, ...edu] }
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
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { certifications: [req.body, ...certs] }
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
  try {
    const limit = Math.min(parseInt(req.query.limit) || 15, 50);
    const suggestions = await getRankedSuggestions(req.user?.id, limit);
    res.status(200).json(suggestions);
  } catch (e) {
    console.error('Error in getNetworkSuggestions:', e);
    res.status(500).json([]);
  }
};

const getOnboardingSuggestions = async (req, res) => {
  return getNetworkSuggestions(req, res);
};

// @desc    Follow a user
// @route   POST /api/profile/follow/:user_id
// @access  Private
const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.user_id || req.params.id;

    if (!followingId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    if (followerId === followingId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      },
      update: {},
      create: {
        followerId,
        followingId
      }
    });

    // Auto-create notification
    try {
      await prisma.notification.create({
        data: {
          recipientId: followingId,
          senderId: followerId,
          type: 'follow',
          message: `${req.user.name || 'A developer'} started following you.`
        }
      });
    } catch (notifErr) {}

    invalidateUserSuggestions(followerId);
    invalidateUserSuggestions(followingId);

    res.status(200).json({ success: true, message: 'Followed user successfully' });
  } catch (error) {
    console.error('Error in followUser:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unfollow a user
// @route   POST /api/profile/unfollow/:user_id
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.user_id || req.params.id;

    if (!followingId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId
      }
    });

    invalidateUserSuggestions(followerId);
    invalidateUserSuggestions(followingId);

    res.status(200).json({ success: true, message: 'Unfollowed user successfully' });
  } catch (error) {
    console.error('Error in unfollowUser:', error);
    res.status(500).json({ message: error.message });
  }
};

const getFollowers = async (req, res) => {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: req.user.id },
      include: { follower: { include: { profile: true } } }
    });
    res.status(200).json(followers.map(f => {
      const u = f.follower;
      const avatarUrl = u.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        ...u,
        _id: u.id,
        id: u.id,
        avatar: { url: avatarUrl },
        avatarUrl,
        user: {
          ...u,
          _id: u.id,
          id: u.id,
          name: u.name,
          avatar: { url: avatarUrl },
          avatarUrl
        }
      };
    }));
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
    res.status(200).json(following.map(f => {
      const u = f.following;
      const avatarUrl = u.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        ...u,
        _id: u.id,
        id: u.id,
        avatar: { url: avatarUrl },
        avatarUrl,
        user: {
          ...u,
          _id: u.id,
          id: u.id,
          name: u.name,
          avatar: { url: avatarUrl },
          avatarUrl
        }
      };
    }));
  } catch (e) {
    res.status(500).json([]);
  }
};

const deleteProfile = async (req, res) => {
  try {
    await prisma.profile.deleteMany({ where: { userId: req.user.id } });
    await prisma.user.delete({ where: { id: req.user.id } });
    res.status(200).json({ message: 'User account and profile deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
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
  getCurrentProfile,
  createOrUpdateProfile,
  getAllProfiles,
  getProfileByUserId,
  deleteProfile,
  followUser,
  unfollowUser,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addCertification,
  deleteCertification,
  getProfileAnalytics,
  searchProfiles,
  getNetworkSuggestions,
  getOnboardingSuggestions,
  getFollowers,
  getFollowing,
  exportSelfData
};
