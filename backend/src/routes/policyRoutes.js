const express = require('express');
const router = express.Router();
const { getPolicyBySlug, getAllPolicies } = require('../controllers/policyController');

// Public Policy Routes (Web App & Mobile App Sync)
router.get('/', getAllPolicies);
router.get('/:slug', getPolicyBySlug);

module.exports = router;
