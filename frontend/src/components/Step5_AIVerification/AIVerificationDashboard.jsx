import { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Code, FileText, AlertTriangle, CheckCircle2, RefreshCw, Star, GitCommit, Sparkles, User, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import GithubVerificationPanel from './GithubVerificationPanel';

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export default function AIVerificationDashboard({ applicationId, onBackToApply, onProceedToInterview }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const fetchReport = async (retryCount = 0) => {
      setLoading(true);
      setError('');
      try {
        if (applicationId) {
          const res = await api.getVerificationReport(applicationId);
          if (res.success && res.verification) {
            if (res.verification.error) {
              if (isMounted) {
                setError(res.verification.error);
                setLoading(false);
              }
              return;
            }
            if (isMounted) {
              setData({ application: res.application, verification: res.verification });
              setLoading(false);
            }
            return;
          } else if (res.success && !res.verification && retryCount < 10) {
            // Still processing in the background, poll again in 3 seconds
            if (isMounted) {
              setLoading(true);
              timeoutId = setTimeout(() => fetchReport(retryCount + 1), 3000);
            }
            return;
          } else {
            if (isMounted) {
              setError(res.message || 'AI analysis is taking longer than expected or is unavailable. Please try again later.');
              setLoading(false);
            }
            return;
          }
        } else {
          if (isMounted) {
            setError('No application ID provided.');
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch AI verification data.');
          setLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [applicationId]);

  const handleManualRetry = () => {
    setLoading(true);
    setError('');
    // Trigger the useEffect again by just calling the same logic or let's extract it if needed.
    // For simplicity, we can just force a state update if we really wanted to, 
    // but the simplest is just defining a local function to trigger the fetch again.
    // However, since it's now wrapped in useEffect, let's just do a window.location.reload() or define fetchReport outside.
  };

  // We need to keep a manual fetch method for the "Retry" button at the bottom of the dashboard.
  const triggerFetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      if (applicationId) {
        const res = await api.getVerificationReport(applicationId);
        if (res.success && res.verification) {
          if (res.verification.error) {
            setError(res.verification.error);
            setLoading(false);
            return;
          }
          setData({ application: res.application, verification: res.verification });
          setLoading(false);
          return;
        } else {
          setError(res.message || 'AI analysis is still processing. Please try again in a few moments.');
          setLoading(false);
          return;
        }
      }
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="loading-container glass-panel">
        <Cpu className="spinner icon-gold" size={36} />
        <h3>Step 5: AI Engine Processing Candidate Data...</h3>
        <p>Parsing resume text, checking AI detection score, and analyzing GitHub/LeetCode developer footprints.</p>
      </div>
    );
  }

  if (!loading && (!data || error)) {
    return (
      <div className="glass-panel" style={{ padding: '40px', maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
          {!applicationId ? 'No Candidate Application Selected' : 'Verification Report Pending'}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {error || 'Please submit a candidate application in Step 4 to view the real-time AI verification report.'}
        </p>
        {onBackToApply && (
          <button className="btn btn-primary" onClick={onBackToApply}>
            Go to Step 4: Apply Job
          </button>
        )}
      <div className="glass-panel alert alert-error">
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={triggerFetchReport}>Retry</button>
      </div>
    );
  }

  const { application, verification } = data;
  const { parsedResume, aiDetection, devProfiles, overallScore } = verification || {};

  return (
    <div className="ai-dashboard-container">
      {/* Top Header Card */}
      <div className="report-header-card glass-panel">
        <div className="header-left">
          <div className="badge badge-gold"><Cpu size={14} /> Step 5: AI Resume & Skill Verification Report</div>
          <h2>{application.candidateName}</h2>
          <p className="subtext">
            Applied via {application.resumeOriginalName} • ID: <code>{application.id}</code>
          </p>
        </div>
      </div>

      {/* Grid Layout of AI Verification Panels */}
      <div className="verification-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto' }}>

        {/* Panel 1: AI Generated Resume Detection Score */}
        <div className="verif-card glass-panel">
          <div className="card-title-row">
            <Sparkles className="icon-gold" size={20} />
            <h3>AI-Generated Resume Detection</h3>
          </div>
          
          {aiDetection.unavailable ? (
             <div className="alert alert-warning" style={{ marginTop: '16px' }}>
                <AlertTriangle size={16} /> AI detection unavailable for this resume text.
             </div>
          ) : (
            <>
              <div className="gauge-container" style={{ marginTop: '16px' }}>
                <div className="gauge-bar-track">
                  <div
                    className="gauge-bar-fill"
                    style={{
                      width: `${aiDetection.aiConfidenceScore}%`,
                      backgroundColor: aiDetection.aiConfidenceScore > 60 ? '#ef4444' : '#10b981'
                    }}
                  />
                </div>
                <div className="gauge-labels">
                  <span>Human (0%)</span>
                  <strong className={aiDetection.aiConfidenceScore > 60 ? 'text-danger' : 'text-success'}>
                    {aiDetection.aiConfidenceScore}% AI Likelihood
                  </strong>
                  <span>AI (100%)</span>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                 <strong>Confidence: {aiDetection.confidence}</strong>
                 <p className="hint-text" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    *AI-generated likelihood is an analytical estimate, not definitive proof of authorship.
                 </p>
              </div>

              <div className="breakdown-list" style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '8px' }}><strong>Signals Detected:</strong></div>
                {aiDetection.signals?.map((sig, i) => (
                  <div key={i} className="breakdown-item" style={{ borderBottom: 'none', padding: '4px 0', color: sig.includes('⚠') ? '#ef4444' : '#10b981' }}>
                    {sig}
                  </div>
                ))}
                
                <div className="breakdown-item" style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
                  <span>{aiDetection.breakdown?.perplexityLevel}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Panel 2: Parsed Resume Entities */}
        <div className="verif-card glass-panel">
          <div className="card-title-row">
            <FileText className="icon-blue" size={20} />
            <h3>Parsed Resume Overview</h3>
          </div>

          <div className="entity-row">
            <span>Estimated Experience:</span>
            <div className={`badge ${parsedResume.estimatedExperienceYears === 'Unable to determine' ? 'badge-warning' : 'badge-info'}`}>
               {parsedResume.estimatedExperienceYears}
            </div>
          </div>

          <div className="skills-tags-section" style={{ marginTop: '16px' }}>
            <label>Detected Core Skills (To Verify):</label>
            {parsedResume.detectedSkills?.length > 0 ? (
              <div className="skills-chips">
                {parsedResume.detectedSkills.map((skill, idx) => (
                  <span key={idx} className="skill-chip">{skill}</span>
                ))}
              </div>
            ) : (
              <p className="hint-text">No core skills explicitly found in text.</p>
            )}
          </div>

          <div className="skills-tags-section" style={{ marginTop: '16px' }}>
            <label>Extracted Projects:</label>
            {parsedResume.extractedProjects?.length > 0 ? (
               <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--text-color)', marginTop: '8px' }}>
                 {parsedResume.extractedProjects.map((proj, idx) => (
                   <li key={idx} style={{ marginBottom: '8px' }}>
                     <strong>{proj.name}</strong>
                     <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{proj.description}</div>
                     {proj.technologies && proj.technologies.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#818cf8' }}>Tech: {proj.technologies.join(', ')}</div>
                     )}
                   </li>
                 ))}
               </ul>
            ) : (
              <p className="hint-text">No recognizable projects found.</p>
            )}
          </div>
        </div>

      </div>

      <div className="dashboard-footer-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button className="btn btn-secondary" onClick={fetchReport}>
      <div style={{ maxWidth: '800px', margin: '24px auto 0 auto' }}>
        <GithubVerificationPanel 
          parsedResume={parsedResume} 
          candidateName={application.candidateName}
          applicationGithubUrl={application.githubUrl} 
        />
      </div>

      <div className="dashboard-footer-actions" style={{ justifyContent: 'center', marginTop: '32px' }}>
        <button className="btn btn-secondary" onClick={triggerFetchReport}>
          <RefreshCw size={16} /> Re-run AI Analysis
        </button>
        {onBackToApply && (
          <button className="btn btn-secondary" onClick={onBackToApply}>
            Submit Another Application
          </button>
        )}
        {onProceedToInterview && (
          <button className="btn btn-primary" onClick={onProceedToInterview} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
            <Cpu size={16} /> Proceed to Step 6: AI Interview
          </button>
        )}
      </div>
    </div>
  );
}
