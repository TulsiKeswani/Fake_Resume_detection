import React, { useState } from 'react';
import { api } from '../../services/api';
import { Loader2, CheckCircle2, AlertTriangle, ChevronRight, X, UserCheck } from 'lucide-react';
import './GithubVerificationPanel.css';

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export default function GithubVerificationPanel({ parsedResume, candidateName, applicationGithubUrl }) {
  const resumeGithub = parsedResume?.extractedGithub;
  const initialUrl = applicationGithubUrl || resumeGithub || '';
  
  const [githubUrl, setGithubUrl] = useState(initialUrl);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const [mismatchResolved, setMismatchResolved] = useState(false);
  
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const hasMismatch = applicationGithubUrl && resumeGithub && applicationGithubUrl !== resumeGithub;

  const extractUsername = (url) => {
    if (!url) return '';
    try {
      let cleanUrl = url.trim().replace(/\/+$/, '');
      const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
      if (urlObj.hostname.includes('github.com')) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        return pathParts[0] || url.trim();
      }
      return url.trim();
    } catch {
      const match = url.match(/github\.com\/([^\/?#]+)/);
      return match ? match[1] : url.trim();
    }
  };

  const handleVerify = async (urlToVerify = githubUrl) => {
    const username = extractUsername(urlToVerify);
    if (!username) {
      setError('Please provide a valid GitHub username or URL.');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    const skills = parsedResume?.detectedSkills || [];
    const projects = parsedResume?.extractedProjects || [];

    try {
      const res = await api.verifyGithub({
        githubUsername: username,
        candidateName: candidateName || 'Candidate',
        skills,
        projects
      });

      if (res.success) {
        setResult(res.verificationResult);
      } else {
        setError(res.message || 'Verification failed.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify if no mismatch and we have a valid URL
  React.useEffect(() => {
    if (!hasMismatch && initialUrl && !result && !isVerifying && !error) {
       handleVerify(initialUrl);
    }
  }, [initialUrl, hasMismatch]);

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 75) return 'score-good';
    if (score >= 50) return 'score-warning';
    return 'score-danger';
  };

  const EvidenceModal = () => {
    if (!selectedEvidence) return null;
    return (
      <div className="evidence-modal-overlay" onClick={() => setSelectedEvidence(null)}>
        <div className="evidence-modal-content glass-panel" onClick={e => e.stopPropagation()}>
          <div className="evidence-modal-header">
            <h3>{selectedEvidence.title}</h3>
            <button className="close-btn" onClick={() => setSelectedEvidence(null)}><X size={20} /></button>
          </div>
          <div className="evidence-modal-body">
            <div className={`score-badge ${getScoreColorClass(selectedEvidence.score)}`}>
              Score: {selectedEvidence.score}/100 - {selectedEvidence.status}
            </div>
            <h4>Evidence Found</h4>
            <ul className="evidence-list">
              {selectedEvidence.evidence.map((ev, i) => (
                <li key={i}><CheckCircle2 size={16} className="text-success" /> {ev}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (hasMismatch && !mismatchResolved) {
    return (
      <div className="verif-card glass-panel github-verification-panel">
        <div className="card-title-row">
          <GithubIcon size={24} />
          <h3>AI Resume Verification (GitHub)</h3>
        </div>
        <div className="alert alert-warning mt-3">
          <AlertTriangle size={18} />
          <strong>GitHub profiles do not match.</strong>
          <p>The candidate's saved profile is different from the one extracted in the resume.</p>
        </div>
        <div className="mismatch-options mt-4" style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
          <div className="mismatch-option" style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <p className="hint-text mb-2">Saved Profile:</p>
            <a href={applicationGithubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{applicationGithubUrl}</a>
            <button className="btn btn-primary mt-3 w-100" onClick={() => { setGithubUrl(applicationGithubUrl); setMismatchResolved(true); handleVerify(applicationGithubUrl); }}>
              Use Saved Profile
            </button>
          </div>
          <div className="mismatch-option" style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <p className="hint-text mb-2">Resume Profile:</p>
            <a href={resumeGithub} target="_blank" rel="noreferrer" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{resumeGithub}</a>
            <button className="btn btn-secondary mt-3 w-100" onClick={() => { setGithubUrl(resumeGithub); setMismatchResolved(true); handleVerify(resumeGithub); }}>
              Use Resume Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result && !isVerifying) {
    return (
      <div className="verif-card glass-panel github-verification-panel">
        <div className="card-title-row">
          <GithubIcon size={24} />
          <h3>AI Resume Verification (GitHub)</h3>
        </div>
        
        {!initialUrl ? (
          <div className="no-github-state mt-4">
            <p className="hint-text text-center mb-3">No GitHub profile connected.</p>
            <div className="github-input-group">
              <label>GitHub Profile URL</label>
              <div className="input-row">
                <input 
                  type="text" 
                  placeholder="https://github.com/username" 
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="github-input"
                />
                <button className="btn btn-primary" onClick={() => handleVerify(githubUrl)}>Save & Verify</button>
              </div>
              {error && <p className="text-danger mt-2"><AlertTriangle size={14} /> {error}</p>}
            </div>
          </div>
        ) : (
          <div className="auto-verify-state mt-3">
             <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle2 size={18} />
                <span>GitHub profile found: <strong>{githubUrl}</strong></span>
             </div>
             {error ? (
                <div className="error-state">
                   <p className="text-danger"><AlertTriangle size={14} /> {error}</p>
                   <button className="btn btn-secondary mt-3" onClick={() => handleVerify(githubUrl)}>Retry Verification</button>
                </div>
             ) : (
                <button className="btn btn-primary mt-2" onClick={() => handleVerify(githubUrl)}>Run Verification</button>
             )}
          </div>
        )}
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="verif-card glass-panel github-verification-panel verifying-state">
        <Loader2 className="spinner icon-blue" size={32} />
        <h3>Analyzing GitHub profile...</h3>
        <p className="hint-text">Fetching repositories...</p>
        <p className="hint-text">Analyzing technologies...</p>
        <p className="hint-text">Checking project evidence...</p>
        <p className="hint-text">Calculating verification score...</p>
      </div>
    );
  }

  return (
    <div className="verif-card glass-panel github-verification-panel results-state">
      <div className="card-title-row">
        <GithubIcon size={24} />
        <h3>AI Resume Verification</h3>
      </div>

      {/* GitHub Profile Card */}
      <div className="github-summary-card glass-panel-inner">
        <div className="summary-left">
          <h4>GitHub: <a href={result.githubProfile.url} target="_blank" rel="noreferrer">{result.githubProfile.username}</a></h4>
          <p>Public Repositories Analyzed: {result.githubProfile.publicReposCount}</p>
        </div>
        <div className="summary-right text-center">
          <div className="overall-score-large">
            <span className={`number ${getScoreColorClass(result.overallScore)}`}>{result.overallScore}</span>
            <span className="max">/ 100</span>
          </div>
          <div className="status-text">{result.overallScore >= 75 ? '✓' : '⚠'} {result.overallStatus}</div>
        </div>
      </div>

      {/* Component Scores Overview */}
      <div className="component-scores">
        <div className="score-item"><span>Skill Verification</span> <strong>{result.componentScores.skills}/100</strong></div>
        <div className="score-item"><span>Project Verification</span> <strong>{result.componentScores.projects}/100</strong></div>
        <div className="score-item"><span>Identity Confidence</span> <strong>{result.componentScores.identity}/100</strong></div>
      </div>

      <hr className="divider" />

      {/* Identity */}
      <div className="identity-section mb-4">
        <h4><UserCheck size={18}/> Identity Confidence</h4>
        <div className="identity-card p-3 glass-panel-inner">
          <div className="flex-between">
            <span>Score: <strong>{result.identity.score}/100</strong></span>
            <span className={result.identity.score >= 80 ? 'text-success' : 'text-warning'}>
              {result.identity.score >= 80 ? '✓ ' : '⚠ '}{result.identity.status}
            </span>
          </div>
          <p className="hint-text mt-1">{result.identity.message}</p>
        </div>
      </div>

      {/* Skills */}
      <div className="skills-section mb-4">
        <h4>Skill Verification</h4>
        <div className="verification-list">
          {result.skills.map((skill, i) => (
            <div key={i} className="verification-list-item glass-panel-inner">
              <div className="item-header">
                <div>
                  <strong>{skill.name}</strong>
                  <span className={`ml-3 ${getScoreColorClass(skill.score)}`}>{skill.score}/100</span>
                </div>
                <div className="status-badge">
                  {skill.score >= 75 ? <CheckCircle2 size={16} className="text-success mr-1"/> : <AlertTriangle size={16} className="text-warning mr-1"/>}
                  {skill.status}
                </div>
              </div>
              <button 
                className="btn btn-sm btn-outline mt-2"
                onClick={() => setSelectedEvidence({ title: `Skill: ${skill.name}`, ...skill })}
              >
                View Evidence <ChevronRight size={14}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="projects-section mb-4">
        <h4>Project Verification</h4>
        {result.projects.length === 0 ? <p className="hint-text">No projects extracted to verify.</p> : null}
        <div className="verification-list">
          {result.projects.map((proj, i) => (
            <div key={i} className="verification-list-item glass-panel-inner">
              <div className="item-header">
                <div>
                  <strong>{proj.name}</strong>
                  <span className={`ml-3 ${getScoreColorClass(proj.score)}`}>{proj.score}/100</span>
                </div>
                <div className="status-badge">
                  {proj.score >= 75 ? <CheckCircle2 size={16} className="text-success mr-1"/> : <AlertTriangle size={16} className="text-warning mr-1"/>}
                  {proj.status}
                </div>
              </div>
              <button 
                className="btn btn-sm btn-outline mt-2"
                onClick={() => setSelectedEvidence({ title: `Project: ${proj.name}`, ...proj })}
              >
                View Evidence <ChevronRight size={14}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      <EvidenceModal />
    </div>
  );
}
