const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');
const aiService = require('../services/aiService');

/**
 * Step 3: Generate AI Job Description
 */
router.post('/generate-jd', async (req, res) => {
  try {
    const { role, skills, experienceLevel } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Job role is required' });
    }
    const description = await aiService.generateJobDescription(role, skills, experienceLevel);
    res.json({ success: true, description });
  } catch (error) {
    console.error('Error generating JD:', error);
    res.status(500).json({ error: 'Failed to generate Job Description' });
  }
});

/**
 * Step 3: Create a Job Post
 */
router.post('/', (req, res) => {
  try {
    const jobData = req.body;
    if (!jobData.title) {
      return res.status(400).json({ error: 'Job title is required' });
    }

    // Ensure total aspect weightages sum to 100
    if (jobData.aspectWeights) {
      const total = Object.values(jobData.aspectWeights).reduce((a, b) => Number(a) + Number(b), 0);
      if (total !== 100) {
        return res.status(400).json({ error: `Aspect weightages must sum to 100%. Current sum: ${total}%` });
      }
    }

    const newJob = jobService.createJob(jobData);
    res.status(201).json({ success: true, job: newJob });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job post' });
  }
});

/**
 * Get all jobs
 */
router.get('/', (req, res) => {
  const jobs = jobService.getAllJobs();
  res.json({ success: true, jobs });
});

/**
 * Step 4: Get Job by Shareable Link / Share ID
 */
router.get('/public/:shareId', (req, res) => {
  const job = jobService.getJobByShareId(req.params.shareId);
  if (!job) {
    return res.status(404).json({ error: 'Job post not found or link has expired' });
  }
  res.json({ success: true, job });
});

/**
 * Get Job by ID
 */
router.get('/:id', (req, res) => {
  const job = jobService.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job post not found' });
  }
  res.json({ success: true, job });
});

module.exports = router;
