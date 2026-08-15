const express = require('express');
const router = express.Router();
const { getCandidateDashboardData } = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('candidate'), getCandidateDashboardData);

module.exports = router;
