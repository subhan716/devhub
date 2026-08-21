const prisma = require('../config/prisma');

const DEFAULT_LANDING_CONFIG = {
  key: 'global_landing',
  badgeText: 'The Universal Professional & Creator Network 🚀',
  heroTitlePrefix: 'The Network for',
  heroHighlight: 'Those Who Build, Create & Lead.',
  heroDescription: 'Connect with elite creators, tech founders, designers, and innovators. Showcase your work and build high-impact partnerships across the digital universe.',
  ctaPrimaryText: 'Start Networking',
  ctaPrimaryLink: '/register',
  ctaSecondaryText: 'Explore Ecosystem',
  ctaSecondaryLink: '#features',
  marqueeKeywords: [
    'Tech & Engineering',
    'Creative & Design',
    'Product & Leadership',
    'Founders & Startups',
    'AI & Data Science',
    'Growth & Marketing',
    'Venture & Capital'
  ],
  stats: {
    members: '50K+',
    projects: '120K+',
    collaborations: '95K+',
    countries: '140+'
  },
  features: [
    {
      icon: 'Users',
      color: '#00F0FF',
      title: 'Verified Professional Identity',
      desc: 'Showcase your real-world achievements, multi-disciplinary portfolio, and verified credentials.'
    },
    {
      icon: 'Briefcase',
      color: '#FF0055',
      title: 'Smart Co-Founder & Peer Matching',
      desc: 'Connect with engineers, designers, and marketers based on verified skill graphs.'
    },
    {
      icon: 'Rocket',
      color: '#8A2BE2',
      title: 'High-Impact Opportunities',
      desc: 'Land top tier remote roles, venture collaborations, and creator partnerships directly.'
    }
  ],
  model3DConfig: {
    speed: 1.0,
    particleCount: 1500,
    glowIntensity: 2.0,
    coreColor: '#00F0FF',
    secondaryColor: '#8A2BE2'
  }
};

// @desc    Get Public Landing Page Configuration (Real-Time from Supabase)
// @route   GET /api/config/landing
// @access  Public
const getPublicLandingConfig = async (req, res) => {
  try {
    let config = await prisma.landingConfig.findUnique({
      where: { key: 'global_landing' }
    });

    if (!config) {
      // Seed default configuration if not present
      config = await prisma.landingConfig.create({
        data: DEFAULT_LANDING_CONFIG
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching landing config from Supabase:', error);
    res.status(200).json({
      success: true,
      data: DEFAULT_LANDING_CONFIG
    });
  }
};

// @desc    Update Landing Page Configuration (Admin Panel CMS)
// @route   PUT /api/admin/landing-config
// @access  Private/Admin
const updateAdminLandingConfig = async (req, res) => {
  try {
    const {
      badgeText,
      heroTitlePrefix,
      heroHighlight,
      heroDescription,
      ctaPrimaryText,
      ctaPrimaryLink,
      ctaSecondaryText,
      ctaSecondaryLink,
      marqueeKeywords,
      stats,
      features,
      model3DConfig
    } = req.body;

    const updated = await prisma.landingConfig.upsert({
      where: { key: 'global_landing' },
      update: {
        badgeText,
        heroTitlePrefix,
        heroHighlight,
        heroDescription,
        ctaPrimaryText,
        ctaPrimaryLink,
        ctaSecondaryText,
        ctaSecondaryLink,
        marqueeKeywords,
        stats,
        features,
        model3DConfig,
        lastUpdatedBy: req.user?._id?.toString() || req.user?.id || 'admin',
        lastUpdatedEmail: req.user?.email || 'admin@devhub.com'
      },
      create: {
        ...DEFAULT_LANDING_CONFIG,
        badgeText,
        heroTitlePrefix,
        heroHighlight,
        heroDescription,
        ctaPrimaryText,
        ctaPrimaryLink,
        ctaSecondaryText,
        ctaSecondaryLink,
        marqueeKeywords: marqueeKeywords || DEFAULT_LANDING_CONFIG.marqueeKeywords,
        stats: stats || DEFAULT_LANDING_CONFIG.stats,
        features: features || DEFAULT_LANDING_CONFIG.features,
        model3DConfig: model3DConfig || DEFAULT_LANDING_CONFIG.model3DConfig,
        lastUpdatedBy: req.user?._id?.toString() || req.user?.id || 'admin',
        lastUpdatedEmail: req.user?.email || 'admin@devhub.com'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Landing page configuration updated and synced live to Supabase!',
      data: updated
    });
  } catch (error) {
    console.error('Error updating landing config in Supabase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update landing page configuration',
      error: error.message
    });
  }
};

module.exports = {
  getPublicLandingConfig,
  updateAdminLandingConfig
};
