const express = require('express');
const router = express.Router();
const githubVerificationService = require('../services/githubVerificationService');

// POST /api/verification/github
router.post('/github', async (req, res) => {
  try {
    const { githubUsername, candidateName, skills, projects } = req.body;

    if (!githubUsername) {
      return res.status(400).json({ success: false, message: 'GitHub username is required.' });
    }

    // 1. Fetch GitHub data
    const githubData = await githubVerificationService.fetchGithubProfileData(githubUsername);
    if (!githubData.valid) {
      return res.status(404).json({ success: false, message: githubData.error || 'GitHub profile could not be fetched.' });
    }

    // 2. Verify Skills
    const skillVerification = githubVerificationService.verifySkills(skills || [], githubData);

    // 3. Verify Projects
    const projectVerification = githubVerificationService.verifyProjects(projects || [], githubData);

    // 4. Verify Identity
    const identityVerification = githubVerificationService.verifyIdentity(candidateName, githubData);

    // 5. Calculate Overall Score
    let totalScore = 0;
    let weight = 0;

    // Averages
    const skillAvg = skillVerification.length > 0 ? (skillVerification.reduce((acc, s) => acc + s.score, 0) / skillVerification.length) : 0;
    const projectAvg = projectVerification.length > 0 ? (projectVerification.reduce((acc, p) => acc + p.score, 0) / projectVerification.length) : 0;

    let overallScore = 0;
    if (skillVerification.length > 0 && projectVerification.length > 0) {
      overallScore = (skillAvg * 0.4) + (projectAvg * 0.4) + (identityVerification.score * 0.2);
    } else if (skillVerification.length > 0) {
      overallScore = (skillAvg * 0.7) + (identityVerification.score * 0.3);
    } else if (projectVerification.length > 0) {
      overallScore = (projectAvg * 0.7) + (identityVerification.score * 0.3);
    } else {
      overallScore = identityVerification.score;
    }

    overallScore = Math.round(overallScore);

    let overallStatus = 'Unverified';
    if (overallScore >= 90) overallStatus = 'Strongly Verified';
    else if (overallScore >= 75) overallStatus = 'Verified';
    else if (overallScore >= 50) overallStatus = 'Partially Verified';
    else if (overallScore >= 25) overallStatus = 'Weak Evidence';

    console.log(`\n[GitHub Verification]`);
    console.log(`Username: ${githubData.profile.login}`);
    console.log(`Profile found: true`);
    console.log(`Repositories fetched: ${githubData.profile.public_repos}`);
    console.log(`Repositories analyzed: ${githubData.analyzedCount}`);
    console.log(`Skills extracted: ${skills ? skills.length : 0}`);
    console.log(`Projects extracted: ${projects ? projects.length : 0}`);
    console.log(`Overall score: ${overallScore}\n`);

    res.json({
      success: true,
      verificationResult: {
        githubProfile: {
          username: githubData.profile.login,
          url: githubData.profile.html_url,
          publicReposCount: githubData.profile.public_repos
        },
        overallScore,
        overallStatus,
        componentScores: {
          skills: Math.round(skillAvg),
          projects: Math.round(projectAvg),
          identity: identityVerification.score
        },
        skills: skillVerification,
        projects: projectVerification,
        identity: identityVerification,
        debugInfo: {
          repositoriesAnalyzed: githubData.analyzedCount,
          totalPublicRepos: githubData.profile.public_repos
        }
      }
    });

  } catch (error) {
    console.error('GitHub verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during verification.' });
  }
});

module.exports = router;
