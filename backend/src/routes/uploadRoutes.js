const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

function checkPdfFileType(file, cb) {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('PDF or DOC/DOCX only!');
  }
}

const uploadPdf = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkPdfFileType(file, cb);
  },
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
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
router.post('/cover', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
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
router.post('/resume', protect, uploadPdf.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No document uploaded' });
    }

    const documentUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
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
router.post('/project-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
