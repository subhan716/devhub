const express = require('express');
const router = express.Router();
const { getPublicLandingConfig } = require('../controllers/landingConfigController');

// Public Config Endpoints
router.get('/landing', getPublicLandingConfig);

module.exports = router;
