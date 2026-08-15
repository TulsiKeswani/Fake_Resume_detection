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

export default App;
