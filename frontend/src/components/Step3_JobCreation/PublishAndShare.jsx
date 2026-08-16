import { useState } from 'react';
import { Share2, Copy, Check, Globe, Lock, ExternalLink, Briefcase } from 'lucide-react';

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export default function PublishAndShare({ createdJob, onNavigateToApply }) {
  const [copied, setCopied] = useState(false);
  const [isPublished, setIsPublished] = useState(createdJob?.isPublishedPortal ?? true);

  const fullShareUrl = `${window.location.origin}/apply/${createdJob?.shareId || createdJob?.id || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="publish-share-section">
      <div className="section-title-badge">
        <Share2 size={18} />
        <span>Step 3: Job Published & Shareable Application Link Generated</span>
      </div>

      <div className="success-banner glass-panel">
        <div className="success-icon-wrap">🎉</div>
        <div>
          <h3>Job Post Created Successfully!</h3>
          <p>Role: <strong>{createdJob?.title}</strong> ({createdJob?.department})</p>
        </div>
      </div>

      {/* Share Link Card */}
      <div className="share-link-card glass-panel">
        <h4>Shareable Application Link for Candidates</h4>
        <p className="subtitle">Candidates can click this link to apply, fill out your dynamic form, and upload their resume.</p>

        <div className="copy-link-box">
          <input type="text" readOnly value={fullShareUrl} />
          <button className={`btn ${copied ? 'btn-success' : 'btn-primary'}`} onClick={handleCopyLink}>
            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
          </button>
        </div>

        <div className="portal-toggle-row">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
          <div className="toggle-label-text">
            {isPublished ? (
              <span><Globe size={16} className="icon-success" /> Published on Public Intellify Job Portal</span>
            ) : (
              <span><Lock size={16} className="icon-warning" /> Private (Apply via Shareable Link Only)</span>
            )}
          </div>
        </div>
      </div>

      {/* Platform Publishing Integration Shortcuts */}
      <div className="platform-publish-card glass-panel">
        <h4>Direct Multi-Platform Publishing</h4>
        <p className="subtitle">Publish this job posting directly to partner portals with 1-click:</p>

        <div className="platform-buttons-grid">
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullShareUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="platform-btn linkedin"
          >
            <LinkedinIcon size={18} /> Share to LinkedIn
          </a>

          <button className="platform-btn indeed" onClick={() => alert('Integrated with Indeed Job Posting API!')}>
            <Briefcase size={18} /> Publish on Indeed
          </button>

          <button className="platform-btn internshala" onClick={() => alert('Integrated with Internshala Employer API!')}>
            <ExternalLink size={18} /> Post on Internshala
          </button>
        </div>
      </div>

      {/* Action to test application view */}
      <div className="test-apply-callout">
        <button
          className="btn btn-gold btn-lg"
          onClick={() => onNavigateToApply(createdJob?.shareId)}
        >
          <ExternalLink size={18} /> Test Candidate Application View (Step 4)
        </button>
      </div>
    </div>
  );
}
