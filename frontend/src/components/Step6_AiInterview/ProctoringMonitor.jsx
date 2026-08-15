import React, { useState, useEffect } from 'react';
import { Camera, ShieldAlert, AlertTriangle, Eye, Volume2, Lock, CheckCircle2, VideoOff } from 'lucide-react';

export default function ProctoringMonitor({ logs, setLogs, tabSwitches, setTabSwitches }) {
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);

  // Tab focus detection listener for anti-cheating
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [
          {
            id: Date.now(),
            time: timeStr,
            event: "WARNING: Focus Loss / Tab Switch Detected",
            severity: "high"
          },
          ...prev
        ]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [setLogs, setTabSwitches]);

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="#f43f5e" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Proctoring Sentinel</h3>
        </div>
        <span className={tabSwitches > 0 ? "badge badge-danger" : "badge badge-success"}>
          {tabSwitches > 0 ? `${tabSwitches} Flag(s)` : "Secure"}
        </span>
      </div>

      {/* Simulated Webcam Viewfinder */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        borderRadius: '12px',
        background: '#040711',
        border: tabSwitches > 0 ? '2px solid rgba(244, 63, 94, 0.6)' : '1px solid rgba(16, 185, 129, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {cameraActive ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(2,6,23,0.9) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Simulated Candidate Video Silhouette */}
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(15,23,42,0.9) 100%)',
              border: '2px dashed var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 3s infinite'
            }}>
              <Eye size={36} color="#06b6d4" />
            </div>

            {/* AI Bounding Box Overlay */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '25%',
              right: '25%',
              bottom: '20px',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              borderRadius: '8px',
              pointerEvents: 'none'
            }}>
              <span style={{ position: 'absolute', top: '-10px', left: '10px', background: '#090d16', padding: '0 4px', fontSize: '0.65rem', color: '#06b6d4' }}>
                Face Tracking: Locked (99.8%)
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <VideoOff size={32} />
            <span style={{ fontSize: '0.8rem' }}>Camera Feed Paused</span>
          </div>
        )}

        {/* Live Audio Visualizer Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          right: '12px',
          background: 'rgba(9, 13, 22, 0.75)',
          padding: '6px 12px',
          borderRadius: '8px',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Volume2 size={14} color="#34d399" /> Voice Stream
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '14px' }}>
            {[10, 18, 8, 22, 14, 19, 11, 24, 16, 9].map((h, i) => (
              <div key={i} style={{ width: '3px', height: `${h}px`, background: '#34d399', borderRadius: '2px' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Controls & Safeguards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          onClick={() => setCameraActive(!cameraActive)}
          className="btn-secondary"
          style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
        >
          <Camera size={14} /> {cameraActive ? 'Mute Video' : 'Enable Video'}
        </button>
        <button
          onClick={() => setMicActive(!micActive)}
          className="btn-secondary"
          style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
        >
          <Volume2 size={14} /> {micActive ? 'Mic Active' : 'Mic Off'}
        </button>
      </div>

      {/* Anti-Cheating Logs */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Real-time Anti-Cheat Audit</span>
          <Lock size={12} color="var(--accent-amber)" />
        </div>
        <div style={{
          maxHeight: '110px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          {logs.map((log) => (
            <div key={log.id} style={{
              fontSize: '0.7rem',
              padding: '4px 6px',
              borderRadius: '4px',
              background: log.severity === 'high' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: log.severity === 'high' ? '#f43f5e' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>{log.event}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
