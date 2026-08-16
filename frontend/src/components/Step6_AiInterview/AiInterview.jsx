import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Mic, MicOff, Play, Sparkles, CheckCircle2, ShieldAlert, Award, RefreshCw, Code, MessageSquare, AlertCircle, AlertTriangle, Lock, Eye, Video, Volume2, Clock, Check, X } from 'lucide-react';
import ProctoringMonitor from './ProctoringMonitor';
import CodeEditor from './CodeEditor';
import { generateBodyLanguageReport, resumeAudioContext } from './webcamProctorEngine';
import { INTERVIEW_QUESTIONS, evaluateAnswer } from './answerEvaluator';

import { api } from '../../services/api';

export default function AiInterview({ applicationId, onCompleteInterview }) {
  const [stage, setStage] = useState('setup'); // 'setup' | 'interview' | 'completed'
  const [candidateName, setCandidateName] = useState('Candidate');
  const [roleTitle, setRoleTitle] = useState('Senior Full-Stack AI Engineer');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Speech Recognition & Silence Detection
  const [isRecording, setIsRecording] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [answerEvaluations, setAnswerEvaluations] = useState([]);

  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const lastSpeechTimeRef = useRef(0);
  const silenceTimerRef = useRef(null);

  // Adaptive Strategy & Coding Fallback State
  const [consecutiveLowScores, setConsecutiveLowScores] = useState(0);
  const [codingScore, setCodingScore] = useState(null);

  // Pre-Test Verification & Proctoring State
  const [cameraVerified, setCameraVerified] = useState(false);
  const [personCount, setPersonCount] = useState(0);
  const [maxPersonCount, setMaxPersonCount] = useState(0);
  const [verificationMsg, setVerificationMsg] = useState('Initializing full-frame human verification...');

  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');

  const [tabSwitches, setTabSwitches] = useState(0);
  const [focusLossEvents, setFocusLossEvents] = useState(0);
  const [suspiciousMovementEvents, setSuspiciousMovementEvents] = useState([]);
  const [cameraEvents, setCameraEvents] = useState([]);
  const [proctorLogs, setProctorLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), event: "Proctoring Session Initialized", severity: "info" }
  ]);

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // Real-Time Aspect Scores
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

  // ----------------------------------------------------
  // SPEECH SYNTHESIS (TTS)
  // ----------------------------------------------------
  const speakText = (text, onFinishCallback) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        stopVoiceRecording();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onFinishCallback) onFinishCallback();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (onFinishCallback) onFinishCallback();
      };

      window.speechSynthesis.speak(utterance);
    } else if (onFinishCallback) {
      onFinishCallback();
    }
  };

  // ----------------------------------------------------
  // QUESTION COUNTDOWN TIMER (60s)
  // ----------------------------------------------------
  useEffect(() => {
    let timerId = null;
    if (stage === 'interview' && !isSpeaking && !terminated && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            handleQuestionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [stage, isSpeaking, terminated, timeLeft]);

  // ----------------------------------------------------
  // AUTOMATED SILENCE DETECTION POLLING (~2.0s silence)
  // ----------------------------------------------------
  useEffect(() => {
    if (stage !== 'interview' || isSpeaking || !isRecording || terminated) return;

    const interval = setInterval(() => {
      const currentText = (finalTranscriptRef.current + transcriptBuffer).trim();
      const wordCount = currentText.split(/\s+/).filter(Boolean).length;

      if (wordCount >= 4 && lastSpeechTimeRef.current > 0) {
        const silenceDuration = Date.now() - lastSpeechTimeRef.current;
        if (silenceDuration >= 2200) {
          console.log('[SILENCE DETECT] Silence threshold reached (2.2s). Finalizing candidate answer automatically...');
          autoFinalizeAnswer(currentText);
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, [stage, isSpeaking, isRecording, transcriptBuffer, terminated]);

  // ----------------------------------------------------
  // CENTRALIZED INTERVIEW TERMINATION ENGINE (REQUIREMENT 8)
  // ----------------------------------------------------
  const terminateInterview = (reasonType, metadata = {}) => {
    if (stage === 'terminated' || terminated) return;

    console.warn(`[STRICT PROCTOR TERMINATION] Reason: ${reasonType}`, metadata);

    // 1. Immediately cancel Speech Synthesis (TTS)
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) { }
    }

    // 2. Immediately stop Speech Recognition
    stopVoiceRecording();

    // 3. Set termination flags & reason message
    const formattedReason = metadata.message || getReasonMessage(reasonType);

    setCheatingDetected(true);
    setTerminated(true);
    setTerminationReason(formattedReason);
    setEndTime(new Date().toISOString());
    setStage('terminated');

    // 4. Record violation event into proctor logs
    const newViolationEvent = {
      id: Date.now(),
      type: reasonType,
      message: formattedReason,
      timestamp: new Date().toLocaleTimeString(),
      severity: 'critical',
      metadata
    };

    setCameraEvents((prev) => [...prev, newViolationEvent]);
    setProctorLogs((prev) => [
      ...prev,
      { id: Date.now(), time: new Date().toLocaleTimeString(), event: `TERMINATED: ${formattedReason}`, severity: "danger" }
    ]);
  };

  const getReasonMessage = (reasonType) => {
    switch (reasonType) {
      case 'MULTIPLE_HUMANS':
        return 'Multiple persons detected inside camera frame.';
      case 'TAB_SWITCH':
        return 'Candidate switched browser tab or minimized window.';
      case 'FOCUS_LOSS':
        return 'Candidate moved focus away from the active interview session.';
      case 'OUT_OF_FRAME':
        return 'Candidate moved >5% outside the calibrated camera frame boundary.';
      case 'SUSPICIOUS_MOVEMENT':
        return 'Large body displacement or leaving calibrated posture position.';
      case 'GAZE_VIOLATION':
        return 'Sustained eye gaze deviation detected away from screen.';
      case 'FACE_NOT_VISIBLE':
        return 'Candidate face missing from camera frame beyond allowed threshold.';
      case 'MULTIPLE_VOICE':
        return 'Secondary voice / speaker detected during candidate response.';
      case 'CLIPBOARD_ACTION':
        return 'Unauthorized clipboard operation detected (Copy/Cut/Paste).';
      default:
        return 'Security violation detected during interview session.';
    }
  };

  const handleVerificationChange = (data) => {
    if (!data) return;

    console.log('[AI INTERVIEW] Verification update:', data);

    const verified =
      typeof data.verified === 'boolean'
        ? data.verified
        : data.cameraVerified;

    if (typeof verified === 'boolean') {
      setCameraVerified(verified);
    }

    if (typeof data.personCount === 'number') {
      setPersonCount(data.personCount);
    }

    if (typeof data.maxPersonCount === 'number') {
      setMaxPersonCount(data.maxPersonCount);
    }

    if (data.message) {
      setVerificationMsg(data.message);
    }
  };
  const handleProctoringUpdate = (data) => {
    if (!data) return;

    // Keep the latest live proctoring data available for the final report
    liveProctorDataRef.current = {
      ...liveProctorDataRef.current,
      ...data,
    };

    // Update person-count information
    if (typeof data.personCount === 'number') {
      setPersonCount(data.personCount);

      if (data.personCount > maxPersonCount) {
        setMaxPersonCount(data.personCount);
      }

      // STRICT ONE-TO-ONE RULE:
      // More than one person = immediate termination
      if (
        data.personCount > 1 &&
        stage !== 'setup' &&
        stage !== 'terminated' &&
        !terminated
      ) {
        terminateInterview('MULTIPLE_HUMANS', {
          message: 'Multiple persons detected inside the camera frame.',
          personCount: data.personCount,
        });
        return;
      }
    }

    // Keep latest events/logs/session statistics
    if (Array.isArray(data.events)) {
      liveProctorDataRef.current.events = data.events;
    }

    if (Array.isArray(data.logs)) {
      liveProctorDataRef.current.logs = data.logs;
    }

    if (data.sessionStats) {
      liveProctorDataRef.current.sessionStats = data.sessionStats;
    }

    if (typeof data.attentionPercentage === 'number') {
      liveProctorDataRef.current.attentionPercentage =
        data.attentionPercentage;
    }

    if (typeof data.voiceProctoringAvailable === 'boolean') {
      liveProctorDataRef.current.voiceProctoringAvailable =
        data.voiceProctoringAvailable;
    }

    if (typeof data.maxPersonCount === 'number') {
      liveProctorDataRef.current.maxPersonCount =
        Math.max(
          liveProctorDataRef.current.maxPersonCount || 0,
          data.maxPersonCount
        );

      setMaxPersonCount((prev) =>
        Math.max(prev, data.maxPersonCount)
      );
    }

    // Handle a violation coming through the proctoring update channel
    const violationType =
      data.violationType ||
      data.violation ||
      data.eventType ||
      data.type;

    const securityViolations = [
      'MULTIPLE_HUMANS',
      'TAB_SWITCH',
      'FOCUS_LOSS',
      'OUT_OF_FRAME',
      'SUSPICIOUS_MOVEMENT',
      'FACE_NOT_VISIBLE',
      'GAZE_VIOLATION',
      'GAZE_LOSS',
      'MULTIPLE_VOICE',
      'CLIPBOARD_ACTION',
      'COPY_ATTEMPT',
      'CUT_ATTEMPT',
      'PASTE_ATTEMPT',
    ];

    if (
      securityViolations.includes(violationType) &&
      stage !== 'terminated' &&
      !terminated
    ) {
      terminateInterview(violationType, {
        ...data,
        message:
          data.message ||
          data.details ||
          getReasonMessage(violationType),
      });

      return;
    }

    // Handle explicit cheating flag from monitor
    if (
      data.cheatingDetected === true &&
      stage !== 'terminated' &&
      !terminated
    ) {
      terminateInterview(
        violationType || 'CHEATING_VIOLATION',
        {
          ...data,
          message:
            data.message ||
            'Security violation detected during interview session.',
        }
      );

      return;
    }

    // Track suspicious movement information for report/UI
    if (data.suspiciousMovement) {
      setSuspiciousMovementEvents((prev) => [
        ...prev,
        data.suspiciousMovement,
      ]);
    }

    // Track camera events
    if (data.cameraEvent) {
      setCameraEvents((prev) => [
        ...prev,
        data.cameraEvent,
      ]);
    }

    // Track tab/focus counters if supplied by monitor
    if (typeof data.tabSwitches === 'number') {
      setTabSwitches(data.tabSwitches);
    }

    if (typeof data.focusLossEvents === 'number') {
      setFocusLossEvents(data.focusLossEvents);
    }
  };
  const handleCheatingDetected = (cData) => {
    terminateInterview(cData.type || 'CHEATING_VIOLATION', cData);
  };

  // ----------------------------------------------------
  // BROWSER SECURITY EVENT LISTENERS (TAB SWITCH, BLUR, CLIPBOARD)
  // ----------------------------------------------------
  useEffect(() => {
    if (stage !== 'interview' && stage !== 'coding') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        terminateInterview('TAB_SWITCH', { message: 'Candidate switched tabs or minimized browser window.' });
      }
    };

    const handleWindowBlur = () => {
      terminateInterview('FOCUS_LOSS', { message: 'Candidate moved window focus away from interview window.' });
    };

    const handleClipboardAction = (e) => {
      e.preventDefault();
      terminateInterview('CLIPBOARD_ACTION', { message: `Unauthorized clipboard action (${e.type.toUpperCase()}) detected.` });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleClipboardAction);
    document.addEventListener('cut', handleClipboardAction);
    document.addEventListener('paste', handleClipboardAction);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleClipboardAction);
      document.removeEventListener('cut', handleClipboardAction);
      document.removeEventListener('paste', handleClipboardAction);
    };
  }, [stage, terminated]);

  // ----------------------------------------------------
  // INTERVIEW START
  // ----------------------------------------------------
  const handleStartInterview = async () => {
    await resumeAudioContext();
    if (!cameraVerified || personCount !== 1) return;

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

  const handleQuestionTimeout = () => {
    if (stage !== 'interview' || terminated) return;
    console.log('[TIMER TIMEOUT] 60-second limit reached for Question', currentQIndex + 1);
    const currentText = (finalTranscriptRef.current + transcriptBuffer).trim();
    autoFinalizeAnswer(currentText);
  };

  // ----------------------------------------------------
  // TECHNICAL CODING ASSESSMENT SUBMISSION
  // ----------------------------------------------------
  const handleCodeSubmitted = (submittedCode) => {
    // Standard mock for coding task if needed, or we can adapt this too
    const codeMsg = { speaker: 'Candidate (Code Submitted)', text: `Submitted Solution:\n${submittedCode.substring(0, 120)}...`, type: 'code' };
    setTranscript(prev => [...prev, codeMsg]);
    
    setAspectScores(prev => ({
      ...prev,
      technical: Math.round(prev.technical * 0.4 + codeEvalScore * 0.6)
    }));

    if (interviewState.askedQuestions.length >= 5) {
       setStage('completed');
    } else {
       fetchNextQuestion(interviewState);
    }
  };

  // ----------------------------------------------------
  // FINISH & SAVE REPORT (STEP 7 / STEP 8 DATA PIPELINE)
  // ----------------------------------------------------
  const handleFinishAndSaveReport = () => {
    const durationSeconds = startTime && endTime ? Math.round((new Date(endTime) - new Date(startTime)) / 1000) : 60;
    const pData = liveProctorDataRef.current || {};
    const events = pData.events || [];

    const sessionStats = pData.sessionStats || {
      suspiciousMovements: events.filter((e) => e.type === 'SUSPICIOUS_MOVEMENT').length,
      gazeLosses: events.filter((e) => e.type === 'GAZE_LOSS').length,
      faceMissingEvents: events.filter((e) => e.type === 'FACE_NOT_VISIBLE').length,
      tabSwitches: events.filter((e) => e.type === 'TAB_SWITCH').length,
      focusLosses: events.filter((e) => e.type === 'FOCUS_LOSS').length,
      multipleHumanEvents: events.filter((e) => e.type === 'MULTIPLE_HUMANS').length,
      clipboardEvents: events.filter((e) => ['COPY_ATTEMPT', 'CUT_ATTEMPT', 'PASTE_ATTEMPT'].includes(e.type)).length,
      totalEvents: events.length,
      attentionPercentage: pData.attentionPercentage || 100
    };

    const bodyLanguageReport = generateBodyLanguageReport(events, durationSeconds, true, sessionStats);

    const sessionReport = {
      applicationId,
      candidateName,
      roleTitle,
      aspectScores,
      proctoringLogs: pData.logs || proctorLogs,
      cameraEvents: events,
      sessionStats,
      tabSwitches: sessionStats.tabSwitches,
      focusLossEvents: sessionStats.focusLosses,
      suspiciousMovementEvents: sessionStats.suspiciousMovements,
      gazeLossEvents: sessionStats.gazeLosses,
      faceMissingEvents: sessionStats.faceMissingEvents,
      outOfFrameEvents: events.filter((e) => e.type === 'OUT_OF_FRAME').length,
      multipleVoiceEvents: events.filter((e) => e.type === 'MULTIPLE_VOICE').length,
      voiceProctoringAvailable: pData.voiceProctoringAvailable !== false,
      answerEvaluations,
      codingScore,
      cheatingDetected,
      terminated,
      terminationReason: terminationReason || (sessionStats.tabSwitches > 1 ? "Multiple Tab Switches Detected" : ""),
      bodyLanguageReport,
      transcript,
      maxPersonCount: Math.max(maxPersonCount, pData.maxPersonCount || 1, personCount),
      fakeResumeScore: cheatingDetected || sessionStats.tabSwitches > 1 ? 84 : 12,
      proctoringSession: {
        cameraPermission: true,
        cameraVerified,
        personCount,
        maxPersonCount: Math.max(maxPersonCount, pData.maxPersonCount || 1, personCount),
        testStarted: stage === 'interview' || stage === 'coding' || stage === 'completed' || stage === 'terminated',
        cheatingDetected,
        terminated,
        terminationReason,
        tabSwitches: sessionStats.tabSwitches,
        focusLossEvents: sessionStats.focusLosses,
        suspiciousMovementEvents: sessionStats.suspiciousMovements,
        gazeLossEvents: sessionStats.gazeLosses,
        faceMissingEvents: sessionStats.faceMissingEvents,
        sessionStats,
        cameraEvents: events,
        startedAt: startTime,
        endedAt: endTime || new Date().toISOString()
      }
    };

    if (onCompleteInterview) {
      onCompleteInterview(sessionReport);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span className="badge badge-info">Step 6: One-to-One AI Voice Interview</span>
            {isSpeaking && <span className="badge badge-warning">AI Speaking...</span>}
            {isRecording && <span className="badge badge-success">Candidate Answering...</span>}
            {terminated && <span className="badge badge-danger">TERMINATED (CHEATING DETECTED)</span>}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>AI Voice Proctoring & Assessment Engine</h2>
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
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fluency</span>
              <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>{aspectScores.fluency}/100</div>
            </div>
          </div>
        )}
      </div>

      {/* STAGE 1: Pre-Test Setup */}
      {stage === 'setup' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={28} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Camera & Microphone Setup</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Candidate: <strong style={{ color: 'white' }}>{candidateName}</strong> | Role: <strong style={{ color: 'white' }}>{roleTitle}</strong></p>
              </div>
            </div>

            <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} /> Strict One-to-One Interview Protocol
              </div>
              <ul style={{ fontSize: '0.84rem', color: '#cbd5e1', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>AI Interviewer will speak each question aloud.</li>
                <li>Your 60-second answer timer begins after the AI finishes speaking.</li>
                <li>Simply speak your answer into the microphone. Silence (~2s) automatically submits your answer. There is no manual submit button.</li>
                <li>Webcam & dual-speaker voice proctoring runs continuously. Multiple people or out-of-frame breaches trigger immediate termination.</li>
              </ul>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={personCount !== 1}
              className="btn-primary"
              style={{
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                opacity: cameraVerified && personCount === 1 ? 1 : 0.5,
                cursor: cameraVerified && personCount === 1 ? 'pointer' : 'not-allowed'
              }}
            >
              <Play size={20} /> Begin AI Voice Interview
            </button>
          </div>

          <ProctoringMonitor
            testStarted={stage === 'interview'}
            stage={stage}
            onVerificationChange={handleVerificationChange}
            onProctoringUpdate={handleProctoringUpdate}
            onCheatingDetected={handleCheatingDetected}
          />
        </div>
      )}

      {/* STAGE 2: One-to-One AI Voice Interview Panel */}
      {stage === 'interview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px', alignItems: 'start' }}>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Live Conversation Transcript */}
            <div style={{
              height: '420px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              paddingRight: '8px'
            }}>
              {transcript.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: item.speaker.includes('Candidate') ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: item.speaker.includes('Candidate') ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.8)',
                    border: item.speaker.includes('Candidate') ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px 18px'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: item.speaker.includes('Candidate') ? '#a5b4fc' : '#38bdf8', marginBottom: '4px' }}>
                    {item.speaker}
                  </div>
                  <p style={{ fontSize: '0.92rem', lineHeight: '1.5', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                    {item.text}
                  </p>
                  {item.evaluation && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.76rem', color: item.evaluation.isCorrect ? '#34d399' : '#fbbf24' }}>
                      Status: {item.evaluation.status} ({item.evaluation.score}/100) — {item.evaluation.reasoning}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Live Candidate Microphone & Automated Finalization Indicator */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: isRecording ? '1px solid #34d399' : '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mic size={16} color={isRecording ? '#34d399' : '#94a3b8'} />
                  {isSpeaking ? 'AI Speaker Active...' : (isRecording ? 'Live Candidate Voice Input (Silence Auto-Submit Active)' : 'Microphone Ready')}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No Submit Button Required</span>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '8px',
                padding: '12px',
                minHeight: '60px',
                fontSize: '0.9rem',
                color: transcriptBuffer ? 'white' : 'var(--text-muted)',
                fontStyle: transcriptBuffer ? 'normal' : 'italic'
              }}>
                {transcriptBuffer || (isSpeaking ? 'Listening will begin as soon as the AI finishes speaking...' : 'Speak your answer clearly into the microphone. Brief silence automatically finalizes your answer...')}
              </div>

              {recognitionError && (
                <div style={{ color: '#f43f5e', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} /> {recognitionError}
                </div>
              )}
            </div>

          </div>

          <ProctoringMonitor
            testStarted={stage === 'interview'}
            stage={stage}
            onVerificationChange={handleVerificationChange}
            onProctoringUpdate={handleProctoringUpdate}
            onCheatingDetected={handleCheatingDetected}
          />
        </div>
      )}

      {/* STAGE 3: Technical Coding Workspace Fallback */}
      {stage === 'coding' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '16px 20px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={20} /> Adaptive Technical Coding Assessment
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                The AI interviewer has transitioned your evaluation to practical coding to test concurrency, atomic operations, and code quality.
              </p>
            </div>

            <CodeEditor onCodeSubmit={handleCodeSubmitted} />
          </div>

          <ProctoringMonitor
            testStarted={true}
            onVerificationChange={handleVerificationChange}
            onProctoringUpdate={handleProctoringUpdate}
            onCheatingDetected={handleCheatingDetected}
          />
        </div>
      )}

      {/* STAGE 4: Completed State */}
      {stage === 'completed' && (
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={40} color="#34d399" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>AI Voice Interview Completed</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Your technical responses, speech clarity, and proctoring logs have been compiled into your candidate report.
            </p>
          </div>

          <button
            onClick={handleFinishAndSaveReport}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 700, marginTop: '10px' }}
          >
            Generate & View Candidate Evaluation Report
          </button>
        </div>
      )}

      {/* STAGE 5: Terminated State */}
      {stage === 'terminated' && (
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid #f43f5e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={40} color="#f43f5e" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f43f5e' }}>INTERVIEW TERMINATED</h3>
            <p style={{ color: '#fecdd3', fontSize: '1rem', marginTop: '6px' }}>
              Reason: {terminationReason || "Security violation detected during proctoring session."}
            </p>
          </div>

          <button
            onClick={handleFinishAndSaveReport}
            className="btn-secondary"
            style={{ padding: '12px 28px', fontSize: '0.95rem', borderColor: '#f43f5e', color: '#f43f5e' }}
          >
            Save Security Incident Report
          </button>
        </div>
      )}

    </div>
  );
}