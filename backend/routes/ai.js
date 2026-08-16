const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');
const aiService = require('../services/aiService');
const githubVerificationService = require('../services/githubVerificationService');

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

/**
 * Step 8: Complete AI GitHub Verification Engine
 */
router.post('/verify-github', async (req, res) => {
  try {
    const { applicationId, githubUrl } = req.body;
    if (!applicationId) return res.status(400).json({ error: 'Application ID is required' });

    const application = await jobService.getApplicationById(applicationId);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const verification = await jobService.getVerificationByApplicationId(applicationId);
    if (!verification || !verification.parsedResume) {
      return res.status(400).json({ error: 'Resume not parsed yet. Please wait for the initial AI pipeline.' });
    }

    let targetGithubUrl = githubUrl || application.githubUrl || verification.parsedResume.extractedGithub;
    if (!targetGithubUrl) {
      return res.json({
        success: true,
        verificationData: {
          overallScore: 0,
          identityConfidence: 0,
          status: 'GitHub verification unavailable — no GitHub profile provided.',
          skills: [],
          projects: []
        }
      });
    }

    const match = targetGithubUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
    const username = match ? match[1] : targetGithubUrl;

    // 1. Fetch GitHub Data
    const githubData = await githubVerificationService.fetchGithubProfileData(username);
    if (!githubData.valid) {
      return res.status(400).json({ error: 'Could not fetch data from GitHub. Please check the URL or try again later.' });
    }

    // 2. Verify Identity
    const identityResult = githubVerificationService.verifyIdentity(application.candidateName, githubData);

    // 3. Verify Skills
    const claimedSkills = verification.parsedResume.detectedSkills || [];
    const skillsVerification = githubVerificationService.verifySkills(claimedSkills, githubData);

    // 4. Verify Projects
    const claimedProjects = verification.parsedResume.extractedProjects || [];
    const projectsVerification = githubVerificationService.verifyProjects(claimedProjects, githubData);

    // 5. Calculate Overall Score
    let avgSkillScore = skillsVerification.length > 0 ? skillsVerification.reduce((acc, s) => acc + s.score, 0) / skillsVerification.length : 0;
    let avgProjectScore = projectsVerification.length > 0 ? projectsVerification.reduce((acc, p) => acc + p.score, 0) / projectsVerification.length : 0;
    
    // Skill: 40%, Project: 40%, Identity: 20%
    const overallScore = Math.round((avgSkillScore * 0.4) + (avgProjectScore * 0.4) + (identityResult.score * 0.2));

    const githubVerificationReport = {
      overallScore,
      identityConfidence: identityResult,
      skills: skillsVerification,
      projects: projectsVerification,
      githubUrl: targetGithubUrl,
      profile: githubData.profile ? { name: githubData.profile.name, login: githubData.profile.login, public_repos: githubData.profile.public_repos } : null
    };

    // Optionally save it back to VerificationResult
    verification.githubVerification = githubVerificationReport;
    if (verification.save) {
      await verification.save();
    }

    res.json({
      success: true,
      verificationData: githubVerificationReport
    });
  } catch (error) {
    console.error('Error during GitHub verification:', error);
    res.status(500).json({ error: 'Internal Server Error during verification' });
  }
});

module.exports = router;
