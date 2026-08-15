import React from 'react';
import { Grid, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

export default function HeatmapChart({ heatmapData }) {
  // Color scale helper for heatmap intensity
  const getCellColor = (value, isInverse = false) => {
    // isInverse: higher value is BAD (e.g. AI Text Density, Reality Gap)
    let score = isInverse ? 100 - value : value;
    if (score >= 80) return { bg: 'rgba(16, 185, 129, 0.25)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
    if (score >= 50) return { bg: 'rgba(245, 158, 11, 0.25)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
    return { bg: 'rgba(244, 63, 94, 0.25)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.4)' };
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Grid size={20} color="#06b6d4" /> Fake vs Real Resumes AI Detection Heatmap
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-dimensional matrix cross-referencing candidate resume claims against GitHub AST code parsing, LeetCode verification, and interview reality testing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.4)' }} /> Authentic / Low Risk
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(244, 63, 94, 0.4)' }} /> Fake Resume Anomaly
          </div>
        </div>
      </div>

      {/* Heatmap Grid Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Candidate Name</th>
              <th style={{ padding: '8px' }}>AI Text Density %</th>
              <th style={{ padding: '8px' }}>Commit Consistency</th>
              <th style={{ padding: '8px' }}>AST Code Complexity</th>
              <th style={{ padding: '8px' }}>Claim Verification</th>
              <th style={{ padding: '8px' }}>Interview Reality Gap</th>
              <th style={{ padding: '8px' }}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, idx) => {
              const aiTextStyle = getCellColor(row.aiTextDensity, true);
              const commitStyle = getCellColor(row.commitConsistency, false);
              const astStyle = getCellColor(row.astComplexity, false);
              const claimStyle = getCellColor(row.claimVerification, false);
              const gapStyle = getCellColor(row.realityGap, true);

              return (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                    {row.candidateName}
                  </td>

                  {/* AI Text Density */}
                  <td style={{ textAlign: 'center', padding: '10px', background: aiTextStyle.bg, color: aiTextStyle.text, border: `1px solid ${aiTextStyle.border}`, borderRadius: '8px', fontWeight: 700 }}>
                    {row.aiTextDensity}%
                  </td>

                  {/* Commit Consistency */}
                  <td style={{ textAlign: 'center', padding: '10px', background: commitStyle.bg, color: commitStyle.text, border: `1px solid ${commitStyle.border}`, borderRadius: '8px', fontWeight: 700 }}>
                    {row.commitConsistency}%
                  </td>

                  {/* AST Complexity */}
                  <td style={{ textAlign: 'center', padding: '10px', background: astStyle.bg, color: astStyle.text, border: `1px solid ${astStyle.border}`, borderRadius: '8px', fontWeight: 700 }}>
                    {row.astComplexity}/100
                  </td>

                  {/* Claim Verification */}
                  <td style={{ textAlign: 'center', padding: '10px', background: claimStyle.bg, color: claimStyle.text, border: `1px solid ${claimStyle.border}`, borderRadius: '8px', fontWeight: 700 }}>
                    {row.claimVerification}%
                  </td>

                  {/* Reality Gap */}
                  <td style={{ textAlign: 'center', padding: '10px', background: gapStyle.bg, color: gapStyle.text, border: `1px solid ${gapStyle.border}`, borderRadius: '8px', fontWeight: 700 }}>
                    {row.realityGap}%
                  </td>

                  {/* Verdict Badge */}
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <span className={row.isFake ? "badge badge-danger" : "badge badge-success"}>
                      {row.isFake ? "Fake Flagged" : "Authentic"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
