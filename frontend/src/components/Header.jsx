import React from 'react';
import { ShieldAlert, Cpu, BarChart3, Award, FilePlus, UserCheck, Search, Users, User, Sparkles } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, activeRole, setActiveRole }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
        }}>
          <ShieldAlert size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }} className="gradient-text">
            Unmask ATS
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="#06b6d4" /> Next-Gen AI Verification & Hiring Assessment Suite
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs: Step 1 → Step 8 */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <button
          className={activeTab === 'step1' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('step1')}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <User size={14} />
          Step 1: Auth
        </button>

        <button
          className={activeTab === 'step2' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('step2')}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Users size={14} />
          Step 2: Dashboard
        </button>

        <button
          className={activeTab === 'step3' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => {
            setActiveTab('step3');
            setActiveRole('company');
          }}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <FilePlus size={14} />
          Step 3: Job Creation
        </button>

        <button
          className={activeTab === 'step4' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => {
            setActiveTab('step4');
            setActiveRole('candidate');
          }}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <UserCheck size={14} />
          Step 4: Apply Job
        </button>

        <button
          className={activeTab === 'step5' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => {
            setActiveTab('step5');
            setActiveRole('company');
          }}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Search size={14} />
          Step 5: AI Verification
        </button>

        <button
          className={activeTab === 'step6' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => {
            setActiveTab('step6');
            setActiveRole('candidate');
          }}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Cpu size={14} />
          Step 6: AI Interview
        </button>

        <button
          className={activeTab === 'step7' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => {
            setActiveTab('step7');
            setActiveRole('company');
          }}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <BarChart3 size={14} />
          Step 7: Evaluation Panel
        </button>

        <button
          className={activeTab === 'step8' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => {
            setActiveTab('step8');
            setActiveRole('candidate');
          }}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Award size={14} />
          Step 8: Candidate Report
        </button>
      </nav>

      {/* Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '10px', padding: '3px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => {
              setActiveRole('company');
              if (activeTab === 'step8' || activeTab === 'step4' || activeTab === 'step6') {
                setActiveTab('step7');
              }
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeRole === 'company' ? 'linear-gradient(135deg, #6366f1, #4338ca)' : 'transparent',
              color: activeRole === 'company' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={14} /> Company View
          </button>
          <button
            onClick={() => {
              setActiveRole('candidate');
              if (activeTab === 'step3' || activeTab === 'step5' || activeTab === 'step7') {
                setActiveTab('step8');
              }
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeRole === 'candidate' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'transparent',
              color: activeRole === 'candidate' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={14} /> Candidate View
          </button>
        </div>

        <div style={{
          padding: '6px 12px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: '#34d399'
        }}>
          <div className="pulse-dot pulse-dot-green"></div>
          Proctoring Active
        </div>
      </div>
    </header>
  );
}
