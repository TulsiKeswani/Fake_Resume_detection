const express = require('express');
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// In-Memory Database Store for MVP
let jobsStore = [
  {
    id: "job-101",
    title: "Senior Full-Stack AI Engineer",
    department: "AI & Engineering",
    weightages: { technical: 35, communication: 25, fluency: 15, bodyLanguage: 15, professionalism: 10 },
    candidatesCount: 4
  }
];

let candidatesStore = [
  {
    id: "cand-001",
    jobId: "job-101",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    roleApplied: "Senior Full-Stack AI Engineer",
    fakeResumeScore: 8,
    isFakeResume: false,
    aspectScores: { technical: 92, communication: 88, fluency: 90, bodyLanguage: 85, professionalism: 94 },
    shortlisted: true,
    github: { username: "aarav-codes", reposCount: 34, totalCommits: 1420, astComplexityScore: 92, commitPattern: "Consistent" },
    leetcode: { solvedCount: 410, ranking: "Top 4%", verified: true },
    linkedInVerified: true,
    proctoringLogs: [],
    interviewTranscript: [],
    aiObservations: "Authentic candidate resume.",
    improvementAreas: ["Maintain constant speech clarity."],
    status: "Interview Completed"
  },
  {
    id: "cand-002",
    jobId: "job-101",
    name: "Rohan Varma",
    email: "rohan.v@example.com",
    roleApplied: "Senior Full-Stack AI Engineer",
    fakeResumeScore: 84,
    isFakeResume: true,
    aspectScores: { technical: 34, communication: 72, fluency: 78, bodyLanguage: 60, professionalism: 68 },
    shortlisted: false,
    github: { username: "rohan-superdev", reposCount: 3, totalCommits: 14, astComplexityScore: 24, commitPattern: "Suspicious" },
    leetcode: { solvedCount: 12, ranking: "Unranked", verified: false },
    linkedInVerified: false,
    proctoringLogs: [],
    interviewTranscript: [],
    aiObservations: "High probability of fake resume.",
    improvementAreas: ["Avoid inflating credentials."],
    status: "Interview Flagged"
  }
];

// Requirement 3: GET / Health endpoint
app.get('/', (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "Backend is running", timestamp: new Date() });
});

// Requirement 4: Endpoint 1 - GET /api/jobs
app.get('/api/jobs', (req, res) => {
  res.json({ success: true, jobs: jobsStore });
});

// Requirement 4: Endpoint 2 - POST /api/interviews/submit
app.post('/api/interviews/submit', (req, res) => {
  const { sessionReport } = req.body;
  if (!sessionReport) {
    return res.status(400).json({ error: "Session report payload required" });
  }

  const newCand = {
    id: `cand-${Date.now()}`,
    jobId: "job-101",
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

  candidatesStore.unshift(newCand);
  res.json({ success: true, message: "AI Interview session recorded", candidate: newCand });
});

// Requirement 4: Endpoint 3 - GET /api/evaluations/:jobId
app.get('/api/evaluations/:jobId', (req, res) => {
  const { jobId } = req.params;
  const filtered = candidatesStore.filter(c => c.jobId === jobId || jobId === 'all');
  res.json({ success: true, candidates: filtered });
});

// Requirement 4: Endpoint 4 - POST /api/evaluations/shortlist
app.post('/api/evaluations/shortlist', (req, res) => {
  const { candidateId, shortlisted } = req.body;
  const cand = candidatesStore.find(c => c.id === candidateId);
  if (cand) {
    cand.shortlisted = shortlisted;
    return res.json({ success: true, candidate: cand });
  }
  res.status(404).json({ error: "Candidate not found" });
});

// Requirement 4: Endpoint 5 - POST /api/evaluations/send-emails
app.post('/api/evaluations/send-emails', (req, res) => {
  const { recipientIds, subject, body } = req.body;
  console.log(`[EMAIL DISPATCH] Sent email to ${recipientIds ? recipientIds.length : 0} candidate(s). Subject: "${subject}"`);
  res.json({ success: true, dispatchedCount: recipientIds ? recipientIds.length : 0 });
});

// Requirement 4: Endpoint 6 - GET /api/candidate/report/:candidateId
app.get('/api/candidate/report/:candidateId', (req, res) => {
  const cand = candidatesStore.find(c => c.id === req.params.candidateId);
  if (cand) {
    return res.json({ success: true, report: cand });
  }
  res.status(404).json({ error: "Report not found" });
});

// Start Express Server with EADDRINUSE error handling
const server = app.listen(PORT, () => {
  console.log(`Backend Express server listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is currently in use. Please stop the existing process or set PORT environment variable.`);
  } else {
    console.error('Server error:', err);
  }
});

// Prevent process exit on unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Intellify Backend', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Intellify Backend Server running on http://localhost:${PORT}`);
});
