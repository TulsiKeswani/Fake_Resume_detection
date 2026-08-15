import React, { useState } from 'react';
import { Layers, UserCheck, Cpu, Sparkles } from 'lucide-react';

import Header from './components/Header';

import JobCreationWizard from './components/Step3_JobCreation/JobCreationWizard';
import PublicJobApply from './components/Step4_CandidateApply/PublicJobApply';
import AIVerificationDashboard from './components/Step5_AIVerification/AIVerificationDashboard';

import AiInterview from './components/Step6_AiInterview/AiInterview';
import CompanyEvaluationPanel from './components/Step7_CompanyEvaluation/CompanyEvaluationPanel';
import CandidateReportPortal from './components/Step8_CandidateReport/CandidateReportPortal';

import { INITIAL_JOBS, INITIAL_CANDIDATES } from './mockData';

import './App.css';

function App() {
  // Current active step
  const [activeTab, setActiveTab] = useState('step3');

  // Company / Candidate persona
  const [activeRole, setActiveRole] = useState('company');

  // Step 3 → Step 4
  const [currentShareId, setCurrentShareId] = useState('job_demo');

  // Step 4 → Step 5
  const [currentAppId, setCurrentAppId] = useState('app_demo123');

  // Step 7 / Step 8 data
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);

  // --------------------------------------------------
  // STEP 3 → STEP 4
  // --------------------------------------------------

  const handleNavigateToApply = (shareId) => {
    if (shareId) {
      setCurrentShareId(shareId);
    }

    setActiveTab('step4');
  };

  // --------------------------------------------------
  // STEP 4 → STEP 5
  // --------------------------------------------------

  const handleNavigateToReport = (appId) => {
    if (appId) {
      setCurrentAppId(appId);
    }

    setActiveTab('step5');
  };

  // --------------------------------------------------
  // STEP 3 JOB CREATED
  // --------------------------------------------------

  const handleJobCreated = (job) => {
    if (job) {
      setJobs((prev) => [job, ...prev]);

      if (job.shareId) {
        setCurrentShareId(job.shareId);
      }
    }
  };

  // --------------------------------------------------
  // STEP 6 → STEP 7
  // --------------------------------------------------

  const handleCompleteInterview = (sessionReport) => {
    const aspectScores = sessionReport?.aspectScores || {
      technical: 0,
      communication: 0,
      fluency: 0,
      bodyLanguage: 0,
      professionalism: 0
    };

    const fakeResumeScore = sessionReport?.fakeResumeScore || 12;

    const newCandidate = {
      id: `cand-${Date.now().toString().slice(-6)}`,

      jobId: 'job-101',

      name: sessionReport?.candidateName || 'Aarav Sharma',

      email: 'aarav.sharma@example.com',

      roleApplied:
        sessionReport?.roleTitle ||
        'Senior Full-Stack AI Engineer',

      appliedDate: new Date().toISOString().split('T')[0],

      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',

      fakeResumeScore,

      isFakeResume: fakeResumeScore > 50,

      github: {
        username: 'aarav-codes',
        reposCount: 34,
        totalCommits: 1420,
        astComplexityScore: aspectScores.technical || 92,
        topLanguages: ['TypeScript', 'Python'],
        commitPattern: 'Consistent (Daily active commits)'
      },

      leetcode: {
        solvedCount: 410,
        ranking: 'Top 4%',
        verified: true
      },

      linkedInVerified: true,

      aspectScores,

      proctoringLogs: sessionReport?.proctorLogs || [],

      interviewTranscript: sessionReport?.transcript || '',

      aiObservations:
        `Interactive Interview completed. Technical score ` +
        `${aspectScores.technical}%. Proctoring logged ` +
        `${sessionReport?.tabSwitches || 0} focus loss event(s).`,

      improvementAreas: [
        'Maintain constant speech clarity during live code debug explanations.',
        'Refine atomic distributed mutex lock fallback handling.'
      ],

      shortlisted: aspectScores.technical > 80,

      status: 'Interview Completed'
    };

    setCandidates((prev) => [newCandidate, ...prev]);

    // Go to company evaluation
    setActiveRole('company');
    setActiveTab('step7');
  };

  // --------------------------------------------------
  // STEP 7 CANDIDATE UPDATE
  // --------------------------------------------------

  const handleUpdateCandidate = (updatedCandidate) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === updatedCandidate.id
          ? updatedCandidate
          : candidate
      )
    );
  };

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* ==========================================
          STEP 3-8 UNIVERSAL HEADER
      ========================================== */}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
      />

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main
        style={{
          flex: 1,
          paddingBottom: '40px'
        }}
      >

        {/* ========================================
            STEP 3 — JOB CREATION
        ======================================== */}

        {activeTab === 'step3' && (
          <JobCreationWizard
            onJobCreated={handleJobCreated}
            onNavigateToApply={handleNavigateToApply}
          />
        )}

        {/* ========================================
            STEP 4 — CANDIDATE APPLY
        ======================================== */}

        {activeTab === 'step4' && (
          <PublicJobApply
            shareId={currentShareId}
            onNavigateToReport={handleNavigateToReport}
          />
        )}

        {/* ========================================
            STEP 5 — AI VERIFICATION
        ======================================== */}

        {activeTab === 'step5' && (
          <AIVerificationDashboard
            applicationId={currentAppId}
            onBackToApply={() => setActiveTab('step4')}
          />
        )}

        {/* ========================================
            STEP 6 — AI INTERVIEW
        ======================================== */}

        {activeTab === 'step6' && (
          <AiInterview
            onCompleteInterview={handleCompleteInterview}
          />
        )}

        {/* ========================================
            STEP 7 — COMPANY EVALUATION
        ======================================== */}

        {activeTab === 'step7' && (
          <CompanyEvaluationPanel
            jobs={jobs}
            candidates={candidates}
            onUpdateCandidate={handleUpdateCandidate}
          />
        )}

        {/* ========================================
            STEP 8 — CANDIDATE REPORT
        ======================================== */}

        {activeTab === 'step8' && (
          <CandidateReportPortal
            candidates={candidates}
          />
        )}

      </main>

      {/* ==========================================
          FOOTER
      ========================================== */}

      <footer
        style={{
          textAlign: 'center',
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          background: 'rgba(9, 13, 22, 0.9)'
        }}
      >
        VeriResume AI • AI Recruitment & Verification Platform
      </footer>
    </div>
  );
}

export default App;