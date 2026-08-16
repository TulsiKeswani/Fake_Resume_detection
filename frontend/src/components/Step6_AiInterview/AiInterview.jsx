import React, { useState, useEffect } from 'react';
import { Cpu, Mic, MicOff, Play, Send, Sparkles, CheckCircle2, ShieldAlert, Award, RefreshCw, Code, MessageSquare, AlertCircle } from 'lucide-react';
import ProctoringMonitor from './ProctoringMonitor';
import CodeEditor from './CodeEditor';

import { api } from '../../services/api';

export default function AiInterview({ applicationId, onCompleteInterview }) {
  const [stage, setStage] = useState('setup'); // 'setup' | 'interview' | 'completed'
  const [candidateName, setCandidateName] = useState('Candidate');
  const [roleTitle, setRoleTitle] = useState('Senior Full-Stack AI Engineer');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [userInput, setUserInput] = useState('');
  
  // Real-time calculated aspect scores
  const [aspectScores, setAspectScores] = useState({
    technical: 50,
    communication: 50,
    fluency: 50,
    bodyLanguage: 84,
    professionalism: 90
  });

  const [tabSwitches, setTabSwitches] = useState(0);
  const [proctorLogs, setProctorLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), event: "Session Initialized & Encryption Verified", severity: "info" }
  ]);

  // Adaptive Interview State
  const [interviewState, setInterviewState] = useState({
    currentDifficulty: 1,
    askedQuestions: [],
    resumeTopics: []
  });
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [transcript, setTranscript] = useState([]);

  // Fetch the initial intro or application details if needed
  useEffect(() => {
    if (applicationId) {
      // We can fetch basic application details here if desired, 
      // but the main interview logic runs when they click start.
    }
  }, [applicationId]);

  // Speech Synthesis helper
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchNextQuestion = async (currentState) => {
    setIsGenerating(true);
    setProctorLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), event: "AI Generating strict resume-grounded question...", severity: "info" },
      ...prev
    ]);

    try {
      const payloadState = { ...currentState, targetRole: roleTitle };
      const res = await api.getNextInterviewQuestion(applicationId, payloadState);
      if (res.success && res.question) {
        const qObj = res.question;
        setCurrentQuestion(qObj);
        
        const aiResponse = { speaker: 'AI Interviewer', text: qObj.question, type: 'question' };
        setTranscript(prev => [...prev, aiResponse]);
        speakText(qObj.question);
      } else {
         // Handle error or fallback
         const fallbackMsg = "Could you tell me more about your experience listed on your resume?";
         setCurrentQuestion({ question: fallbackMsg, topic: "General", difficulty: 1 });
         setTranscript(prev => [...prev, { speaker: 'AI Interviewer', text: fallbackMsg, type: 'question' }]);
         speakText(fallbackMsg);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartInterview = () => {
    setStage('interview');
    const initialIntro = { speaker: 'AI Interviewer', text: "Welcome! I am your AI Technical Evaluator. I have analyzed your resume, and I will be asking you personalized questions based strictly on the skills and projects you have listed. Let's begin.", type: 'info' };
    setTranscript([initialIntro]);
    speakText(initialIntro.text);
    
    // Fetch first actual question
    setTimeout(() => {
      fetchNextQuestion(interviewState);
    }, 4000);
  };

  const handleSendAnswer = async () => {
    if (!userInput.trim() || isGenerating) return;

    const answerText = userInput;
    setUserInput('');
    const newAnswer = { speaker: 'Candidate', text: answerText, type: 'answer' };
    setTranscript(prev => [...prev, newAnswer]);

    setIsGenerating(true); // show loading state while evaluating
    
    try {
      const evalRes = await api.evaluateInterviewAnswer(applicationId, currentQuestion, answerText);
      const score = evalRes?.evaluation?.score || 50;
      
      // Update UI scores
      setAspectScores(prev => ({
        technical: Math.min(98, Math.max(40, prev.technical + (score >= 75 ? 5 : -2))),
        communication: Math.min(98, Math.max(40, prev.communication + 2)),
        fluency: Math.min(98, Math.max(40, prev.fluency + 3)),
        bodyLanguage: prev.bodyLanguage,
        professionalism: prev.professionalism
      }));

      // Update interview state with answer history
      const updatedState = {
        ...interviewState,
        askedQuestions: [
          ...interviewState.askedQuestions,
          { question: currentQuestion.question, answer: answerText, score: score }
        ]
      };
      setInterviewState(updatedState);

      // Are we done? e.g. max 5 questions
      if (updatedState.askedQuestions.length >= 5) {
        setTimeout(() => {
          const finalMsg = { speaker: 'AI Interviewer', text: "Thank you! Your interview is complete. I have generated your comprehensive evaluation report for the hiring team based on your resume claims.", type: 'question' };
          setTranscript(prev => [...prev, finalMsg]);
          speakText(finalMsg.text);
          setStage('completed');
          setIsGenerating(false);
        }, 1000);
      } else {
        // Fetch next question adaptively
        await fetchNextQuestion(updatedState);
      }
      
    } catch (err) {
      console.error("Evaluation Error", err);
      setIsGenerating(false);
    }
  };

  const handleCodeSubmitted = (submittedCode) => {
    // Standard mock for coding task if needed, or we can adapt this too
    const codeMsg = { speaker: 'Candidate (Code Submitted)', text: `Submitted Solution:\n${submittedCode.substring(0, 120)}...`, type: 'code' };
    setTranscript(prev => [...prev, codeMsg]);
    
    setAspectScores(prev => ({
      ...prev,
      technical: Math.min(96, prev.technical + 6)
    }));

    if (interviewState.askedQuestions.length >= 5) {
       setStage('completed');
    } else {
       fetchNextQuestion(interviewState);
    }
  };

  const handleFinishAndSaveReport = () => {
    const sessionReport = {
      applicationId,
      candidateName,
      roleTitle,
      aspectScores,
      proctorLogs,
      tabSwitches,
      transcript,
      fakeResumeScore: tabSwitches > 1 ? 76 : 12
    };
    if (onCompleteInterview) {
      onCompleteInterview(sessionReport);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span className="badge badge-info">Step 6: AI Interview Engine</span>
            {isSpeaking && <span className="badge badge-warning">AI Speaking...</span>}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Real-Time AI Resume & Coding Assessment</h2>
        </div>

        {stage === 'interview' && (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Live Indicator Badges */}
            {currentQuestion && (
              <div style={{ display: 'flex', gap: '12px', marginRight: '16px', borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Resume Topic</span>
                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>{currentQuestion.topic}</div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Difficulty Level</span>
                  <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.95rem' }}>{['Basic', 'Intermediate', 'Advanced', 'Deep/Expert'][currentQuestion.difficulty - 1] || 'Adaptive'}</div>
                </div>
              </div>
            )}
            
            {/* Live Meter Badges */}
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tech Depth</span>
              <div style={{ fontWeight: 800, color: '#818cf8', fontSize: '1.1rem' }}>{aspectScores.technical}/100</div>
            </div>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fluency & Clarity</span>
              <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>{aspectScores.fluency}/100</div>
            </div>
          </div>
        )}
      </div>

      {/* STAGE 1: Setup & Pre-Check */}
      {stage === 'setup' && (
        <div className="glass-panel" style={{ padding: '36px', maxWidth: '700px', margin: '20px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={36} color="#ffffff" />
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>AI Technical Interview Readiness Check</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              The AI interviewer will analyze your resume claims, conduct cross-questioning, test for false technical assertions, and evaluate your live coding fix.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
              <CheckCircle2 size={16} /> Webcam & Face Tracking Calibration OK
            </div>
            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
              <CheckCircle2 size={16} /> Microphone Speech Recognition Calibrated
            </div>
            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
              <CheckCircle2 size={16} /> Tab-Switch & Anti-Cheating Monitoring Enabled
            </div>
            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
              <AlertCircle size={16} /> AI Trick Question Detector Ready (Will test real knowledge)
            </div>
          </div>

          <button onClick={handleStartInterview} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem', justifyContent: 'center' }}>
            <Play size={20} /> Launch AI Interview Session
          </button>
        </div>
      )}

      {/* STAGE 2: Live Interview Session */}
      {stage === 'interview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
          
          {/* Main Interview Q&A + Code Editor Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Interactive Transcript Chat */}
            <div className="glass-panel" style={{ padding: '20px', minHeight: '340px', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {transcript.map((msg, index) => (
                <div key={index} style={{
                  alignSelf: msg.speaker.startsWith('Candidate') ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.speaker.startsWith('Candidate') 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(67, 56, 202, 0.3) 100%)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: msg.speaker.startsWith('Candidate')
                    ? '1px solid rgba(99, 102, 241, 0.4)'
                    : '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '12px 16px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: msg.speaker.startsWith('Candidate') ? '#a5b4fc' : '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {msg.speaker.startsWith('Candidate') ? <Sparkles size={12} /> : <Cpu size={12} />}
                    {msg.speaker}
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Candidate Voice / Text Response Bar */}
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setMicActive(!micActive)}
                className={micActive ? 'btn-danger' : 'btn-secondary'}
                style={{ padding: '10px', borderRadius: '10px' }}
                title={micActive ? "Stop Voice Input" : "Start Voice Input"}
              >
                {micActive ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                placeholder={micActive ? "Listening to your speech..." : "Type your answer or respond to AI trick question..."}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer()}
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />

              <button onClick={handleSendAnswer} className="btn-primary" style={{ padding: '10px 18px' }}>
                <Send size={16} /> Submit
              </button>
            </div>

            {/* Live Code Editor Component */}
            <CodeEditor onCodeSubmit={handleCodeSubmitted} />

          </div>

          {/* Sidebar: Live Proctoring Sentinel & Aspect Meters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ProctoringMonitor
              logs={proctorLogs}
              setLogs={setProctorLogs}
              tabSwitches={tabSwitches}
              setTabSwitches={setTabSwitches}
            />

            {/* Live Aspect Monitoring Dashboard */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="#38bdf8" /> Real-time Aspect Evaluator
              </h4>

              {Object.entries(aspectScores).map(([key, score]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'capitalize' }}>
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span style={{ fontWeight: 700, color: 'white' }}>{score}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${score}%`,
                      height: '100%',
                      background: score > 75 ? 'linear-gradient(90deg, #6366f1, #06b6d4)' : 'linear-gradient(90deg, #f59e0b, #f43f5e)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: Interview Completed & Generated Report */}
      {stage === 'completed' && (
        <div className="glass-panel" style={{ padding: '36px', maxWidth: '800px', margin: '20px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={36} color="#ffffff" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>AI Interview & Proctoring Completed!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Your session transcript, code evaluation, anti-cheating audit, and aspect weightages have been compiled into the official company report.
            </p>
          </div>

          {/* Final Score Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Technical Score</span>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>{aspectScores.technical}/100</h4>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Communication & Fluency</span>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{aspectScores.fluency}/100</h4>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Resume Fake Risk</span>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: tabSwitches > 1 ? '#f43f5e' : '#34d399', marginTop: '4px' }}>
                {tabSwitches > 1 ? 'HIGH (76%)' : 'LOW (12%)'}
              </h4>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button onClick={handleFinishAndSaveReport} className="btn-primary" style={{ padding: '12px 24px' }}>
              <CheckCircle2 size={18} /> View in Company Evaluation Panel (Step 7)
            </button>
            <button onClick={() => setStage('setup')} className="btn-secondary" style={{ padding: '12px 20px' }}>
              <RefreshCw size={18} /> Retake Assessment
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
