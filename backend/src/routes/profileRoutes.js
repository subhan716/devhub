const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/profileController');
const { protect, protectOptional } = require('../middleware/authMiddleware');

router.post('/', protect, createOrUpdateProfile);
router.get('/me', protect, getCurrentProfile);
router.get('/analytics', protect, getProfileAnalytics);
router.get('/search', protect, searchProfiles);
router.get('/suggestions', protect, getNetworkSuggestions);
router.get('/followers', protect, getFollowers);
router.get('/following', protect, getFollowing);
router.get('/user/:user_id', protectOptional, getProfileByUserId); // Public route with optional auth

// Experience routes
router.put('/experience', protect, addExperience);
router.delete('/experience/:exp_id', protect, deleteExperience);

// Education routes
router.put('/education', protect, addEducation);
router.delete('/education/:edu_id', protect, deleteEducation);

// Certifications routes
router.put('/certifications', protect, addCertification);
router.delete('/certifications/:cert_id', protect, deleteCertification);

// Projects routes
router.put('/projects', protect, addProject);
router.put('/projects/:prj_id', protect, editProject);
router.delete('/projects/:prj_id', protect, deleteProject);

// Follow / Unfollow routes
router.post('/follow/:user_id', protect, followUser);
router.post('/unfollow/:user_id', protect, unfollowUser);

module.exports = router;
