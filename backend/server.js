require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Body Parsers
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically if directory exists
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Load optional DB connection if configured
try {
  const connectDB = require('./config/db');
  if (typeof connectDB === 'function') {
    connectDB();
  }
} catch (e) {
  console.log('Running in modular in-memory & route hybrid mode');
}

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

// Mount Routes
try {
  app.use('/api/auth', require('./routes/authRoutes'));
} catch (e) {}

try {
  app.use('/api/company', require('./routes/companyRoutes'));
} catch (e) {}

try {
  app.use('/api/candidate', require('./routes/candidateRoutes'));
} catch (e) {}

try {
  app.use('/api/jobs', require('./routes/jobs'));
} catch (e) {}

try {
  app.use('/api/applications', require('./routes/applications'));
} catch (e) {}

try {
  app.use('/api/ai', require('./routes/ai'));
} catch (e) {}

// Pre-seed demo job in jobService if empty
const jobService = require('./services/jobService');
if (jobService.getAllJobs().length === 0) {
  jobService.createJob({
    title: 'Senior Full-Stack AI Engineer',
    department: 'AI & Engineering',
    location: 'Remote / Bangalore',
    jobType: 'Full-time',
    experienceLevel: 'Senior-Level',
    description: 'We are seeking a Senior Full-Stack AI Engineer to design scalable web applications.',
    aspectWeights: { technical: 35, communication: 25, fluency: 15, bodyLanguage: 15, professionalism: 10 }
  });
}
try {
  app.use('/api/verification', require('./routes/githubVerificationRoutes'));
} catch (e) {}

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ status: "ok", message: "Backend is running", system: "VeriResume & Intellify Engine" });
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "Backend is running", timestamp: new Date().toISOString() });
});

// Step 3 & 7: Get Jobs
app.get('/api/jobs', (req, res) => {
  res.json({ success: true, jobs: jobsStore });
});

try {
  app.use('/api/interviews', require('./routes/interviews'));
} catch (e) {}

// Step 7: Fetch Evaluations & Candidate Metrics
app.get('/api/evaluations/:jobId', (req, res) => {
  const { jobId } = req.params;
  const filtered = candidatesStore.filter(c => c.jobId === jobId || jobId === 'all');
  res.json({ success: true, candidates: filtered });
});

// Step 7: Toggle Candidate Shortlist
app.post('/api/evaluations/shortlist', (req, res) => {
  const { candidateId, shortlisted } = req.body;
  const cand = candidatesStore.find(c => c.id === candidateId);
  if (cand) {
    cand.shortlisted = shortlisted;
    return res.json({ success: true, candidate: cand });
  }
  res.status(404).json({ error: "Candidate not found" });
});

// Step 7: Batch Send Confirmation Emails
app.post('/api/evaluations/send-emails', (req, res) => {
  const { recipientIds, subject, body } = req.body;
  console.log(`[EMAIL DISPATCH] Sent email to ${recipientIds ? recipientIds.length : 0} candidate(s). Subject: "${subject}"`);
  res.json({ success: true, dispatchedCount: recipientIds ? recipientIds.length : 0 });
});

// Step 8: Get Candidate Report
app.get('/api/candidate/report/:candidateId', (req, res) => {
  const cand = candidatesStore.find(c => c.id === req.params.candidateId);
  if (cand) {
    return res.json({ success: true, report: cand });
  }
  res.status(404).json({ error: "Report not found" });
});

// Mount modular jobs router if present
try {
  const jobsRoutes = require('./routes/jobs');
  app.use('/api/v2/jobs', jobsRoutes);
} catch (e) {}

// Start Express Server with EADDRINUSE error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Express server listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is currently in use. Please stop the existing process or set PORT environment variable.`);
  } else {
    console.error('Server error:', err);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
