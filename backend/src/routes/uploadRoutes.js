const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadImage, uploadDocument, uploadChatAttachment } = require('../config/cloudinary');
const prisma = require('../config/prisma');

router.get('/test-env', (req, res) => {
  res.json({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
    api_key: process.env.CLOUDINARY_API_KEY || 'MISSING',
    has_secret: !!process.env.CLOUDINARY_API_SECRET,
    cloudinary_url_exists: !!process.env.CLOUDINARY_URL
  });
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = req.file.path;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: imageUrl }
    });

    await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: { avatarUrl: imageUrl },
      create: { userId: req.user.id, avatarUrl: imageUrl }
    });

    res.json({ url: imageUrl, avatarUrl: imageUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
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

    await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: { coverImageUrl: imageUrl },
      create: { userId: req.user.id, coverImageUrl: imageUrl }
    });

    res.json({ url: imageUrl, coverImageUrl: imageUrl, coverImage: { url: imageUrl } });
  } catch (error) {
    console.error('Cover upload error:', error);
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
    const resumeObj = {
      url: documentUrl,
      name: req.file.originalname,
      size: req.file.size || 0
    };

    await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: { resume: resumeObj },
      create: { userId: req.user.id, resume: resumeObj }
    });

    res.json({ url: documentUrl, originalName: req.file.originalname, resume: resumeObj });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/upload/chat-attachment
// @desc    Upload chat attachment (image, video, audio, document)
// @access  Private
router.post('/chat-attachment', protect, uploadChatAttachment.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const url = req.file.path;
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
    console.error('Chat attachment error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
