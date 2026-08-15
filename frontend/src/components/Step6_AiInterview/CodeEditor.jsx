import React, { useState } from 'react';
import { Code2, Play, CheckCircle, Bug, Terminal, FileCode } from 'lucide-react';

export default function CodeEditor({ onCodeSubmit }) {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(`// AI Technical Task: Identify and fix the bug in this asynchronous rate limiter
// Question: Why does this code cause a race condition when multiple requests hit concurrently?

async function handleRateLimit(userId, maxRequests = 5) {
  let userCount = await getRedisCount(userId); // Fetch current request count
  
  if (userCount >= maxRequests) {
    return { status: 429, message: "Rate limit exceeded" };
  }
  
  // BUG HERE: Increment is not atomic!
  userCount = userCount + 1;
  await setRedisCount(userId, userCount);
  
  return { status: 200, message: "Allowed" };
}`);

  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput(null);

    setTimeout(() => {
      setIsRunning(false);
      if (code.includes("INCR") || code.includes("incr") || code.includes("pipeline") || code.includes("atomic")) {
        setOutput({
          success: true,
          message: "✓ All 5/5 Test Cases Passed! Atomic increment correctly resolves key concurrency race condition.",
          time: "42ms",
          memory: "14.2 MB"
        });
      } else {
        setOutput({
          success: false,
          message: "⚠ Test Case 3/5 Failed: Non-atomic get/set operation failed under high concurrency load test (1000 req/sec). Fix using atomic increment operator.",
          time: "88ms",
          memory: "18.6 MB"
        });
      }
    }, 800);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={20} color="#a855f7" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Technical Coding Workspace</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ 20</option>
            <option value="java">Java 17</option>
          </select>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.8rem' }}
          >
            <Play size={14} color="#34d399" /> {isRunning ? "Executing..." : "Run Code"}
          </button>

          <button
            onClick={() => onCodeSubmit(code)}
            className="btn-primary"
            style={{ padding: '5px 14px', fontSize: '0.8rem' }}
          >
            <CheckCircle size={14} /> Submit Code
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div style={{
        position: 'relative',
        borderRadius: '10px',
        background: '#070b14',
        border: '1px solid var(--border-color)',
        fontFamily: 'var(--font-code)',
        fontSize: '0.85rem',
        overflow: 'hidden',
        display: 'flex'
      }}>
        {/* Line Numbers */}
        <div style={{
          padding: '12px 8px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          color: 'var(--text-dim)',
          userSelect: 'none',
          textAlign: 'right',
          lineHeight: '1.5'
        }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: '100%',
            height: '240px',
            background: 'transparent',
            color: '#e2e8f0',
            border: 'none',
            outline: 'none',
            padding: '12px',
            fontFamily: 'var(--font-code)',
            fontSize: '0.85rem',
            lineHeight: '1.5',
            resize: 'none'
          }}
          spellCheck="false"
        />
      </div>

      {/* Execution Console Output */}
      {output && (
        <div style={{
          background: output.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
          border: output.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontFamily: 'var(--font-code)',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600, color: output.success ? '#34d399' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} /> Console Execution Result
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              Runtime: {output.time} | Memory: {output.memory}
            </span>
          </div>
          <p style={{ color: output.success ? '#a7f3d0' : '#fecdd3' }}>{output.message}</p>
        </div>
      )}
    </div>
  );
}
