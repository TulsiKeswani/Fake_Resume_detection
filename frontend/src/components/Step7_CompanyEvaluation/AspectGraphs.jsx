import React from 'react';
import { BarChart3, TrendingUp, Award, Layers } from 'lucide-react';

export default function AspectGraphs({ candidates }) {
  if (!candidates || candidates.length === 0) return null;

  // Compute average aspect scores across candidate pool
  const aspectKeys = ['technical', 'communication', 'fluency', 'bodyLanguage', 'professionalism'];
  
  const aspectAverages = aspectKeys.map(key => {
    const total = candidates.reduce((sum, c) => sum + (c.aspectScores[key] || 0), 0);
    const avg = Math.round(total / candidates.length);
    return { key, label: key.replace(/([A-Z])/g, ' $1'), avg };
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      
      {/* Aspect Breakdown Bar Chart */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#818cf8" /> Candidate Pool Aspect Distribution
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Average scores calculated across company-defined weightage metrics.
            </p>
          </div>
          <span className="badge badge-info">Weighted Pool Avg</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
          {aspectAverages.map(({ key, label, avg }) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px', textTransform: 'capitalize' }}>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span style={{ fontWeight: 700, color: avg > 75 ? '#34d399' : '#fbbf24' }}>{avg}/100</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${avg}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                  borderRadius: '5px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Score Comparison Graph */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#34d399" /> Candidate Final Weighted Rankings
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Comparing top candidates against company cutoff thresholds.
            </p>
          </div>
          <span className="badge badge-success">Top Cutoff: 80%</span>
        </div>

        {/* Visual Bar Comparison */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', paddingTop: '20px', borderBottom: '1px solid var(--border-color)' }}>
          {candidates.slice(0, 5).map((c, idx) => {
            // Compute sample total score
            const total = Math.round(
              (c.aspectScores.technical * 0.35) +
              (c.aspectScores.communication * 0.25) +
              (c.aspectScores.fluency * 0.15) +
              (c.aspectScores.bodyLanguage * 0.15) +
              (c.aspectScores.professionalism * 0.10)
            );
            const isHigh = total >= 80;

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '18%' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isHigh ? '#34d399' : '#f43f5e' }}>{total}</span>
                <div style={{
                  width: '100%',
                  height: `${Math.max(20, total * 1.5)}px`,
                  background: isHigh ? 'linear-gradient(180deg, #10b981 0%, #047857 100%)' : 'linear-gradient(180deg, #f43f5e 0%, #be123c 100%)',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: isHigh ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                  transition: 'height 0.5s ease'
                }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                  {c.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
