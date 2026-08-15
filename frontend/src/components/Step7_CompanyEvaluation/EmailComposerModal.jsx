import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle2, Sparkles, Users, FileText } from 'lucide-react';
import { EMAIL_TEMPLATES } from '../../mockData';

export default function EmailComposerModal({ selectedCandidates, onClose, onSendAll }) {
  const [templateType, setTemplateType] = useState('shortlist');
  const [subject, setSubject] = useState(EMAIL_TEMPLATES.shortlist.subject);
  const [body, setBody] = useState(EMAIL_TEMPLATES.shortlist.body);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Deduplicate candidates by ID or Email
  const uniqueCandidates = Array.from(
    new Map((selectedCandidates || []).map(c => [c.id || c.email, c])).values()
  );

  const handleTemplateChange = (type) => {
    setTemplateType(type);
    setSubject(EMAIL_TEMPLATES[type].subject);
    setBody(EMAIL_TEMPLATES[type].body);
  };

  const handleSendEmails = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      if (onSendAll) {
        onSendAll(uniqueCandidates, { subject, body });
      }
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '750px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Next Round Confirmation Email Dispatcher</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target Recipients: {uniqueCandidates.length} Shortlisted Candidate(s)
              </p>
            </div>
          </div>
          
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {sentSuccess ? (
          <div style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={32} color="#34d399" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Emails Successfully Dispatched!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Confirmation notifications and next round interview invitations were sent to all {uniqueCandidates.length} selected candidates.
            </p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: '10px' }}>
              Done & Return to Panel
            </button>
          </div>
        ) : (
          <>
            {/* Recipient Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: 'rgba(0, 0, 0, 0.3)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '6px' }}>To:</span>
              {uniqueCandidates.map(c => (
                <span key={c.id || c.email} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={10} /> {c.name} ({c.email})
                </span>
              ))}
            </div>

            {/* Template Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleTemplateChange('shortlist')}
                className={templateType === 'shortlist' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Sparkles size={14} /> Shortlist Invitation Template
              </button>
              <button
                onClick={() => handleTemplateChange('rejection')}
                className={templateType === 'rejection' ? 'btn-danger' : 'btn-secondary'}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <FileText size={14} /> Feedback / Rejection Template
              </button>
            </div>

            {/* Subject Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Body Textarea */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Message Body (Dynamic Placeholders Supported)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  height: '180px',
                  fontFamily: 'var(--font-body)',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* Footer Dispatch Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                System automatically resolves `{'{candidate_name}'}` per recipient
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSendEmails} disabled={sending} className="btn-success">
                  <Send size={16} /> {sending ? "Dispatching..." : `Send to All (${uniqueCandidates.length})`}
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
