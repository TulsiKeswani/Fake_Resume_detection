const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');
const interviewService = require('../services/interviewService');

/**
 * Helper to fetch parsedResume safely
 */
const getParsedResume = (applicationId) => {
  const verification = jobService.getVerificationByApplicationId(applicationId);
  if (!verification || !verification.parsedResume) {
    return null;
  }
  return verification.parsedResume;
};

/**
 * Step 6: Generate Next Adaptive Question
 */
router.post('/next-question', async (req, res) => {
  try {
    const { applicationId, interviewState } = req.body;
    
    if (!applicationId) return res.status(400).json({ error: 'Application ID is required' });
    
    const parsedResume = getParsedResume(applicationId);
    if (!parsedResume) {
      return res.status(400).json({ error: 'Parsed resume data not found for this application' });
    }

    const state = interviewState || {
      currentDifficulty: 1,
      askedQuestions: [],
      resumeTopics: []
    };

    const nextQuestionObj = await interviewService.generateNextQuestion(parsedResume, state);
    
    res.json({
      success: true,
      question: nextQuestionObj
    });
    
  } catch (err) {
    console.error('[Interview Route] Error generating question:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Step 6: Evaluate Candidate Answer
 */
router.post('/evaluate-answer', async (req, res) => {
  try {
    const { applicationId, questionObj, answer } = req.body;
    
    if (!applicationId || !questionObj || !answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedResume = getParsedResume(applicationId);
    if (!parsedResume) {
      return res.status(400).json({ error: 'Parsed resume data not found' });
    }

    const evaluation = await interviewService.evaluateAnswer(questionObj, answer, parsedResume);
    
    res.json({
      success: true,
      evaluation
    });
    
  } catch (err) {
    console.error('[Interview Route] Error evaluating answer:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Existing Step 6: Submit Completed AI Interview
 * Migrated from server.js for modularity.
 */
router.post('/submit', (req, res) => {
  const { sessionReport } = req.body;
  if (!sessionReport) {
    return res.status(400).json({ error: "Session report payload required" });
  }

  const newCand = {
    id: `cand-${Date.now()}`,
    jobId: sessionReport.applicationId || "job-101",
    name: sessionReport.candidateName || "Candidate",
    email: sessionReport.email || "candidate@example.com",
    roleApplied: sessionReport.roleTitle || "Senior Full-Stack AI Engineer",
    fakeResumeScore: sessionReport.fakeResumeScore || 12,
    isFakeResume: (sessionReport.fakeResumeScore || 12) > 50,
    aspectScores: sessionReport.aspectScores || { technical: 80, communication: 80, fluency: 80, bodyLanguage: 80, professionalism: 80 },
    shortlisted: (sessionReport.aspectScores?.technical || 0) > 80,
    github: { username: "candidate-dev", reposCount: 10, totalCommits: 300, astComplexityScore: 80, commitPattern: "Active" },
    leetcode: { solvedCount: 150, ranking: "Top 15%", verified: true },
    linkedInVerified: true,
    proctoringLogs: sessionReport.proctorLogs || [],
    interviewTranscript: sessionReport.transcript || [],
    aiObservations: "AI interview submission recorded.",
    improvementAreas: ["Keep practicing system design."],
    status: "Interview Completed"
  };

  // The candidatesStore is in server.js but this is just a mock return anyway
  res.json({ success: true, message: "AI Interview session recorded", candidate: newCand });
});

module.exports = router;
