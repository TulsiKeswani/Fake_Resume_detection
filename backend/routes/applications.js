const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jobService = require('../services/jobService');
const aiService = require('../services/aiService');

// Configure upload directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

/**
 * Step 4: Candidate Job Application Submission
 */
router.post('/submit', upload.single('resume'), async (req, res) => {
  try {
    const {
      jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      githubUrl,
      leetcodeUrl,
      portfolioUrl,
      formAnswers
    } = req.body;

    // 1. Mandatory File Check
    if (!req.file) {
      return res.status(400).json({ error: 'Resume upload is mandatory.' });
    }

    // 2. Mandatory Candidate Basic Fields Check
    if (!jobId || !candidateName || !candidateEmail) {
      return res.status(400).json({ error: 'Name, Email, and Job ID are required.' });
    }

    // 3. Mandatory Developer / Work Verification Link Check
    // GitHub, LeetCode, OR an Official Skill/Project/Work link MUST be provided
    const hasGithub = githubUrl && githubUrl.trim().length > 0;
    const hasLeetcode = leetcodeUrl && leetcodeUrl.trim().length > 0;
    const hasPortfolio = portfolioUrl && portfolioUrl.trim().length > 0;

    if (!hasGithub && !hasLeetcode && !hasPortfolio) {
      return res.status(400).json({
        error: 'Please provide at least one verification link (GitHub Profile, LeetCode Profile, or an Official Work/Project/Skill link).'
      });
    }

    let parsedFormAnswers = {};
    try {
      parsedFormAnswers = typeof formAnswers === 'string' ? JSON.parse(formAnswers) : (formAnswers || {});
    } catch (e) {
      parsedFormAnswers = {};
    }

    // Create Application
    const application = jobService.createApplication({
      jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      githubUrl: githubUrl || '',
      leetcodeUrl: leetcodeUrl || '',
      portfolioUrl: portfolioUrl || '',
      resumeUrl: `/uploads/${req.file.filename}`,
      resumeOriginalName: req.file.originalname,
      formAnswers: parsedFormAnswers
    });

    // Step 5: Trigger AI Verification Pipeline asynchronously
    runAiVerificationPipeline(application.id, req.file.path, {
      githubUrl,
      leetcodeUrl,
      portfolioUrl
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      applicationId: application.id
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: error.message || 'Failed to submit application.' });
  }
});

/**
 * Helper function for Step 5: Async AI Processing Pipeline
 */
async function runAiVerificationPipeline(applicationId, filePath, devLinks) {
  try {
    // 1. Parse Resume Text
    const parsedResume = await aiService.parseResumeText(filePath);

    // 2. Detect AI Confidence Score
    const aiDetection = aiService.detectAiGeneratedResume(parsedResume.rawText);

    // 3. External Developer Profile Verification
    const devProfiles = await aiService.verifyDeveloperProfile({
      githubUrl: devLinks.githubUrl || parsedResume.extractedGithub,
      leetcodeUrl: devLinks.leetcodeUrl || parsedResume.extractedLeetcode,
      portfolioUrl: devLinks.portfolioUrl
    });

    // 4. Compute Composite Score
    const overallScore = aiService.calculateCompositeScore(parsedResume, aiDetection, devProfiles);

    // Save Verification Record
    jobService.saveVerification(applicationId, {
      parsedResume,
      aiDetection,
      devProfiles,
      overallScore
    });

    console.log(`[AI Pipeline] Verification completed for application: ${applicationId}`);
  } catch (err) {
    console.error(`[AI Pipeline Error] Application ${applicationId}:`, err);
    // Save a failed verification state so the frontend doesn't hang forever
    jobService.saveVerification(applicationId, {
      error: 'AI Verification Pipeline failed to process this application.',
      parsedResume: { error: 'Failed to parse', estimatedExperienceYears: 'Unable to determine' },
      aiDetection: { unavailable: true, aiConfidenceScore: null, breakdown: {} },
      devProfiles: { githubData: {}, leetcodeData: {}, officialLinkData: {} },
      overallScore: 0
    });
  }
}

/**
 * Get Application Details
 */
router.get('/:id', (req, res) => {
  const app = jobService.getApplicationById(req.params.id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }
  const verification = jobService.getVerificationByApplicationId(req.params.id);
  res.json({ success: true, application: app, verification });
});

/**
 * Get Applications for a Job
 */
router.get('/job/:jobId', (req, res) => {
  const list = jobService.getApplicationsByJobId(req.params.jobId);
  res.json({ success: true, applications: list });
});

module.exports = router;
