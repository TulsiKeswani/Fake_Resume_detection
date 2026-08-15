import { useState } from 'react';
import { Layers, UserCheck, Cpu, Sparkles, Building, CheckCircle2 } from 'lucide-react';
import JobCreationWizard from './components/Step3_JobCreation/JobCreationWizard';
import PublicJobApply from './components/Step4_CandidateApply/PublicJobApply';
import AIVerificationDashboard from './components/Step5_AIVerification/AIVerificationDashboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('step3'); // 'step3' | 'step4' | 'step5'
  const [currentShareId, setCurrentShareId] = useState('job_demo');
  const [currentAppId, setCurrentAppId] = useState('app_demo123');

  const handleNavigateToApply = (shareId) => {
    if (shareId) setCurrentShareId(shareId);
    setActiveTab('step4');
  };

  const handleNavigateToReport = (appId) => {
    if (appId) setCurrentAppId(appId);
    setActiveTab('step5');
  };

  return (
    <div className="app-layout">
      {/* Top Application Navigation */}
      <header className="app-header glass-panel">
        <div className="logo-brand">
          <Sparkles className="icon-gold" size={28} />
          <div>
            <h2>Intellify</h2>
            <span className="badge badge-gold">Steps 3, 4 & 5 Suite</span>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'step3' ? 'active' : ''}`}
            onClick={() => setActiveTab('step3')}
          >
            <Layers size={18} /> Step 3: Job Creation Wizard
          </button>

          <button
            className={`nav-tab ${activeTab === 'step4' ? 'active' : ''}`}
            onClick={() => setActiveTab('step4')}
          >
            <UserCheck size={18} /> Step 4: Candidate Job Apply
          </button>

          <button
            className={`nav-tab ${activeTab === 'step5' ? 'active' : ''}`}
            onClick={() => setActiveTab('step5')}
          >
            <Cpu size={18} /> Step 5: AI Verification Work
          </button>
        </nav>
      </header>

      {/* Main Content Body */}
      <main className="main-content">
        {activeTab === 'step3' && (
          <JobCreationWizard
            onJobCreated={(job) => setCurrentShareId(job.shareId)}
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
            onBackToApply={() => setActiveTab('step4')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
