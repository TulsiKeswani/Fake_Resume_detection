import React, { useState } from 'react';
import Header from './components/Header';
import AiInterview from './components/Step6_AiInterview/AiInterview';
import CompanyEvaluationPanel from './components/Step7_CompanyEvaluation/CompanyEvaluationPanel';
import CandidateReportPortal from './components/Step8_CandidateReport/CandidateReportPortal';
import { INITIAL_JOBS, INITIAL_CANDIDATES } from './mockData';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('step6'); // 'step6' | 'step7' | 'step8'
  const [activeRole, setActiveRole] = useState('company'); // 'company' | 'candidate'
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);

  // Callback when candidate completes Step 6 interview
  const handleCompleteInterview = (sessionReport) => {
    const newCand = {
      id: `cand-${Date.now().toString().slice(-4)}`,
      jobId: 'job-101',
      name: sessionReport.candidateName || 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      roleApplied: sessionReport.roleTitle || 'Senior Full-Stack AI Engineer',
      appliedDate: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      fakeResumeScore: sessionReport.fakeResumeScore || 12,
      isFakeResume: (sessionReport.fakeResumeScore || 12) > 50,
      github: {
        username: "aarav-codes",
        reposCount: 34,
        totalCommits: 1420,
        astComplexityScore: sessionReport.aspectScores.technical || 92,
        topLanguages: ["TypeScript", "Python"],
        commitPattern: "Consistent (Daily active commits)"
      },
      leetcode: {
        solvedCount: 410,
        ranking: "Top 4%",
        verified: true
      },
      linkedInVerified: true,
      aspectScores: sessionReport.aspectScores,
      proctoringLogs: sessionReport.proctorLogs,
      interviewTranscript: sessionReport.transcript,
      aiObservations: `Interactive Interview completed. Technical score ${sessionReport.aspectScores.technical}%. Proctoring logged ${sessionReport.tabSwitches} focus loss event(s).`,
      improvementAreas: [
        "Maintain constant speech clarity during live code debug explanations.",
        "Refine atomic distributed mutex lock fallback handling."
      ],
      shortlisted: sessionReport.aspectScores.technical > 80,
      status: "Interview Completed"
    };

    setCandidates(prev => [newCand, ...prev]);
    setActiveTab('step7'); // Seamlessly navigate to Company Evaluation Panel!
  };

  const handleUpdateCandidate = (updatedCand) => {
    setCandidates(prev => prev.map(c => c.id === updatedCand.id ? updatedCand : c));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
      />

      {/* Main Body View Container */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activeTab === 'step6' && (
          <AiInterview onCompleteInterview={handleCompleteInterview} />
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
        VeriResume AI • Steps 6, 7 & 8 Completed Module • Google DeepMind Agentic Suite
      </footer>
    </div>
  );
}

export default App;
