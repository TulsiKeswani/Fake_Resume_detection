<<<<<<< HEAD
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import AuthPage from './components/auth/AuthPage';
import CompanyDashboard from './components/dashboard/CompanyDashboard';
import CandidateDashboard from './components/dashboard/CandidateDashboard';
import LandingPage from './components/landing/LandingPage';
import './index.css';

const MainContent = () => {
  const { user, role, loading } = useAuth();
  const [currentView, setCurrentView] = useState('landing');

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Connecting to Intellify Cloud Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main style={{ flex: 1 }}>
        {user ? (
          role === 'company' ? (
            <CompanyDashboard />
          ) : (
            <CandidateDashboard />
          )
        ) : (
          <div>
            {currentView === 'landing' ? (
              <LandingPage onGetStarted={() => setCurrentView('auth')} />
            ) : (
              <div style={{ paddingTop: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <button
                    onClick={() => setCurrentView('landing')}
                    style={{ background: 'transparent', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                  >
                    ← Back to Landing Page & Project Features
                  </button>
                </div>
                <AuthPage onSuccess={() => setCurrentView('dashboard')} />
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '40px' }}>
        Intellify ATS Cloud Engine © 2026 • Industry-Grade Encryption & Zero Local Storage Architecture
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};
=======
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
>>>>>>> 4183de12085eb881482a7a5db359ada69754fc1e

export default App;
