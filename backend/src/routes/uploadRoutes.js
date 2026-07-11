const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadImage, uploadDocument, uploadChatAttachment } = require('../config/cloudinary');
const User = require('../models/User');
const Profile = require('../models/Profile');

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = req.file.path; // Cloudinary returns URL in req.file.path
    
    // Update user model
    const user = await User.findById(req.user.id);
    user.avatar = { url: imageUrl };
    await user.save();

    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/upload/cover
// @desc    Upload profile cover image
// @access  Private
router.post('/cover', protect, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = req.file.path;
    
    // Update profile model
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.coverImage = { url: imageUrl };
      await profile.save();
    }

    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/upload/resume
// @desc    Upload profile resume (PDF/DOC)
// @access  Private
router.post('/resume', protect, uploadDocument.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No document uploaded' });
    }

    const documentUrl = req.file.path;
    
    // Update profile model
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.resume = { url: documentUrl, originalName: req.file.originalname };
      await profile.save();
    }

    res.json({ url: documentUrl, originalName: req.file.originalname });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/upload/project-image
// @desc    Upload project thumbnail image
// @access  Private
router.post('/project-image', protect, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = req.file.path;
    
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/upload/chat-attachment
// @desc    Upload chat attachment (image or document)
// @access  Private
router.post('/chat-attachment', protect, uploadChatAttachment.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const url = req.file.path;
    // Cloudinary automatically infers resource_type 'image', 'video' or 'raw' for 'auto'
    const isImage = req.file.mimetype.startsWith('image/');
    const isVideo = req.file.mimetype.startsWith('video/');
    const isAudio = req.file.mimetype.startsWith('audio/');
    
    let type = 'file';
    if (isImage) type = 'image';
    else if (isVideo) type = 'video';
    else if (isAudio) type = 'audio';
    
    res.json({ 
      url: url,
      type: type,
      name: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
