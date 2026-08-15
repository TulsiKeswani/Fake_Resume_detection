import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, Building2, UserCheck, Sparkles, Layers } from 'lucide-react';

const Navbar = ({ currentView, setCurrentView }) => {
  const { user, role, logout } = useAuth();

  return (
    <header style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(12px)', sticky: 'top', zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setCurrentView(user ? 'dashboard' : 'landing')}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
            <ShieldCheck size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">
              Intellify <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', verticalAlign: 'middle', fontWeight: 600 }}>ATS Cloud</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI-Powered Verification & Interviewing Platform</p>
          </div>
        </div>

        {/* User Navigation / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!user && (
            <button
              onClick={() => setCurrentView('landing')}
              style={{
                background: currentView === 'landing' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: currentView === 'landing' ? '1px solid #6366f1' : '1px solid transparent',
                color: currentView === 'landing' ? '#fff' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers size={16} color="#818cf8" /> Platform Features
            </button>
          )}

          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 14px', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
                {role === 'company' ? (
                  <Building2 size={16} color="#818cf8" />
                ) : (
                  <UserCheck size={16} color="#34d399" />
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {role === 'company' ? user.companyName : user.fullName}
                </span>
                <span className={role === 'company' ? 'badge badge-primary' : 'badge badge-success'}>
                  {role}
                </span>
              </div>

              <button
                className="btn-secondary"
                onClick={logout}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-primary"
                onClick={() => setCurrentView('auth')}
                style={{ fontSize: '0.9rem' }}
              >
                <Sparkles size={16} /> Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
