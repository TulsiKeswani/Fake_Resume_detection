const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');
const aiService = require('../services/aiService');

/**
 * Step 5: Get AI Verification Report for an Application
 */
router.get('/verification/:applicationId', (req, res) => {
  const applicationId = req.params.applicationId;
  const verification = jobService.getVerificationByApplicationId(applicationId);
  const application = jobService.getApplicationById(applicationId);

  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  if (!verification) {
    return res.json({
      success: true,
      status: 'processing',
      message: 'AI verification pipeline is currently processing this candidate.'
    });
  }

  res.json({
    success: true,
    status: 'completed',
    application,
    verification
  });
});

/**
 * Step 5: Direct GitHub / LeetCode verification lookup test
 */
router.post('/verify-developer', async (req, res) => {
  try {
    const { githubUrl, leetcodeUrl, portfolioUrl } = req.body;
    const result = await aiService.verifyDeveloperProfile({ githubUrl, leetcodeUrl, portfolioUrl });
    res.json({ success: true, developerProfile: result });
  } catch (err) {
    console.error('Error verifying developer profile:', err);
    res.status(500).json({ error: 'Failed to verify developer profile' });
  }
});

module.exports = router;
