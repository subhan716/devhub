const prisma = require('../config/prisma');

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

// @desc    Get profile by user ID
// @route   GET /api/profile/user/:user_id
// @access  Public (Optional auth)
const getProfileByUserId = async (req, res) => {
  try {
    const targetUserId = req.params.user_id || req.params.id;

    let profile = await prisma.profile.findUnique({
      where: { userId: targetUserId },
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
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true, email: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true }
      });

      if (!user) return res.status(404).json({ message: 'Profile not found' });

      profile = await prisma.profile.create({
        data: { userId: targetUserId, status: 'Developer', skills: [] },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, isVerifiedBadge: true, badgeType: true } } }
      });
    }

    // Increment views if viewer is different
    if (req.user?.id && req.user.id !== targetUserId) {
      await prisma.profile.update({
        where: { userId: targetUserId },
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

// @desc    Delete user and profile
// @route   DELETE /api/profile
// @access  Private
const deleteProfile = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.status(200).json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Follow user
// @route   POST /api/profile/follow/:user_id
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.user_id || req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      },
      update: {},
      create: {
        followerId: currentUserId,
        followingId: targetUserId
      }
    });

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

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Unfollow user
// @route   POST /api/profile/unfollow/:user_id
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.user_id || req.params.id;
    await prisma.follow.deleteMany({
      where: {
        followerId: req.user.id,
        followingId: targetUserId
      }
    });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
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
    const currentUserId = req.user?.id;

    // Get excluded connected / pending user IDs
    let excludedUserIds = new Set();
    if (currentUserId) {
      excludedUserIds.add(currentUserId);
      const existingConns = await prisma.connection.findMany({
        where: {
          OR: [{ requesterId: currentUserId }, { recipientId: currentUserId }]
        },
        select: { requesterId: true, recipientId: true }
      });
      existingConns.forEach(c => {
        excludedUserIds.add(c.requesterId);
        excludedUserIds.add(c.recipientId);
      });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedUserIds) },
        isSuspended: false,
        role: 'user',
        email: { not: { contains: 'support@' } }
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isVerifiedBadge: true,
        badgeType: true,
        profile: {
          select: {
            id: true,
            status: true,
            company: true,
            location: true,
            bio: true,
            skills: true,
            githubusername: true
          }
        }
      },
      take: 15,
      orderBy: { createdAt: 'desc' }
    });

    const formatted = users.map(u => {
      const avatarUrl = u.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      return {
        _id: u.id,
        id: u.id,
        name: u.name,
        avatar: { url: avatarUrl },
        avatarUrl: avatarUrl,
        isVerifiedBadge: u.isVerifiedBadge,
        badgeType: u.badgeType,
        headline: u.profile?.status || 'Developer',
        bio: u.profile?.bio || '',
        company: u.profile?.company || '',
        location: u.profile?.location || '',
        profile: u.profile,
        user: {
          _id: u.id,
          id: u.id,
          name: u.name,
          avatar: { url: avatarUrl },
          avatarUrl: avatarUrl
        }
      };
    });

    res.status(200).json(formatted);
  } catch (e) {
    console.error('Error in getNetworkSuggestions:', e);
    res.status(500).json([]);
  }
};

const getOnboardingSuggestions = async (req, res) => {
  return getNetworkSuggestions(req, res);
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
        avatar: { url: avatarUrl },
        avatarUrl
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
        avatar: { url: avatarUrl },
        avatarUrl
      };
    }));
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
