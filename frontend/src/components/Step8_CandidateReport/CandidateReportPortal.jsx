import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, HelpCircle, BookOpen, ShieldCheck, UserCheck, Eye, Cpu, ShieldAlert, Activity, Camera, Clock } from 'lucide-react';

export default function CandidateReportPortal({ candidate: activeCandidate, candidates }) {
  const [selectedCandId, setSelectedCandId] = useState(activeCandidate ? activeCandidate.id : 'cand-001');

  const candidate = candidates.find(c => c.id === selectedCandId) || candidates[0];

  const weightedScore = Math.round(
    (candidate.aspectScores?.technical * 0.35) +
    (candidate.aspectScores?.communication * 0.25) +
    (candidate.aspectScores?.fluency * 0.15) +
    (candidate.aspectScores?.bodyLanguage * 0.15) +
    (candidate.aspectScores?.professionalism * 0.10)
  );

  const isTerminated = candidate.cheatingDetected || candidate.terminated;
  const proctorLogs = candidate.proctoringLogs || [];
  const cameraEvents = candidate.cameraEvents || [];
  const bodyReport = candidate.bodyLanguageReport;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Selector Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="badge badge-info">Step 8: Candidate Assessment Report</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>Your AI Assessment Performance & Security Audit</h2>
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

      {/* Main Candidate Banner */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <img src={candidate.avatar} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{candidate.name}</h3>
              <span className={isTerminated ? "badge badge-danger" : candidate.shortlisted ? "badge badge-success" : "badge badge-info"}>
                {isTerminated ? "TERMINATED FOR CHEATING" : candidate.shortlisted ? "Shortlisted for Next Round" : candidate.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Role: <strong style={{ color: 'white' }}>{candidate.roleApplied}</strong> • Evaluated on {candidate.appliedDate}
            </p>
          </div>
        </div>

        {/* Score Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.04)', padding: '14px 24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Weighted Score</span>
            <h4 style={{ fontSize: '2.2rem', fontWeight: 800 }} className="gradient-text">{weightedScore}/100</h4>
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={26} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* Aspect Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {candidate.aspectScores && Object.entries(candidate.aspectScores).map(([aspect, score]) => (
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

      {/* Grid: Feedback vs Security Audit & Body Language */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Feedback & Recommendations */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#fbbf24" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Feedback & Key Recommendations</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actionable insights from your interview session.</p>
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

        {/* Proctoring & Security Audit Report */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="#34d399" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Proctoring & Identity Integrity Audit</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Webcam stream & session integrity logs.</p>
            </div>
          </div>            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Camera Status:</span>
                <strong style={{ color: '#34d399' }}>Verified</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max Humans Observed:</span>
                <strong style={{ color: candidate.maxPersonCount > 1 ? '#f43f5e' : '#34d399' }}>{candidate.maxPersonCount || 1}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tab Switches:</span>
                <strong style={{ color: (candidate.sessionStats?.tabSwitches ?? candidate.tabSwitches) > 0 ? '#f43f5e' : 'white' }}>
                  {candidate.sessionStats?.tabSwitches ?? candidate.tabSwitches ?? 0} Incident(s)
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Focus Loss:</span>
                <strong style={{ color: (candidate.sessionStats?.focusLosses ?? candidate.focusLossEvents) > 0 ? '#fbbf24' : 'white' }}>
                  {candidate.sessionStats?.focusLosses ?? candidate.focusLossEvents ?? 0} Incident(s)
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Suspicious Movement:</span>
                <strong style={{ color: (candidate.sessionStats?.suspiciousMovements ?? candidate.suspiciousMovementEvents) > 0 ? '#f43f5e' : 'white' }}>
                  {candidate.sessionStats?.suspiciousMovements ?? (typeof candidate.suspiciousMovementEvents === 'number' ? candidate.suspiciousMovementEvents : (candidate.suspiciousMovementEvents?.length || candidate.cameraEvents?.filter(e => e.type === 'SUSPICIOUS_MOVEMENT').length || 0))} Logged
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gaze Loss Events:</span>
                <strong style={{ color: (candidate.sessionStats?.gazeLosses ?? candidate.gazeLossEvents) > 0 ? '#fbbf24' : 'white' }}>
                  {candidate.sessionStats?.gazeLosses ?? candidate.gazeLossEvents ?? candidate.cameraEvents?.filter(e => e.type === 'GAZE_LOSS').length ?? 0} Event(s)
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Face Not Visible:</span>
                <strong style={{ color: (candidate.sessionStats?.faceMissingEvents ?? candidate.faceMissingEvents) > 0 ? '#f43f5e' : 'white' }}>
                  {candidate.sessionStats?.faceMissingEvents ?? candidate.faceMissingEvents ?? candidate.cameraEvents?.filter(e => e.type === 'FACE_NOT_VISIBLE').length ?? 0} Event(s)
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Multiple Voices:</span>
                {candidate.voiceProctoringAvailable === false ? (
                  <strong style={{ color: '#fbbf24' }}>NOT TESTED (MIC UNAVAILABLE)</strong>
                ) : (
                  <strong style={{ color: (candidate.multipleVoiceEvents || candidate.cameraEvents?.filter(e => e.type === 'MULTIPLE_VOICE').length) > 0 ? '#f43f5e' : '#34d399' }}>
                    {(candidate.multipleVoiceEvents || candidate.cameraEvents?.filter(e => e.type === 'MULTIPLE_VOICE').length || 0)} Event(s)
                  </strong>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Out of Frame Zone:</span>
                <strong style={{ color: (candidate.outOfFrameEvents || candidate.cameraEvents?.filter(e => e.type === 'OUT_OF_FRAME').length) > 0 ? '#f43f5e' : '#34d399' }}>
                  {(candidate.outOfFrameEvents || candidate.cameraEvents?.filter(e => e.type === 'OUT_OF_FRAME').length || 0)} Breach(es)
                </strong>
              </div>
            </div>

            {isTerminated && (
              <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.15)', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.3)', fontSize: '0.82rem', color: '#f43f5e' }}>
                <strong>TEST TERMINATED FOR CHEATING:</strong> {candidate.terminationReason || "Multiple persons detected in camera frame."}
              </div>
            )}
          </div>

          {/* Body Language Analysis Section */}
          <div style={{ marginTop: '8px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} /> Body-Language & Gaze Analysis Report
            </h5>

            {bodyReport && bodyReport.isSufficient ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                  <div>Posture Consistency: <strong style={{ color: 'white' }}>{bodyReport.postureConsistency}%</strong></div>
                  <div>Movement Level: <strong style={{ color: 'white' }}>{bodyReport.movementLevel}</strong></div>
                  <div>Face Visibility Score: <strong style={{ color: 'white' }}>{bodyReport.faceVisibility}%</strong></div>
                  <div>Gaze Attention: <strong style={{ color: 'white' }}>{bodyReport.gazeAttention || `${bodyReport.attentionPercentage || 92}% Attentive`}</strong></div>
                  <div>Confidence Indicator: <strong style={{ color: 'white' }}>{bodyReport.confidenceIndicator}</strong></div>
                </div>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic', lineHeight: '1.4' }}>
                  {bodyReport.disclaimer}
                </p>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Insufficient camera data for reliable body-language analysis.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
