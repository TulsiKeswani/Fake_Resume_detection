const express = require('express');
const router = express.Router();
const { getCompanyDashboardData, createJobPost } = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('company'), getCompanyDashboardData);
router.post('/jobs', protect, authorize('company'), createJobPost);

module.exports = router;
