const express = require('express');
const router = express.Router();
const { 
  createOrUpdateProfile, 
  getCurrentProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addProject,
  deleteProject,
  editProject
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrUpdateProfile);
router.get('/me', protect, getCurrentProfile);

// Experience routes
router.put('/experience', protect, addExperience);
router.delete('/experience/:exp_id', protect, deleteExperience);

// Education routes
router.put('/education', protect, addEducation);
router.delete('/education/:edu_id', protect, deleteEducation);

// Projects routes
router.put('/projects', protect, addProject);
router.put('/projects/:prj_id', protect, editProject);
router.delete('/projects/:prj_id', protect, deleteProject);

module.exports = router;
