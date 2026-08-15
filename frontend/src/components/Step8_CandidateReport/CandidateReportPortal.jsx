import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, HelpCircle, BookOpen, ShieldCheck, UserCheck, Eye, Cpu } from 'lucide-react';

export default function CandidateReportPortal({ candidate: activeCandidate, candidates }) {
  const [selectedCandId, setSelectedCandId] = useState(activeCandidate ? activeCandidate.id : 'cand-001');

  const candidate = candidates.find(c => c.id === selectedCandId) || candidates[0];

  // Calculate weighted overall score
  const weightedScore = Math.round(
    (candidate.aspectScores.technical * 0.35) +
    (candidate.aspectScores.communication * 0.25) +
    (candidate.aspectScores.fluency * 0.15) +
    (candidate.aspectScores.bodyLanguage * 0.15) +
    (candidate.aspectScores.professionalism * 0.10)
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Selector (To switch candidate report perspective) */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="badge badge-info">Step 8: Candidate Dashboard Report</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>Your AI Assessment Performance & Results</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Candidate Profile:</span>
          <select
            value={selectedCandId}
            onChange={(e) => setSelectedCandId(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.roleApplied})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Candidate Banner Card */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <img src={candidate.avatar} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{candidate.name}</h3>
              <span className={candidate.shortlisted ? "badge badge-success" : "badge badge-info"}>
                {candidate.shortlisted ? "Shortlisted for Next Round" : candidate.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Role: <strong style={{ color: 'white' }}>{candidate.roleApplied}</strong> • Evaluated on {candidate.appliedDate}
            </p>
          </div>
        </div>

        {/* Big Weighted Score Circle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.04)', padding: '14px 24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall AI Weighted Score</span>
            <h4 style={{ fontSize: '2.2rem', fontWeight: 800 }} className="gradient-text">{weightedScore}/100</h4>
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={26} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* Aspect Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {Object.entries(candidate.aspectScores).map(([aspect, score]) => (
          <div key={aspect} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {aspect.replace(/([A-Z])/g, ' $1')}
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: score > 80 ? '#34d399' : score > 60 ? '#fbbf24' : '#f43f5e' }}>
              {score}%
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${score}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Section: AI Improvement Areas & Proctoring Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Specific Improvement Areas & Recommendations */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#fbbf24" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Feedback & Key Improvement Areas</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actionable insights generated from your interview session.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {candidate.improvementAreas && candidate.improvementAreas.map((area, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Sparkles size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proctoring & AI Resume Confidence Report */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="#34d399" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Proctoring & Resume Authenticity Audit</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified against GitHub AST & Proctoring logs.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>AI Text Density / Fake Resume Score:</span>
              <strong style={{ color: candidate.isFakeResume ? '#f43f5e' : '#34d399' }}>
                {candidate.fakeResumeScore}% {candidate.isFakeResume ? "(High AI Density)" : "(Authentic)"}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>GitHub AST Code Complexity:</span>
              <strong style={{ color: candidate.github.astComplexityScore > 70 ? '#34d399' : '#f43f5e' }}>
                {candidate.github.astComplexityScore}/100 Score
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Anti-Cheating Proctoring Flags:</span>
              <strong style={{ color: candidate.proctoringLogs.length > 1 ? '#f43f5e' : '#34d399' }}>
                {candidate.proctoringLogs.length} Flagged Incident(s)
              </strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
