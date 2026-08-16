import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Video, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import {
  loadPersonDetectionModel,
  getModelStatus,
  startWebcamStream,
  stopWebcamStream,
  analyzeFrame,
  initAudioAnalyzer,
  detectMultipleVoices
} from './webcamProctorEngine';

export default function ProctoringMonitor({
  testStarted = false,
  stage = 'setup', // 'setup' | 'interview' | 'completed' | 'terminated'
  onVerificationChange,
  onCheatingDetected,
  onProctoringUpdate
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraPermission, setCameraPermission] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const [modelStatus, setModelStatus] = useState('UNLOADED'); // 'UNLOADED' | 'LOADING' | 'LOADED' | 'ERROR'
  const [showDebug, setShowDebug] = useState(false);

  const [personCount, setPersonCount] = useState(0);
  const [faceCount, setFaceCount] = useState(0);
  const [maxPersonCount, setMaxPersonCount] = useState(0);
  const [detections, setDetections] = useState([]);
  const [cameraVerified, setCameraVerified] = useState(false);
  const [verificationStatusMsg, setVerificationStatusMsg] = useState('Initializing COCO-SSD full-frame person detector...');

  // Proctoring Metrics UI state
  const [cameraEvents, setCameraEvents] = useState([]);
  const [gazeState, setGazeState] = useState('ATTENTIVE');
  const [attentionPercentage, setAttentionPercentage] = useState(100);
  const [normalizedMovement, setNormalizedMovement] = useState(0);
  const [movementCategory, setMovementCategory] = useState('SMALL');

  const [voiceMonitorState, setVoiceMonitorState] = useState({
    candidateVoiceDetected: false,
    secondVoiceDetected: false,
    confidence: 0,
    multipleVoicesDetected: false,
    details: 'Initializing voice analyzer...'
  });

  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), event: "Full-Frame Proctoring Sentinel Initialized", severity: "info" }
  ]);

  // SINGLE CENTRAL PERSISTENT EVENT STORE (NEVER OVERWRITTEN)
  const cameraEventsRef = useRef([]);

  const recordProctorEvent = (event) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newEvent = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `event_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      time: timeStr,
      ...event
    };

    cameraEventsRef.current.push(newEvent);
    console.log(`[PROCTOR EVENT] ${newEvent.type}`, newEvent);
    setCameraEvents([...cameraEventsRef.current]);

    setLogs(prev => [
      { id: Date.now(), time: timeStr, event: `[${newEvent.type}] ${newEvent.details || newEvent.reason || ''}`, severity: newEvent.severity === 'CRITICAL' ? 'high' : 'medium' },
      ...prev
    ]);

    return newEvent;
  };

  // Ref state tracking for interval loop & timers
  const stateRef = useRef({
    testStarted,
    stage,
    lastFrameState: null,
    multiPersonStreak: 0,
    cheatingFired: false,
    movementStartTime: null,
    movementLoggedForSpell: false,
    faceMissingStartTime: null,
    faceMissingLoggedForSpell: false,
    gazeAwayStartTime: null,
    gazeAwayDirection: null,
    gazeAwayLoggedForSpell: false,
    lastTabSwitchTime: 0,
    lastFocusLossTime: 0,
    maxPersonCountObserved: 0,
    totalTrackedTime: 0.1,
    timeLookingAway: 0
  });

  useEffect(() => {
    stateRef.current.testStarted = testStarted;
    stateRef.current.stage = stage;
  }, [testStarted, stage]);

  // 1. Initialize Model & Camera Stream
  useEffect(() => {
    let isMounted = true;

    async function initCameraAndModel() {
      console.log('[CAMERA] Requesting webcam permission...');
      setModelStatus('LOADING');

      const modelPromise = loadPersonDetectionModel();

      try {
        const stream = await startWebcamStream();
        if (!isMounted) {
          stopWebcamStream(stream);
          return;
        }

        console.log('[CAMERA] Stream received successfully.');
        streamRef.current = stream;

        setCameraPermission(true);
        setPermissionError('');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = async () => {
            if (!videoRef.current) return;
            console.log('[CAMERA] Metadata loaded. Resolution:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            setVideoReady(true);
            try {
              await videoRef.current.play();
            } catch (playErr) {
              console.warn('[CAMERA] Play warning:', playErr);
            }
          };

          if (videoRef.current.readyState >= 1) {
            setVideoReady(true);
            videoRef.current.play().catch(e => console.warn('[CAMERA] Auto-play warning:', e));
          }
          await initAudioAnalyzer(stream);
        }

        const modelResult = await modelPromise;
        if (!isMounted) return;

        if (modelResult) {
          setModelStatus('LOADED');
        } else {
          setModelStatus('ERROR');
          setVerificationStatusMsg('Person detector unavailable — please check web worker connection or retry.');
        }

      } catch (err) {
        if (!isMounted) return;
        console.error('[CAMERA ERROR]', err);
        setCameraPermission(false);
        setModelStatus('ERROR');

        let errorMsg = err.message || 'Could not access webcam.';
        if (err.name === 'NotAllowedError') {
          errorMsg = 'Camera permission denied. Please allow camera access in browser settings.';
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'No camera device found on this system.';
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'Camera is currently in use by another application.';
        } else if (err.name === 'OverconstrainedError') {
          errorMsg = 'Camera does not support requested video resolution.';
        }
        setPermissionError(errorMsg);
        setVerificationStatusMsg('Camera verification unavailable — please retry.');

        if (onVerificationChange) {
          onVerificationChange({
            verified: false,
            personCount: 0,
            faceCount: 0,
            message: 'Camera verification unavailable — please retry.'
          });
        }
      }
    }

    initCameraAndModel();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        console.log('[CAMERA] Cleaning up stream on unmount...');
        stopWebcamStream(streamRef.current);
        streamRef.current = null;
      }
    };
  }, []);

  // Re-bind stream if video element mounts after permission update
  useEffect(() => {
    if (cameraPermission && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.warn('[CAMERA] Re-bind play warning:', e));
    }
  }, [cameraPermission]);

  // 2. High-Frequency Real-Time Detection Loop (~110ms interval)
  useEffect(() => {
    if (!cameraPermission) return;

    const intervalId = setInterval(async () => {
      if (
        !videoRef.current ||
        !canvasRef.current ||
        videoRef.current.readyState < 2 ||
        videoRef.current.videoWidth === 0 ||
        videoRef.current.videoHeight === 0 ||
        !videoRef.current.srcObject
      ) {
        return; // Wait until stream is ready
      }

      const currentModelStatus = getModelStatus();
      setModelStatus(currentModelStatus);

      const analysis = await analyzeFrame(videoRef.current, canvasRef.current, stateRef.current.lastFrameState);
      stateRef.current.lastFrameState = analysis;

      const count = analysis.personCount;
      setPersonCount(count);
      setFaceCount(analysis.faceCount || 0);
      setDetections(analysis.detections || []);
      setGazeState(analysis.gazeState || 'ATTENTIVE');
      setNormalizedMovement(analysis.normalizedMovement || 0);
      setMovementCategory(analysis.movementCategory || 'SMALL');

      stateRef.current.maxPersonCountObserved = Math.max(stateRef.current.maxPersonCountObserved, count);
      setMaxPersonCount(stateRef.current.maxPersonCountObserved);

      // REQUIREMENT 8: Optional Bounding Box Overlay Canvas (Only drawn when debug is enabled)
      if (overlayCanvasRef.current && videoRef.current) {
        const oCtx = overlayCanvasRef.current.getContext('2d');
        const ow = overlayCanvasRef.current.width;
        const oh = overlayCanvasRef.current.height;
        oCtx.clearRect(0, 0, ow, oh);

        if (showDebug) {
          (analysis.detections || []).forEach((det, idx) => {
            const b = det.boundingBox;
            const bx = b.x * ow;
            const by = b.y * oh;
            const bw = b.width * ow;
            const bh = b.height * oh;

            const isSecond = idx > 0;
            oCtx.strokeStyle = isSecond ? '#f43f5e' : '#34d399';
            oCtx.lineWidth = 2;
            oCtx.strokeRect(bx, by, bw, bh);

            oCtx.fillStyle = isSecond ? '#f43f5e' : '#34d399';
            oCtx.font = 'bold 10px sans-serif';
            const label = isSecond ? `SECOND PERSON (${det.region})` : `CANDIDATE (${det.region})`;
            oCtx.fillText(label, bx + 4, by + 12);
          });
        }
      }

      // PRE-TEST VERIFICATION (Setup Stage)
      if (!stateRef.current.testStarted) {
        let isVerified = false;
        let msg = '';

        if (currentModelStatus === 'ERROR') {
          isVerified = false;
          msg = 'Person detector unavailable — please check internet connection or retry.';
        } else if (currentModelStatus === 'LOADING') {
          isVerified = false;
          msg = 'Loading person detector AI model...';
        } else if (count === 1) {
          isVerified = true;
          msg = 'Camera verified — 1 candidate detected.';
        } else if (count === 0) {
          isVerified = false;
          msg = 'No candidate detected. Please position yourself clearly in front of the camera.';
        } else {
          isVerified = false;
          msg = 'Multiple people detected. Only the candidate is allowed during the test.';
        }

        setCameraVerified(isVerified);
        setVerificationStatusMsg(msg);

        if (onVerificationChange) {
          onVerificationChange({
            verified: isVerified,
            personCount: count,
            faceCount: analysis.faceCount,
            message: msg
          });
        }
      }

      // LIVE TEST CHEATING MONITORING (Interview Stage)
      if (stateRef.current.testStarted && stateRef.current.stage === 'interview') {
        
        // Track Total vs Camera Attention Time (0.11s increment)
        stateRef.current.totalTrackedTime += 0.11;
        if (analysis.isLookingAway) {
          stateRef.current.timeLookingAway += 0.11;
        }

        const pctAway = (stateRef.current.timeLookingAway / stateRef.current.totalTrackedTime) * 100;
        const liveAttentionPct = Math.max(0, Math.min(100, Math.round(100 - pctAway)));
        setAttentionPercentage(liveAttentionPct);

        // REQUIREMENT 11: DEBUG LOGGING IN CONSOLE
        const currentEvents = cameraEventsRef.current;
        const liveTabSwitches = currentEvents.filter(e => e.type === 'TAB_SWITCH').length;
        const liveFocusLosses = currentEvents.filter(e => e.type === 'FOCUS_LOSS').length;
        const liveGazeLosses = currentEvents.filter(e => e.type === 'GAZE_LOSS').length;
        const liveFaceMissing = currentEvents.filter(e => e.type === 'FACE_NOT_VISIBLE').length;
        const liveSuspiciousMovement = currentEvents.filter(e => e.type === 'SUSPICIOUS_MOVEMENT').length;

        console.log(`[PROCTOR] Person count: ${count} | Face: ${analysis.faceCount} | Gaze: ${analysis.gazeState} | Movement: ${analysis.movementCategory} | Tab switches: ${liveTabSwitches} | Focus loss: ${liveFocusLosses} | Face missing: ${liveFaceMissing} | Gaze loss: ${liveGazeLosses} | Suspicious movement: ${liveSuspiciousMovement} | Terminated: ${stateRef.current.cheatingFired}`);

        // A. SECOND PERSON / MULTIPLE HUMANS CHEATING EVENT (REQUIREMENT 1: 2 consecutive frames temporal confirmation)
        if (analysis.additionalHumanDetected || count >= 2) {
          stateRef.current.multiPersonStreak += 1;
          
          if (stateRef.current.multiPersonStreak >= 2 && !stateRef.current.cheatingFired) {
            stateRef.current.cheatingFired = true;

            const cheatEvent = recordProctorEvent({
              type: 'MULTIPLE_HUMANS',
              region: analysis.detections?.[1]?.region || 'FRAME_EDGE',
              severity: 'CRITICAL',
              reason: 'MULTIPLE_HUMANS',
              details: `Multiple people (${count}) detected in camera frame`
            });

            if (onCheatingDetected) {
              onCheatingDetected({
                reason: "MULTIPLE_HUMANS",
                personCount: count,
                timestamp: cheatEvent.time,
                confidence: 0.95,
                message: "Multiple people were detected in the camera frame."
              });
            }
          }
        } else {
          stateRef.current.multiPersonStreak = 0;
        }

        // B. CANDIDATE ABSENCE (FACE MISSING VIOLATION)
        if ((count === 0 && (analysis.faceDisappeared || analysis.faceCount === 0)) || analysis.faceMissingViolation) {
          if (!stateRef.current.faceMissingStartTime) {
            stateRef.current.faceMissingStartTime = Date.now();
          }

          if (analysis.faceMissingViolation && !stateRef.current.cheatingFired) {
            stateRef.current.cheatingFired = true;
            const cheatEvent = recordProctorEvent({
              type: 'FACE_NOT_VISIBLE',
              severity: 'CRITICAL',
              reason: 'FACE_NOT_VISIBLE',
              details: 'Candidate face missing from camera frame beyond confirmation threshold'
            });

            if (onCheatingDetected) {
              onCheatingDetected({
                type: "FACE_NOT_VISIBLE",
                reason: "FACE_NOT_VISIBLE",
                personCount: 0,
                timestamp: cheatEvent.time,
                confidence: 1.0,
                message: "Candidate face missing from camera frame beyond confirmation threshold."
              });
            }
          }
        } else {
          stateRef.current.faceMissingStartTime = null;
        }

        // B2. CANDIDATE OUT OF BOUNDARY FRAME VIOLATION (> 5% BREACH)
        if (analysis.isOutOfFrame && !stateRef.current.cheatingFired) {
          stateRef.current.cheatingFired = true;

          const cheatEvent = recordProctorEvent({
            type: 'OUT_OF_FRAME',
            severity: 'CRITICAL',
            outsidePercentage: analysis.outsidePercentage,
            reason: 'OUT_OF_FRAME',
            details: `Candidate moved ${analysis.outsidePercentage}% outside permitted camera zone`
          });

          if (onCheatingDetected) {
            onCheatingDetected({
              type: "OUT_OF_FRAME",
              reason: "OUT_OF_FRAME",
              personCount: count,
              timestamp: cheatEvent.time,
              confidence: 1.0,
              message: "Candidate moved outside permitted camera frame."
            });
          }
        }

        // B3. MULTIPLE VOICE / SECOND SPEAKER AUDIO DETECTOR
        const voiceCheck = detectMultipleVoices();
        setVoiceMonitorState(voiceCheck);

        if (voiceCheck.multipleVoicesDetected && !stateRef.current.cheatingFired) {
          stateRef.current.cheatingFired = true;

          const cheatEvent = recordProctorEvent({
            type: 'MULTIPLE_VOICE',
            severity: 'CRITICAL',
            reason: 'MULTIPLE_VOICE',
            confidence: voiceCheck.confidence,
            details: voiceCheck.details || 'Multiple distinct voices/speakers detected during interview'
          });

          if (onCheatingDetected) {
            onCheatingDetected({
              type: "MULTIPLE_VOICE",
              reason: "MULTIPLE_VOICE",
              personCount: count,
              timestamp: cheatEvent.time,
              confidence: voiceCheck.confidence / 100,
              message: `Multiple voices detected (${voiceCheck.details || 'Secondary speaker detected'}).`
            });
          }
        }

        // C. GAZE LOSS VIOLATION
        if (analysis.gazeViolation && !stateRef.current.cheatingFired) {
          stateRef.current.cheatingFired = true;
          const cheatEvent = recordProctorEvent({
            type: 'GAZE_VIOLATION',
            severity: 'CRITICAL',
            reason: 'GAZE_VIOLATION',
            details: `Sustained eye gaze deviation detected towards ${analysis.gazeState}`
          });

          if (onCheatingDetected) {
            onCheatingDetected({
              type: "GAZE_VIOLATION",
              reason: "GAZE_VIOLATION",
              personCount: count,
              timestamp: cheatEvent.time,
              confidence: 0.95,
              message: `Sustained eye gaze deviation detected away from interview screen.`
            });
          }
        }

        // D. SUSPICIOUS LARGE MOVEMENT VIOLATION
        if (analysis.suspiciousMovementViolation && !stateRef.current.cheatingFired) {
          stateRef.current.cheatingFired = true;
          const cheatEvent = recordProctorEvent({
            type: 'SUSPICIOUS_MOVEMENT',
            severity: 'CRITICAL',
            reason: 'SUSPICIOUS_MOVEMENT',
            details: `Large body displacement detected (${analysis.movementCategory})`
          });

          if (onCheatingDetected) {
            onCheatingDetected({
              type: "SUSPICIOUS_MOVEMENT",
              reason: "SUSPICIOUS_MOVEMENT",
              personCount: count,
              timestamp: cheatEvent.time,
              confidence: 0.90,
              message: "Large body displacement or leaving calibrated position."
            });
          }
        }

        // E. COMPUTE REAL SESSION STATISTICS OBJECT FROM CENTRAL STORE (REQUIREMENT 6)
        const allEvts = cameraEventsRef.current;
        const sessionStats = {
          suspiciousMovements: allEvts.filter(e => e.type === 'SUSPICIOUS_MOVEMENT').length,
          gazeLosses: allEvts.filter(e => e.type === 'GAZE_LOSS').length,
          faceMissingEvents: allEvts.filter(e => e.type === 'FACE_NOT_VISIBLE').length,
          tabSwitches: allEvts.filter(e => e.type === 'TAB_SWITCH').length,
          focusLosses: allEvts.filter(e => e.type === 'FOCUS_LOSS').length,
          multipleHumanEvents: allEvts.filter(e => e.type === 'MULTIPLE_HUMANS').length,
          clipboardEvents: allEvts.filter(e => ['COPY_ATTEMPT', 'CUT_ATTEMPT', 'PASTE_ATTEMPT'].includes(e.type)).length,
          totalEvents: allEvts.length,
          attentionPercentage: liveAttentionPct,
          faceVisibilityScore: analysis.faceVisibilityScore || 90
        };

        // Notify parent continuously with central session state & sessionStats
        if (onProctoringUpdate) {
          onProctoringUpdate({
            cameraPermission: true,
            cameraVerified: true,
            personCount: count,
            maxPersonCount: stateRef.current.maxPersonCountObserved,
            detections: analysis.detections || [],
            tabSwitches: sessionStats.tabSwitches,
            focusLossEvents: sessionStats.focusLosses,
            suspiciousMovements: sessionStats.suspiciousMovements,
            gazeLosses: sessionStats.gazeLosses,
            faceMissingEvents: sessionStats.faceMissingEvents,
            events: allEvts,
            sessionStats,
            attentionPercentage: liveAttentionPct,
            gazeAttention: `${liveAttentionPct}% Attentive`,
            logs
          });
        }
      }

    }, 110);

    return () => {
      clearInterval(intervalId);
    };
  }, [cameraPermission, showDebug, onVerificationChange, onCheatingDetected, onProctoringUpdate]);

  // 3. TAB SWITCH, WINDOW FOCUS LOSS, AND CLIPBOARD LISTENERS
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stateRef.current.testStarted && stateRef.current.stage === 'interview') {
        recordProctorEvent({
          type: 'TAB_SWITCH',
          severity: 'CRITICAL',
          reason: 'TAB_SWITCH',
          details: 'Browser tab switch / background shift'
        });
      }
    };

    const handleWindowBlur = () => {
      if (stateRef.current.testStarted && stateRef.current.stage === 'interview') {
        const lastSwitchTime = stateRef.current.lastTabSwitchTime || 0;
        if (Date.now() - lastSwitchTime < 1000) return;
        stateRef.current.lastTabSwitchTime = Date.now();

        recordProctorEvent({
          type: 'FOCUS_LOSS',
          severity: 'WARNING',
          reason: 'FOCUS_LOSS',
          details: 'Browser window lost focus'
        });
      }
    };

    const handleCopy = () => {
      if (stateRef.current.testStarted && stateRef.current.stage === 'interview') {
        recordProctorEvent({ type: 'COPY_ATTEMPT', severity: 'WARNING', details: 'Candidate copied content' });
      }
    };

    const handleCut = () => {
      if (stateRef.current.testStarted && stateRef.current.stage === 'interview') {
        recordProctorEvent({ type: 'CUT_ATTEMPT', severity: 'WARNING', details: 'Candidate cut content' });
      }
    };

    const handlePaste = () => {
      if (stateRef.current.testStarted && stateRef.current.stage === 'interview') {
        recordProctorEvent({ type: 'PASTE_ATTEMPT', severity: 'WARNING', details: 'Candidate pasted content' });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  // Compute live sessionStats for UI rendering
  const liveStats = {
    suspiciousMovements: cameraEventsRef.current.filter(e => e.type === 'SUSPICIOUS_MOVEMENT').length,
    gazeLosses: cameraEventsRef.current.filter(e => e.type === 'GAZE_LOSS').length,
    faceMissingEvents: cameraEventsRef.current.filter(e => e.type === 'FACE_NOT_VISIBLE').length,
    tabSwitches: cameraEventsRef.current.filter(e => e.type === 'TAB_SWITCH').length,
    focusLosses: cameraEventsRef.current.filter(e => e.type === 'FOCUS_LOSS').length,
    multipleHumanEvents: cameraEventsRef.current.filter(e => e.type === 'MULTIPLE_HUMANS').length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* CLEAN CAMERA VIEWPORT BOX (REQUIREMENT 8: Live camera feed never blanked/hidden) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        background: '#090d16',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Hidden internal processing canvas */}
        <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />

        {/* Live Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror preview
            display: cameraPermission ? 'block' : 'none'
          }}
        />

        {/* Optional Bounding Box Overlay Canvas (Matching Video Dimensions) */}
        <canvas
          ref={overlayCanvasRef}
          width="320"
          height="240"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            transform: 'scaleX(-1)',
            background: 'transparent',
            display: cameraPermission && showDebug ? 'block' : 'none'
          }}
        />

        {!cameraPermission && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
            <Video size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.85rem' }}>{permissionError || "Requesting webcam access..."}</p>
          </div>
        )}

        {/* Clean Status Pill Overlay */}
        {cameraPermission && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            padding: '5px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 5
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: personCount === 1 ? '#34d399' : personCount === 0 ? '#fbbf24' : '#f43f5e'
            }} />
            <span>
              {personCount === 1
                ? "Proctoring Active — 1 Candidate"
                : personCount === 0
                ? "No Person Detected"
                : `${personCount} Humans Detected (FLAG)`}
            </span>
          </div>
        )}

        {/* Developer Debug Toggle Button */}
        {cameraPermission && (
          <button
            onClick={() => setShowDebug(!showDebug)}
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.65)',
              color: '#a5b4fc',
              border: '1px solid rgba(165,180,252,0.3)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 10
            }}
          >
            <Terminal size={12} />
            Developer Debug {showDebug ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        )}

        {/* DEVELOPER DEBUG PANEL (REQUIREMENT 11) */}
        {showDebug && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(6px)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: '#a5b4fc',
            border: '1px solid rgba(165, 180, 252, 0.3)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            <div>Camera: {streamRef.current?.active ? 'ACTIVE' : 'INACTIVE'} | Model: {modelStatus}</div>
            <div>Person Count: {personCount} | Face Count: {faceCount} | Candidate: {personCount > 0 ? 'YES' : 'NO'}</div>
            <div>Gaze: {gazeState} | Movement: {movementCategory} ({normalizedMovement.toFixed(3)})</div>
            <div>Tab Switches: {liveStats.tabSwitches} | Focus Loss: {liveStats.focusLosses}</div>
            <div>Face Missing: {liveStats.faceMissingEvents} | Gaze Loss: {liveStats.gazeLosses} | Suspicious Motion: {liveStats.suspiciousMovements}</div>
            <div>Terminated: {stateRef.current.cheatingFired ? 'YES' : 'NO'}</div>
          </div>
        )}
      </div>

      {/* Voice Monitor Status Display (Requirement 2: Runtime Debug Diagnostics) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: voiceMonitorState.multipleVoicesDetected ? '1px solid #f43f5e' : '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '12px 14px',
        fontSize: '0.78rem',
        fontFamily: 'monospace, sans-serif'
      }}>
        <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Voice Monitor Diagnostics</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: voiceMonitorState.multipleVoicesDetected ? 'rgba(244, 63, 94, 0.2)' : 'rgba(52, 211, 153, 0.15)', color: voiceMonitorState.multipleVoicesDetected ? '#f43f5e' : '#34d399' }}>
            {voiceMonitorState.multipleVoicesDetected ? 'MULTIPLE VOICE EVENT' : 'PROCTOR ACTIVE'}
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: '#cbd5e1', marginBottom: '6px' }}>
          <div>Audio Context: <strong style={{ color: voiceMonitorState.audioContextState === 'RUNNING' ? '#34d399' : '#fbbf24' }}>{voiceMonitorState.audioContextState || 'SUSPENDED'}</strong></div>
          <div>Microphone Track: <strong style={{ color: voiceMonitorState.micTrackState === 'ACTIVE' ? '#34d399' : '#f43f5e' }}>{voiceMonitorState.micTrackState || 'INACTIVE'}</strong></div>
          <div>Analyser: <strong style={{ color: voiceMonitorState.analyserStatus === 'READY' ? '#34d399' : '#f43f5e' }}>{voiceMonitorState.analyserStatus || 'ERROR'}</strong></div>
          <div>RMS / Pitch: <strong style={{ color: 'white' }}>{voiceMonitorState.rms || 0} / {voiceMonitorState.pitchHz || 0} Hz</strong></div>
          <div>Candidate voice: <strong style={{ color: voiceMonitorState.candidateVoiceDetected ? '#34d399' : '#94a3b8' }}>{voiceMonitorState.candidateVoiceDetected ? 'DETECTED' : 'NOT DETECTED'}</strong></div>
          <div>Second voice: <strong style={{ color: voiceMonitorState.secondVoiceDetected ? '#f43f5e' : '#94a3b8' }}>{voiceMonitorState.secondVoiceDetected ? 'DETECTED' : 'NOT DETECTED'}</strong></div>
        </div>

        <div style={{ marginTop: '4px', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
          <span>Confidence: <strong style={{ color: 'white' }}>{voiceMonitorState.confidence}%</strong></span>
          <span style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voiceMonitorState.details}</span>
        </div>
      </div>

      {/* SETUP / PRE-TEST VERIFICATION STATUS CARD */}
      {!testStarted && (
        <div style={{
          padding: '14px',
          borderRadius: '10px',
          background: cameraVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
          border: cameraVerified ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {cameraVerified ? (
            <ShieldCheck size={24} color="#34d399" />
          ) : (
            <ShieldAlert size={24} color="#f43f5e" />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: cameraVerified ? '#34d399' : '#f43f5e' }}>
              {cameraVerified ? "Pre-Test Camera Verification Passed" : "Camera Verification Action Required"}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {verificationStatusMsg}
            </div>
          </div>
        </div>
      )}

      {/* METRICS & LOG AUDIT PANEL */}
      {testStarted && (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tab Switches</span>
              <div style={{ fontWeight: 700, color: liveStats.tabSwitches > 0 ? '#f43f5e' : 'white' }}>{liveStats.tabSwitches}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Focus Loss</span>
              <div style={{ fontWeight: 700, color: liveStats.focusLosses > 0 ? '#fbbf24' : 'white' }}>{liveStats.focusLosses}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Suspicious Motion</span>
              <div style={{ fontWeight: 700, color: liveStats.suspiciousMovements > 0 ? '#f43f5e' : 'white' }}>{liveStats.suspiciousMovements}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gaze Attention</span>
              <div style={{ fontWeight: 700, color: attentionPercentage >= 80 ? '#34d399' : '#fbbf24' }}>{attentionPercentage}%</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
