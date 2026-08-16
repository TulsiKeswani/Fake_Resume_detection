import React, { useState } from 'react';
import Header from './components/Header';

import AuthPage from './components/auth/AuthPage';
import CompanyDashboard from './components/dashboard/CompanyDashboard';
import CandidateDashboard from './components/dashboard/CandidateDashboard';

import JobCreationWizard from './components/Step3_JobCreation/JobCreationWizard';
import PublicJobApply from './components/Step4_CandidateApply/PublicJobApply';
import AIVerificationDashboard from './components/Step5_AIVerification/AIVerificationDashboard';

import AiInterview from './components/Step6_AiInterview/AiInterview';
import CompanyEvaluationPanel from './components/Step7_CompanyEvaluation/CompanyEvaluationPanel';
import CandidateReportPortal from './components/Step8_CandidateReport/CandidateReportPortal';

import { AuthProvider, useAuth } from './context/AuthContext';
import { INITIAL_JOBS, INITIAL_CANDIDATES } from './mockData';

import './App.css';

function MainContent() {
  const { user, role } = useAuth();

  // Current active step navigation (step1 | step2 | step3 | step4 | step5 | step6 | step7 | step8)
  const [activeTab, setActiveTab] = useState('step3');

  // Active persona (company | candidate)
  const [activeRole, setActiveRole] = useState('company');

  // State bridges across steps
  const [currentShareId, setCurrentShareId] = useState(null);
  const [currentAppId, setCurrentAppId] = useState(null);
  const [activeApplication, setActiveApplication] = useState(null);

  // Step 4 → Step 5 state bridge
  const [currentAppId, setCurrentAppId] = useState('app_demo123');

  // Step 7 & Step 8 candidate datasets
  const [jobs, setJobs] = useState(INITIAL_JOBS || []);
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES || []);

  // Step 3 -> Step 4 navigation callback
  const handleNavigateToApply = (shareId) => {
    if (shareId) {
      setCurrentShareId(shareId);
    }
    setActiveRole('candidate');
    setActiveTab('step4');
  };

  // Step 4 -> Step 5 navigation callback
  const handleNavigateToReport = (appId, appDetails = null) => {
    if (appId) {
      setCurrentAppId(appId);
    }
    if (appDetails) {
      setActiveApplication(appDetails);
    }
    setActiveRole('candidate');
    setActiveTab('step5');
  };

  // Step 3 job creation callback
  const handleJobCreated = (job) => {
    if (job) {
      setJobs((prev) => [job, ...prev]);
      if (job.shareId) {
        setCurrentShareId(job.shareId);
      }
    }
  };

  // Step 6 interview completion callback
  const handleCompleteInterview = (sessionReport) => {
    const aspectScores = sessionReport?.aspectScores || {
      technical: 85,
      communication: 80,
      fluency: 80,
      bodyLanguage: 75,
      professionalism: 90
    };

    const fakeResumeScore = sessionReport?.fakeResumeScore || 12;
    const isTerminated = sessionReport?.cheatingDetected || sessionReport?.terminated;

    const candidateJobId = activeApplication?.jobId || jobs[0]?.id || 'job-101';
    const candidateName = sessionReport?.candidateName || activeApplication?.candidateName || user?.fullName || 'Aarav Sharma';
    const candidateEmail = activeApplication?.candidateEmail || user?.email || 'aarav.sharma@example.com';
    const roleTitle = sessionReport?.roleTitle || jobs.find(j => j.id === candidateJobId)?.title || 'Senior Full-Stack AI Engineer';

    const newCandidate = {
      id: activeApplication?.id ? `cand-${activeApplication.id}` : `cand-${Date.now().toString().slice(-6)}`,
      applicationId: activeApplication?.id || currentAppId || null,
      jobId: candidateJobId,
      name: candidateName,
      email: candidateEmail,
      roleApplied: roleTitle,
      appliedDate: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      fakeResumeScore,
      isFakeResume: fakeResumeScore > 50,
      github: {
        username: activeApplication?.githubUrl ? activeApplication.githubUrl.split('/').pop() : 'aarav-codes',
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
      proctoringLogs: sessionReport?.proctoringLogs || sessionReport?.proctorLogs || [],
      cameraEvents: sessionReport?.cameraEvents || [],
      sessionStats: sessionReport?.sessionStats || null,
      tabSwitches: sessionReport?.tabSwitches || 0,
      focusLossEvents: sessionReport?.focusLossEvents || 0,
      suspiciousMovementEvents: sessionReport?.suspiciousMovementEvents || 0,
      gazeLossEvents: sessionReport?.gazeLossEvents || 0,
      faceMissingEvents: sessionReport?.faceMissingEvents || 0,
      cheatingDetected: sessionReport?.cheatingDetected || false,
      terminated: sessionReport?.terminated || false,
      terminationReason: sessionReport?.terminationReason || '',
      maxPersonCount: sessionReport?.maxPersonCount || 1,
      bodyLanguageReport: sessionReport?.bodyLanguageReport || null,
      interviewTranscript: sessionReport?.transcript || [],
      aiObservations: isTerminated
        ? `TERMINATED FOR CHEATING: ${sessionReport?.terminationReason || 'Multiple persons detected'}`
        : `Interactive AI Interview completed. Technical depth score ${aspectScores.technical}%. Proctoring logged ${sessionReport?.tabSwitches || 0} focus loss event(s).`,
      improvementAreas: [
        'Maintain constant speech clarity during live code debug explanations.',
        'Refine atomic distributed mutex lock fallback handling.'
      ],
      shortlisted: !isTerminated && aspectScores.technical > 80,
      status: isTerminated ? 'Terminated for Cheating' : 'Interview Completed'
    };

    setCandidates((prev) => [newCandidate, ...prev]);
    setActiveRole('company');
    setActiveTab('step7');
  };

  // Step 7 candidate update handler
  const handleUpdateCandidate = (updatedCandidate) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === updatedCandidate.id ? updatedCandidate : candidate
      )
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Header (Steps 1 - 8) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
      />

      {/* Main View Container */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activeTab === 'step1' && (
          <AuthPage
            onSuccess={() => {
              if (role === 'company' || activeRole === 'company') {
                setActiveTab('step2');
              } else {
                setActiveTab('step2');
              }
            }}
          />
        )}

        {activeTab === 'step2' && (
          activeRole === 'company' ? (
            <CompanyDashboard
              jobs={jobs}
              onNavigateToCreateJob={() => {
                setActiveRole('company');
                setActiveTab('step3');
              }}
              onNavigateToEvaluation={() => {
                setActiveRole('company');
                setActiveTab('step7');
              }}
            />
          ) : (
            <CandidateDashboard
              jobs={jobs}
              candidates={candidates}
              onNavigateToApply={(shareId) => handleNavigateToApply(shareId)}
              onNavigateToInterview={() => {
                setActiveRole('candidate');
                setActiveTab('step6');
              }}
              onNavigateToReport={() => {
                setActiveRole('candidate');
                setActiveTab('step8');
              }}
            />
          )
        )}

        {activeTab === 'step3' && (
          <JobCreationWizard
            onJobCreated={handleJobCreated}
            onNavigateToApply={handleNavigateToApply}
          />
        )}

        {activeTab === 'step4' && (
          <PublicJobApply
            shareId={currentShareId}
            onNavigateToReport={handleNavigateToReport}
          />
        )}

        {activeTab === 'step5' && (
          <AIVerificationDashboard
            applicationId={currentAppId}
            onBackToApply={() => {
              setActiveRole('candidate');
              setActiveTab('step4');
            }}
            onProceedToInterview={() => {
              setActiveRole('candidate');
              setActiveTab('step6');
            }}
          />
        )}

        {activeTab === 'step6' && (
          <AiInterview
            applicationId={currentAppId}
            onCompleteInterview={handleCompleteInterview}
            initialCandidateName={activeApplication?.candidateName}
            initialRoleTitle={jobs.find(j => j.id === activeApplication?.jobId)?.title || jobs[0]?.title}
            applicationId={currentAppId}
            jobId={activeApplication?.jobId}
          />
        )}

        {activeTab === 'step7' && (
          <CompanyEvaluationPanel
            jobs={jobs}
            candidates={candidates}
            onUpdateCandidate={handleUpdateCandidate}
          />
        )}

        {activeTab === 'step8' && (
          <CandidateReportPortal
            candidates={candidates}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        background: 'rgba(9, 13, 22, 0.9)'
      }}>
        Unmask ATS • End-to-End AI Recruitment, Verification & Interview Platform (Steps 3 - 8)
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;