// Mock Data for AI Resume Detection & Hiring Platform (Steps 6, 7 & 8)

export const INITIAL_JOBS = [
  {
    id: "job-101",
    title: "Senior Full-Stack AI Engineer",
    department: "AI & Engineering",
    location: "Remote / Hybrid",
    publishedDate: "2026-08-01",
    status: "Active",
    candidatesCount: 6,
    weightages: {
      technical: 35,
      communication: 25,
      fluency: 15,
      bodyLanguage: 15,
      professionalism: 10
    },
    customQuestions: [
      { id: "q1", question: "Explain how React 19 server components handle asynchronous data streaming.", type: "technical", mandatory: true },
      { id: "q2", question: "Describe a scenario where your Github commit history showed refactoring of complex AST nodes.", type: "github_ast", mandatory: true },
      { id: "q3", question: "How do you detect and mitigate hallucination in LLM-based API workflows?", type: "ai_depth", mandatory: false }
    ],
    jdSummary: "We are seeking a high-caliber Senior AI Engineer with deep knowledge of React, Node.js, and LLM orchestration. Must demonstrate verifiable codebase contributions and clear technical articulation under pressure."
  },
  {
    id: "job-102",
    title: "Frontend Systems Architect",
    department: "Core UX Tech",
    location: "San Francisco, CA / Remote",
    publishedDate: "2026-08-05",
    status: "Active",
    candidatesCount: 4,
    weightages: {
      technical: 40,
      communication: 20,
      fluency: 15,
      bodyLanguage: 15,
      professionalism: 10
    },
    customQuestions: [
      { id: "q1", question: "Optimize virtualized canvas rendering for 60fps real-time data visualizers.", type: "code", mandatory: true }
    ],
    jdSummary: "Architect mission-critical web applications with high performance animations, micro-frontends, and strict state management."
  }
];

export const INITIAL_CANDIDATES = [
  {
    id: "cand-001",
    jobId: "job-101",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    roleApplied: "Senior Full-Stack AI Engineer",
    appliedDate: "2026-08-10",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    fakeResumeScore: 8, // Low fake likelihood -> authentic resume (8% AI generated)
    isFakeResume: false,
    github: {
      username: "aarav-codes",
      reposCount: 34,
      totalCommits: 1420,
      astComplexityScore: 92, // High organic complexity
      topLanguages: ["TypeScript", "Python", "Rust"],
      commitPattern: "Consistent (Daily commits, 2+ yrs history)"
    },
    leetcode: {
      solvedCount: 410,
      ranking: "Top 4%",
      verified: true
    },
    linkedInVerified: true,
    aspectScores: {
      technical: 92,
      communication: 88,
      fluency: 90,
      bodyLanguage: 85,
      professionalism: 94
    },
    // Weighted score calculated dynamically based on job weightages
    proctoringLogs: [
      { id: 1, time: "02:14", event: "Tab Focus Change Detected", severity: "low" },
      { id: 2, time: "08:45", event: "Audio Peak Normalization", severity: "info" }
    ],
    interviewTranscript: [
      {
        speaker: "AI Interviewer",
        text: "I noticed in your resume that you built a distributed caching layer with Redis and Node.js. How did you resolve cache invalidation during race conditions?"
      },
      {
        speaker: "Candidate",
        text: "We implemented redlock distributed mutex locks alongside pub-sub event channels to synchronize atomic updates across cluster nodes."
      },
      {
        speaker: "AI Interviewer (Cross-Questioning)",
        text: "That sounds robust. What happens if a worker thread dies mid-lock before TTL expires?"
      },
      {
        speaker: "Candidate",
        text: "We set a strict TTL renewal heart-beat mechanism in Lua scripts so locked keys auto-release if heartbeats stop."
      },
      {
        speaker: "AI Interviewer (Trick Question)",
        text: "Interesting! But isn't it true that JavaScript native memory management automatically handles cross-server Redis locks without Lua?"
      },
      {
        speaker: "Candidate (Caught Trick)",
        text: "No, that's inaccurate. JavaScript single-thread memory space cannot manage remote Redis memory states; Lua script execution on Redis engine is mandatory for atomic cluster transactions."
      }
    ],
    codeSubmission: {
      language: "javascript",
      code: `// Fix the bug in distributed lock acquiring routine
async function acquireLock(redisClient, lockKey, ttlMs) {
  const identifier = Math.random().toString(36).substring(2);
  const result = await redisClient.set(lockKey, identifier, 'NX', 'PX', ttlMs);
  if (result === 'OK') {
    return identifier;
  }
  return null;
}`,
      testResult: "Passed 5/5 Test Cases - Optimal Time Complexity O(1)"
    },
    aiObservations: "Candidate demonstrated exceptional domain mastery. Successfully identified AI trick question regarding Redis Lua script synchronization. GitHub AST commit structure displays genuine incremental architecture refactoring.",
    improvementAreas: [
      "Microphone input volume was slightly low during code explanation segment; maintain steady projection.",
      "Consider mentioning fallback queue fallback patterns when Redis cluster experiences quorum loss."
    ],
    shortlisted: true,
    status: "Interview Completed"
  },
  {
    id: "cand-002",
    jobId: "job-101",
    name: "Rohan Varma",
    email: "rohan.v@example.com",
    roleApplied: "Senior Full-Stack AI Engineer",
    appliedDate: "2026-08-11",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    fakeResumeScore: 84, // HIGH FAKE RESUME PROBABILITY (84%)
    isFakeResume: true,
    github: {
      username: "rohan-superdev",
      reposCount: 3,
      totalCommits: 14,
      astComplexityScore: 24, // High copy-paste / template code
      topLanguages: ["HTML", "CSS"],
      commitPattern: "Suspicious (All 14 commits created within 2 hours on same day)"
    },
    leetcode: {
      solvedCount: 12,
      ranking: "Unranked",
      verified: false
    },
    linkedInVerified: false,
    aspectScores: {
      technical: 34,
      communication: 72,
      fluency: 78,
      bodyLanguage: 60,
      professionalism: 68
    },
    proctoringLogs: [
      { id: 1, time: "01:20", event: "Multiple Tab Switches (3 times)", severity: "high" },
      { id: 2, time: "03:45", event: "Clipboard Paste Event in Code Area", severity: "high" },
      { id: 3, time: "06:10", event: "Candidate Face Out of Frame for 12s", severity: "high" }
    ],
    interviewTranscript: [
      {
        speaker: "AI Interviewer",
        text: "Your resume states you built a multi-agent LLM framework serving 100k daily users. Can you explain your vector database indexing setup?"
      },
      {
        speaker: "Candidate",
        text: "Yes, we used vector database with pinecone and embeddings to make it very fast and scalable for all users."
      },
      {
        speaker: "AI Interviewer (Trick Question)",
        text: "Since Pinecone strictly uses SQL join tables for vector cosine similarity, how did you structure your schema foreign keys?"
      },
      {
        speaker: "Candidate (Fell for Trick!)",
        text: "We created foreign key indexes between the vector table and user table using standard SQL constraints."
      }
    ],
    codeSubmission: {
      language: "javascript",
      code: `function acquireLock() {
  // Candidate pasted generic copied snippet
  return true;
}`,
      testResult: "Failed 4/5 Test Cases - Infinite loop bug & syntax missing"
    },
    aiObservations: "CRITICAL ALERT: High probability of Fake Resume (84%). Github activity shows sudden bulk commits of template repositories. Candidate failed AI trick question by agreeing that Pinecone uses SQL foreign keys. Proctoring system logged multiple tab switches and paste events.",
    improvementAreas: [
      "Avoid inflating resume credentials with unverified project scale claims.",
      "Study core database primitives (Vector databases vs Relational SQL databases).",
      "Adhere strictly to anti-cheating policies (refrain from tab switching during assessment)."
    ],
    shortlisted: false,
    status: "Interview Flagged"
  },
  {
    id: "cand-003",
    jobId: "job-101",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    roleApplied: "Senior Full-Stack AI Engineer",
    appliedDate: "2026-08-12",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    fakeResumeScore: 14,
    isFakeResume: false,
    github: {
      username: "priya-dev-io",
      reposCount: 22,
      totalCommits: 890,
      astComplexityScore: 88,
      topLanguages: ["JavaScript", "Python", "Docker"],
      commitPattern: "Consistent (Regular active repo updates)"
    },
    leetcode: {
      solvedCount: 280,
      ranking: "Top 9%",
      verified: true
    },
    linkedInVerified: true,
    aspectScores: {
      technical: 88,
      communication: 91,
      fluency: 92,
      bodyLanguage: 89,
      professionalism: 92
    },
    proctoringLogs: [
      { id: 1, time: "05:00", event: "No suspicious activity detected", severity: "info" }
    ],
    interviewTranscript: [
      {
        speaker: "AI Interviewer",
        text: "Walk me through how you optimize React application render cycles when handling high-frequency WebSocket streams."
      },
      {
        speaker: "Candidate",
        text: "We decoupled WebSocket listener updates from direct React state sets by buffering messages into a ring buffer, triggering batch renders via requestAnimationFrame."
      }
    ],
    codeSubmission: {
      language: "javascript",
      code: `function createRingBuffer(size) {
  let buffer = new Array(size);
  let head = 0, tail = 0;
  return {
    push: (item) => { buffer[head] = item; head = (head + 1) % size; },
    pop: () => { const item = buffer[tail]; tail = (tail + 1) % size; return item; }
  };
}`,
      testResult: "Passed 5/5 Test Cases"
    },
    aiObservations: "Excellent candidate response. Clear grasp of async event loops, custom memory buffers, and browser animation ticks. Resume verified authentic.",
    improvementAreas: [
      "Slightly elaborate on garbage collection impact when reusing fixed size arrays in JavaScript V8."
    ],
    shortlisted: true,
    status: "Interview Completed"
  },
  {
    id: "cand-004",
    jobId: "job-101",
    name: "Vikram Patel",
    email: "vikram.patel@example.com",
    roleApplied: "Senior Full-Stack AI Engineer",
    appliedDate: "2026-08-13",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    fakeResumeScore: 78, // High fake resume likelihood
    isFakeResume: true,
    github: {
      username: "vikram-pro",
      reposCount: 2,
      totalCommits: 8,
      astComplexityScore: 30,
      topLanguages: ["Python"],
      commitPattern: "Irregular (Single commit fork)"
    },
    leetcode: {
      solvedCount: 0,
      ranking: "Unranked",
      verified: false
    },
    linkedInVerified: false,
    aspectScores: {
      technical: 42,
      communication: 65,
      fluency: 70,
      bodyLanguage: 55,
      professionalism: 60
    },
    proctoringLogs: [
      { id: 1, time: "02:10", event: "Focus Loss - Tab Switch (2 times)", severity: "high" }
    ],
    interviewTranscript: [
      {
        speaker: "AI Interviewer",
        text: "How do you structure microservices communication between Node.js and Python fastAPI services?"
      },
      {
        speaker: "Candidate",
        text: "We just call API endpoints using standard HTTP."
      }
    ],
    codeSubmission: {
      language: "python",
      code: `def solve(): pass`,
      testResult: "Failed 5/5 Test Cases - Incomplete code"
    },
    aiObservations: "High resume anomaly flag. Candidate resume lists 6+ years of Kubernetes microservices, but answer lacks depth and Github shows single commit fork of template starter.",
    improvementAreas: [
      "Develop practical hands-on experience with gRPC, RabbitMQ, or NATS event streaming.",
      "Complete code submission tasks thoroughly."
    ],
    shortlisted: false,
    status: "Interview Flagged"
  }
];

export const FAKE_VS_REAL_HEATMAP_DATA = [
  { candidateName: "Aarav Sharma", aiTextDensity: 8, commitConsistency: 95, astComplexity: 92, claimVerification: 96, realityGap: 5, isFake: false },
  { candidateName: "Rohan Varma", aiTextDensity: 88, commitConsistency: 12, astComplexity: 24, claimVerification: 30, realityGap: 82, isFake: true },
  { candidateName: "Priya Nair", aiTextDensity: 12, commitConsistency: 90, astComplexity: 88, claimVerification: 94, realityGap: 8, isFake: false },
  { candidateName: "Vikram Patel", aiTextDensity: 79, commitConsistency: 15, astComplexity: 30, claimVerification: 35, realityGap: 75, isFake: true },
  { candidateName: "Ananya Gupta", aiTextDensity: 15, commitConsistency: 85, astComplexity: 86, claimVerification: 91, realityGap: 10, isFake: false },
  { candidateName: "Kabir Mehta", aiTextDensity: 82, commitConsistency: 20, astComplexity: 28, claimVerification: 32, realityGap: 78, isFake: true },
];

export const EMAIL_TEMPLATES = {
  shortlist: {
    subject: "Congratulations! Invitation for Final Leadership Interview - {job_title}",
    body: `Dear {candidate_name},

Thank you for undergoing the AI Interview & Assessment for the position of {job_title} at our organization.

We were highly impressed by your evaluation performance (Weighted Score: {score}/100). Your technical depth, problem-solving under cross-questioning, and code execution demonstrated exemplary mastery.

We would like to invite you to the next final leadership round. Please find the details below:

- Role: {job_title}
- Round: Leadership & System Architecture Discussion
- Mode: Video Call (Link will be sent shortly)

Please confirm your availability by replying to this email.

Best regards,
Hiring & Talent Acquisition Team`
  },
  rejection: {
    subject: "Update regarding your application for {job_title}",
    body: `Dear {candidate_name},

Thank you for giving us the opportunity to consider your profile for {job_title}.

After reviewing your interview evaluation report, we regret to inform you that we will not be moving forward with your application at this time. 

You can view your detailed aspect scores and improvement areas on your Candidate Dashboard. We encourage you to work on these feedback points and apply for future openings.

We wish you the very best in your career pursuits.

Best regards,
Talent Acquisition Team`
  }
};
