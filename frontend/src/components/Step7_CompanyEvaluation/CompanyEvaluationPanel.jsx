import React, { useState } from 'react';
import { BarChart3, Download, Mail, CheckCircle2, UserCheck, ShieldAlert, FileSpreadsheet, Eye, Sparkles, Filter, Lock, RefreshCw, X, GitCommit, Code2, AlertTriangle, Video, Camera, Clock, Activity } from 'lucide-react';
import HeatmapChart from './HeatmapChart';
import AspectGraphs from './AspectGraphs';
import EmailComposerModal from './EmailComposerModal';
import { FAKE_VS_REAL_HEATMAP_DATA } from '../../mockData';

export default function CompanyEvaluationPanel({ jobs = [], candidates: initialCandidates, onUpdateCandidate }) {
  const [selectedJobId, setSelectedJobId] = useState(jobs?.[0]?.id || 'job-101');
  const [candidates, setCandidates] = useState(initialCandidates);

  React.useEffect(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);

  React.useEffect(() => {
    if (jobs && jobs.length > 0 && (!selectedJobId || !jobs.some(j => j.id === selectedJobId))) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs]);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'shortlisted' | 'analytics'
  const [inspectCandidate, setInspectCandidate] = useState(null);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [evaluationClosed, setEvaluationClosed] = useState(false);
  const [filterFakeOnly, setFilterFakeOnly] = useState(false);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const computeWeightedScore = (aspects, weightages) => {
    if (!aspects || !weightages) return 75;
    const score = Math.round(
      (aspects.technical * (weightages.technical / 100)) +
      (aspects.communication * (weightages.communication / 100)) +
      (aspects.fluency * (weightages.fluency / 100)) +
      (aspects.bodyLanguage * (weightages.bodyLanguage / 100)) +
      (aspects.professionalism * (weightages.professionalism / 100))
    );
    return score;
  };

  const jobCandidates = candidates.filter(c => c.jobId === selectedJobId && (!filterFakeOnly || c.isFakeResume));
  const shortlistedCandidates = jobCandidates.filter(c => c.shortlisted);

  const handleToggleShortlist = (candId) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candId) {
        const updated = { ...c, shortlisted: !c.shortlisted };
        if (onUpdateCandidate) onUpdateCandidate(updated);
        return updated;
      }
      return c;
    }));
  };

  const handleExportCSV = (dataList, filename = "candidates_summary.csv") => {
    let csv = "ID,Name,Email,Role,WeightedScore,Technical,Communication,Fluency,FakeResumeScore,ProctoringStatus,ShortlistedStatus\n";
    dataList.forEach(c => {
      const score = computeWeightedScore(c.aspectScores, currentJob.weightages);
      const proctorStatus = c.cheatingDetected ? "TERMINATED_CHEATING" : (c.proctoringLogs && c.proctoringLogs.length > 1 ? "FLAGGED" : "CLEAN");
      csv += `"${c.id}","${c.name}","${c.email}","${c.roleApplied}",${score},${c.aspectScores.technical},${c.aspectScores.communication},${c.aspectScores.fluency},${c.fakeResumeScore}%,"${proctorStatus}",${c.shortlisted ? "YES" : "NO"}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span className="badge badge-info">Step 7: Company Job Evaluation Panel</span>
            {evaluationClosed && <span className="badge badge-warning">Evaluation Closed & Locked</span>}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Candidate Evaluation & Shortlist Management</h2>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => handleExportCSV(jobCandidates, "all_candidates_evaluation.csv")} className="btn-secondary">
            <Download size={16} /> Export Summary (CSV)
          </button>

          <button
            onClick={() => setShowEmailComposer(true)}
            disabled={shortlistedCandidates.length === 0}
            className="btn-primary"
          >
            <Mail size={16} /> Send Email to Selected ({shortlistedCandidates.length})
          </button>

          <button
            onClick={() => setEvaluationClosed(!evaluationClosed)}
            className={evaluationClosed ? "btn-secondary" : "btn-danger"}
          >
            <Lock size={16} /> {evaluationClosed ? "Re-open Evaluation" : "Close Evaluation"}
          </button>
        </div>
      </div>

      {/* Job Post Weightage Info Banner */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', background: 'rgba(99, 102, 241, 0.08)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Job Evaluation Profile:</span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#818cf8' }}>{currentJob.title}</h3>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aspect Weightages:</span>
          {Object.entries(currentJob.weightages).map(([k, v]) => (
            <span key={k} style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', border: '1px solid var(--border-color)', textTransform: 'capitalize' }}>
              {k}: <strong>{v}%</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            All Candidates ({jobCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab('shortlisted')}
            className={activeTab === 'shortlisted' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            <UserCheck size={14} /> Shortlisted Team Sheet ({shortlistedCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            <BarChart3 size={14} /> Heatmap & Graph Visualizations
          </button>
        </div>

        <button
          onClick={() => setFilterFakeOnly(!filterFakeOnly)}
          className={filterFakeOnly ? 'btn-danger' : 'btn-secondary'}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Filter size={14} /> {filterFakeOnly ? "Showing Flagged Only" : "Filter Fake Resumes"}
        </button>
      </div>

      {/* VIEW 1: Candidate Table */}
      {(activeTab === 'all' || activeTab === 'shortlisted') && (
        <div className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Candidate</th>
                <th style={{ padding: '12px' }}>Weighted Score</th>
                <th style={{ padding: '12px' }}>AI Resume Fake Score</th>
                <th style={{ padding: '12px' }}>Proctoring & Camera Audit</th>
                <th style={{ padding: '12px' }}>GitHub AST</th>
                <th style={{ padding: '12px' }}>Status & Action</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'shortlisted' ? shortlistedCandidates : jobCandidates).map((c) => {
                const weightedScore = computeWeightedScore(c.aspectScores, currentJob.weightages);
                const isTerminated = c.cheatingDetected || c.terminated;
                const flagCount = (c.proctoringLogs ? c.proctoringLogs.length : 0) + (c.tabSwitches || 0);

                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }}>
                    
                    {/* Candidate Info */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={c.avatar} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Weighted Score */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: weightedScore >= 80 ? '#34d399' : '#fbbf24' }}>
                        {weightedScore} / 100
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Weighted Score</span>
                    </td>

                    {/* Fake Resume Score */}
                    <td style={{ padding: '12px' }}>
                      <span className={c.isFakeResume ? "badge badge-danger" : "badge badge-success"}>
                        {c.fakeResumeScore}% {c.isFakeResume ? "Fake Risk" : "Authentic"}
                      </span>
                    </td>

                    {/* Proctoring & Camera Status Badge */}
                    <td style={{ padding: '12px' }}>
                      {isTerminated ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldAlert size={12} /> TERMINATED (CHEATING)
                        </span>
                      ) : flagCount > 1 ? (
                        <span className="badge badge-warning">
                          <AlertTriangle size={12} /> Flagged ({flagCount} Events)
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Verified Clean
                        </span>
                      )}
                    </td>

                    {/* GitHub AST Score */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: c.github?.astComplexityScore > 70 ? '#34d399' : '#f43f5e' }}>
                        <GitCommit size={14} /> AST: {c.github?.astComplexityScore || 80}/100
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.github?.commitPattern?.split(' ')[0] || 'Active'}</span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => setInspectCandidate(c)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                          <Eye size={14} /> Deep Analysis
                        </button>

                        <button
                          onClick={() => handleToggleShortlist(c.id)}
                          className={c.shortlisted ? "btn-success" : "btn-secondary"}
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          <CheckCircle2 size={14} /> {c.shortlisted ? "Shortlisted" : "Select"}
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: Heatmap & Graph Visualizations */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <HeatmapChart heatmapData={FAKE_VS_REAL_HEATMAP_DATA} />
          <AspectGraphs candidates={jobCandidates} />
        </div>
      )}

      {/* CANDIDATE DEEP ANALYSIS INSPECTION MODAL */}
      {inspectCandidate && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src={inspectCandidate.avatar} alt="" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{inspectCandidate.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inspectCandidate.email} • {inspectCandidate.roleApplied}</p>
                </div>
              </div>

              <button onClick={() => setInspectCandidate(null)} className="btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {/* AI Reasoning & Fraud Alert Box */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: inspectCandidate.cheatingDetected || inspectCandidate.isFakeResume ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: inspectCandidate.cheatingDetected || inspectCandidate.isFakeResume ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: inspectCandidate.cheatingDetected || inspectCandidate.isFakeResume ? '#f43f5e' : '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {inspectCandidate.cheatingDetected || inspectCandidate.isFakeResume ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                AI Evaluator Reasoning & Observations
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#e2e8f0' }}>
                {inspectCandidate.terminationReason
                  ? `TEST TERMINATED FOR CHEATING: ${inspectCandidate.terminationReason}`
                  : inspectCandidate.aiObservations}
              </p>
            </div>

            {/* Comprehensive Proctoring & Camera Security Audit Card */}
            <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} /> Proctoring & Webcam Security Audit
                </h4>
                <span className={inspectCandidate.cheatingDetected ? "badge badge-danger" : inspectCandidate.tabSwitches > 0 ? "badge badge-warning" : "badge badge-success"}>
                  {inspectCandidate.cheatingDetected ? "CHEATING TERMINATED" : inspectCandidate.tabSwitches > 0 ? `${inspectCandidate.tabSwitches} Flag(s)` : "CAMERA VERIFIED CLEAN"}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max Humans Observed</span>
                  <div style={{ fontWeight: 700, color: inspectCandidate.maxPersonCount > 1 ? '#f43f5e' : '#34d399', fontSize: '0.85rem', marginTop: '2px' }}>
                    {inspectCandidate.maxPersonCount || 1} Human(s) Frame
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tab Switches</span>
                  <div style={{ fontWeight: 700, color: (inspectCandidate.sessionStats?.tabSwitches ?? inspectCandidate.tabSwitches) > 0 ? '#f43f5e' : 'white', fontSize: '0.85rem', marginTop: '2px' }}>
                    {inspectCandidate.sessionStats?.tabSwitches ?? inspectCandidate.tabSwitches ?? 0} Incident(s)
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Focus Loss Events</span>
                  <div style={{ fontWeight: 700, color: (inspectCandidate.sessionStats?.focusLosses ?? inspectCandidate.focusLossEvents) > 0 ? '#fbbf24' : 'white', fontSize: '0.85rem', marginTop: '2px' }}>
                    {inspectCandidate.sessionStats?.focusLosses ?? inspectCandidate.focusLossEvents ?? 0} Incident(s)
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Suspicious Movement</span>
                  <div style={{ fontWeight: 700, color: (inspectCandidate.sessionStats?.suspiciousMovements ?? inspectCandidate.suspiciousMovementEvents) > 0 ? '#f43f5e' : 'white', fontSize: '0.85rem', marginTop: '2px' }}>
                    {inspectCandidate.sessionStats?.suspiciousMovements ?? (typeof inspectCandidate.suspiciousMovementEvents === 'number' ? inspectCandidate.suspiciousMovementEvents : (inspectCandidate.suspiciousMovementEvents?.length || inspectCandidate.cameraEvents?.filter(e => e.type === 'SUSPICIOUS_MOVEMENT').length || 0))} Logged
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gaze Loss Events</span>
                  <div style={{ fontWeight: 700, color: (inspectCandidate.sessionStats?.gazeLosses ?? inspectCandidate.gazeLossEvents) > 0 ? '#fbbf24' : 'white', fontSize: '0.85rem', marginTop: '2px' }}>
                    {inspectCandidate.sessionStats?.gazeLosses ?? inspectCandidate.gazeLossEvents ?? inspectCandidate.cameraEvents?.filter(e => e.type === 'GAZE_LOSS').length ?? 0} Event(s)
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Face Not Visible</span>
                  <div style={{ fontWeight: 700, color: (inspectCandidate.sessionStats?.faceMissingEvents ?? inspectCandidate.faceMissingEvents) > 0 ? '#f43f5e' : 'white', fontSize: '0.85rem', marginTop: '2px' }}>
                    {inspectCandidate.sessionStats?.faceMissingEvents ?? inspectCandidate.faceMissingEvents ?? inspectCandidate.cameraEvents?.filter(e => e.type === 'FACE_NOT_VISIBLE').length ?? 0} Event(s)
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Multiple Voices</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '2px' }}>
                    {inspectCandidate.voiceProctoringAvailable === false ? (
                      <span style={{ color: '#fbbf24' }}>NOT TESTED (MIC UNAVAILABLE)</span>
                    ) : (
                      <span style={{ color: (inspectCandidate.multipleVoiceEvents || inspectCandidate.cameraEvents?.filter(e => e.type === 'MULTIPLE_VOICE').length) > 0 ? '#f43f5e' : '#34d399' }}>
                        {(inspectCandidate.multipleVoiceEvents || inspectCandidate.cameraEvents?.filter(e => e.type === 'MULTIPLE_VOICE').length || 0)} Event(s)
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Out of Frame Zone</span>
                  <div style={{ fontWeight: 700, color: (inspectCandidate.outOfFrameEvents || inspectCandidate.cameraEvents?.filter(e => e.type === 'OUT_OF_FRAME').length) > 0 ? '#f43f5e' : '#34d399', fontSize: '0.85rem', marginTop: '2px' }}>
                    {(inspectCandidate.outOfFrameEvents || inspectCandidate.cameraEvents?.filter(e => e.type === 'OUT_OF_FRAME').length || 0)} Breach(es)
                  </div>
                </div>
              </div>

              {/* Body Language Report Analysis */}
              {inspectCandidate.bodyLanguageReport ? (
                <div style={{ background: 'rgba(99, 102, 241, 0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={14} /> Body-Language Analysis Metrics
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                    <div>Posture: <strong style={{ color: 'white' }}>{inspectCandidate.bodyLanguageReport.postureConsistency}%</strong></div>
                    <div>Movement: <strong style={{ color: 'white' }}>{inspectCandidate.bodyLanguageReport.movementLevel}</strong></div>
                    <div>Face Visibility: <strong style={{ color: 'white' }}>{inspectCandidate.bodyLanguageReport.faceVisibility}%</strong></div>
                    <div>Gaze Attention: <strong style={{ color: 'white' }}>{inspectCandidate.bodyLanguageReport.gazeAttention || `${inspectCandidate.bodyLanguageReport.attentionPercentage || 92}% Attentive`}</strong></div>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                    {inspectCandidate.bodyLanguageReport.disclaimer}
                  </p>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Insufficient camera data for reliable body-language analysis.
                </div>
              )}
            </div>

            {/* Github & Profile Audit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GitCommit size={16} /> GitHub Profile AST Analysis
                </h4>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
                  <div>Username: <strong style={{ color: 'white' }}>{inspectCandidate.github?.username || 'N/A'}</strong></div>
                  <div>AST Complexity: <strong style={{ color: '#34d399' }}>{inspectCandidate.github?.astComplexityScore || 80}/100</strong></div>
                  <div>Commit Pattern: <span>{inspectCandidate.github?.commitPattern || 'Organic'}</span></div>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code2 size={16} /> LeetCode & Verification
                </h4>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
                  <div>Problems Solved: <strong style={{ color: 'white' }}>{inspectCandidate.leetcode?.solvedCount || 150}</strong></div>
                  <div>Ranking: <span>{inspectCandidate.leetcode?.ranking || 'Top 15%'}</span></div>
                  <div>LinkedIn Verified: <strong style={{ color: inspectCandidate.linkedInVerified ? '#34d399' : '#f43f5e' }}>{inspectCandidate.linkedInVerified ? "VERIFIED" : "UNVERIFIED"}</strong></div>
                </div>
              </div>
            </div>

            {/* Transcript Review */}
            {inspectCandidate.interviewTranscript && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>AI Interview Q&A & Trick Question Transcript</h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {inspectCandidate.interviewTranscript.map((t, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                      <span style={{ fontWeight: 700, color: t.speaker.startsWith('AI') ? '#38bdf8' : '#a5b4fc' }}>{t.speaker}: </span>
                      <span style={{ color: '#cbd5e1' }}>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setInspectCandidate(null)} className="btn-secondary">
                Close Inspection
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EMAIL COMPOSER MODAL */}
      {showEmailComposer && (
        <EmailComposerModal
          selectedCandidates={shortlistedCandidates}
          onClose={() => setShowEmailComposer(false)}
          onSendAll={() => setShowEmailComposer(false)}
        />
      )}

    </div>
  );
}
