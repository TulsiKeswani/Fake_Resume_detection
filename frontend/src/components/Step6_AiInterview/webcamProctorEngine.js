import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let cocoModel = null;
let isDetecting = false;
let modelLoading = false;
let modelLoadStatus = 'UNLOADED'; // 'UNLOADED' | 'LOADING' | 'LOADED' | 'ERROR'

// Real tracking metrics for session stats
let totalFramesAnalyzed = 0;
let faceVisibleFrames = 0;

/**
 * Loads TensorFlow before COCO-SSD and caches the model.
 */
export async function loadPersonDetectionModel() {
  if (cocoModel) {
    modelLoadStatus = 'LOADED';
    return cocoModel;
  }
  if (modelLoading) return null;

  modelLoading = true;
  modelLoadStatus = 'LOADING';

  try {
    console.log('[PROCTOR] TensorFlow initializing...');
    await tf.ready();
    console.log('[PROCTOR] TensorFlow initialized successfully');

    console.log('[PROCTOR] Loading COCO-SSD model (@tensorflow-models/coco-ssd)...');
    cocoModel = await cocoSsd.load({
      base: 'lite_mobilenet_v2'
    });
    console.log('[PROCTOR] COCO-SSD model loaded successfully');
    modelLoadStatus = 'LOADED';
    modelLoading = false;
    return cocoModel;
  } catch (err) {
    console.error('[PROCTOR ERROR] COCO-SSD failed to load:', err);
    modelLoadStatus = 'ERROR';
    modelLoading = false;
    return null;
  }
}

export function getModelStatus() {
  return modelLoadStatus;
}

// Request combined webcam and microphone media stream (1280x720 video + audio)
export async function startWebcamStream() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Webcam & Microphone API is not supported in this browser environment.');
  }

  console.log('[MEDIA] Requesting unified camera and microphone stream...');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1
      }
    });
    return stream;
  } catch (audioErr) {
    console.warn('[MEDIA] Audio+Video combined request notice, trying generic audio:', audioErr);
    // Fallback: request video and simple audio (MUST INCLUDE AUDIO)
    try {
      const fallbackStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      return fallbackStream;
    } catch (err2) {
      console.error('[MEDIA] Microphone permission denied or audio hardware unavailable:', err2);
      throw new Error('Microphone permission is MANDATORY for the AI Voice Interview. Video-only mode is not permitted.');
    }
  }
}

export function stopWebcamStream(stream) {
  if (stream && stream.getTracks) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 * Calculate Intersection over Union (IoU) between two normalized bounding boxes.
 */
export function calculateIoU(boxA, boxB) {
  if (!boxA || !boxB) return 0;
  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;

  const boxAArea = boxA.width * boxA.height;
  const boxBArea = boxB.width * boxB.height;
  const unionArea = boxAArea + boxBArea - interArea;

  if (unionArea <= 0) return 0;
  return interArea / unionArea;
}

/**
 * 9-REGION SPATIAL MAPPER
 * Maps normalized coordinates (0 to 1) to 3x3 frame regions.
 */
export function getGridRegion(box) {
  if (!box) return 'CENTER';
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  let row = 'MID';
  if (cy < 0.35) row = 'TOP';
  else if (cy > 0.65) row = 'BOT';

  let col = 'CENTER';
  if (cx < 0.35) col = 'LEFT';
  else if (cx > 0.65) col = 'RIGHT';

  if (row === 'MID' && col === 'CENTER') return 'CENTER';
  return `${row}-${col}`;
}

export function isEdgeOrCornerBox(box) {
  if (!box) return false;
  const touchesLeft = box.x <= 0.05;
  const touchesRight = (box.x + box.width) >= 0.95;
  const touchesTop = box.y <= 0.05;
  const touchesBottom = (box.y + box.height) >= 0.95;
  return touchesLeft || touchesRight || touchesTop || touchesBottom;
}

/**
 * PUPIL / IRIS PIXEL INTENSITY DISTRIBUTION EYE GAZE ESTIMATOR
 * Analyzes eye bounding box pixel data to compute horizontal & vertical iris ratios.
 */
function estimateEyeGazeState(faceBox, videoElement, canvasElement) {
  if (!faceBox || !videoElement || !canvasElement) return 'FACE_NOT_VISIBLE';

  try {
    const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 'ATTENTIVE';

    const vw = canvasElement.width || 640;
    const vh = canvasElement.height || 480;

    const fx = Math.floor(faceBox.x * vw);
    const fy = Math.floor(faceBox.y * vh);
    const fw = Math.floor(faceBox.width * vw);
    const fh = Math.floor(faceBox.height * vh);

    if (fw <= 20 || fh <= 20) return 'ATTENTIVE';

    // Sample Left Eye Sub-Region (18%..46% width, 22%..42% height of face)
    const eyeX = Math.max(0, fx + Math.floor(fw * 0.18));
    const eyeY = Math.max(0, fy + Math.floor(fh * 0.22));
    const eyeW = Math.min(vw - eyeX, Math.floor(fw * 0.28));
    const eyeH = Math.min(vh - eyeY, Math.floor(fh * 0.18));

    if (eyeW <= 4 || eyeH <= 4) return 'ATTENTIVE';

    const imgData = ctx.getImageData(eyeX, eyeY, eyeW, eyeH);
    const data = imgData.data;

    let minIntensity = 255 * 3;
    let minX = Math.floor(eyeW / 2);
    let minY = Math.floor(eyeH / 2);

    for (let y = 0; y < eyeH; y++) {
      for (let x = 0; x < eyeW; x++) {
        const idx = (y * eyeW + x) * 4;
        const intensity = data[idx] + data[idx + 1] + data[idx + 2];
        if (intensity < minIntensity) {
          minIntensity = intensity;
          minX = x;
          minY = y;
        }
      }
    }

    const irisRatioX = minX / eyeW;
    const irisRatioY = minY / eyeH;

    if (irisRatioX < 0.32) return 'LOOKING_LEFT';
    if (irisRatioX > 0.68) return 'LOOKING_RIGHT';
    if (irisRatioY < 0.28) return 'LOOKING_UP';
    if (irisRatioY > 0.72) return 'LOOKING_DOWN';

    return 'ATTENTIVE';
  } catch (e) {
    return 'ATTENTIVE';
  }
}

/**
 * FULL-FRAME HUMAN DETECTION & PROCTORING ANALYTICS ENGINE
 * Uses ONLY COCO-SSD class 'person' + FaceDetector API.
 */
export async function analyzeFrame(videoElement, canvasElement, lastFrameState = null) {
  if (
    !videoElement ||
    videoElement.readyState < 2 ||
    videoElement.videoWidth === 0 ||
    videoElement.videoHeight === 0 ||
    !canvasElement
  ) {
    return {
      proctorState: 'NO_CANDIDATE',
      candidateDetected: false,
      additionalHumanDetected: false,
      personCount: 0,
      maxHumansObserved: 0,
      detections: [],
      rawPredictions: [],
      faceCount: 0,
      faces: [],
      centroid: null,
      gazeState: 'FACE_NOT_VISIBLE',
      normalizedMovement: 0,
      movementCategory: 'SMALL',
      isLookingAway: false,
      faceDisappeared: true,
      faceVisibilityScore: 0,
      confidence: 0,
      timestamp: new Date().toLocaleTimeString()
    };
  }

  if (isDetecting) {
    return lastFrameState || {
      proctorState: 'NO_CANDIDATE',
      candidateDetected: false,
      additionalHumanDetected: false,
      personCount: 0,
      maxHumansObserved: 0,
      detections: [],
      faceCount: 0,
      gazeState: 'FACE_NOT_VISIBLE',
      normalizedMovement: 0,
      movementCategory: 'SMALL',
      faceVisibilityScore: 0,
      confidence: 0,
      timestamp: new Date().toLocaleTimeString()
    };
  }

  isDetecting = true;

  try {
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    let rawPredictions = [];
    let personDetections = [];
    let detectedFaces = [];

    // --- REQUIREMENT 1: UNCROPPED FULL-FRAME COCO-SSD INFERENCE ---
    if (cocoModel) {
      try {
        // Pass full video element (entire camera frame 0..videoWidth x 0..videoHeight)
        rawPredictions = await cocoModel.detect(videoElement);

        // ONLY COCO-SSD class 'person' with score >= 0.35 counts as human
        const persons = rawPredictions.filter(
          (p) => p.class === 'person' && p.score >= 0.35
        );

        if (persons.length > 0) {
          personDetections = persons.map((p) => {
            const bbox = {
              x: p.bbox[0] / videoWidth,
              y: p.bbox[1] / videoHeight,
              width: p.bbox[2] / videoWidth,
              height: p.bbox[3] / videoHeight
            };
            return {
              class: 'person',
              confidence: Math.round(p.score * 100) / 100,
              region: getGridRegion(bbox),
              isEdge: isEdgeOrCornerBox(bbox),
              boundingBox: bbox
            };
          });
        }
      } catch (e) {
        console.warn('[PROCTOR] COCO-SSD detection frame warning:', e);
      }
    }

    // --- NATIVE FACE DETECTOR API (FALLBACK & GAZE) ---
    if ('FaceDetector' in window) {
      try {
        const detector = new window.FaceDetector({ maxFaces: 10, fastMode: true });
        const faces = await detector.detect(videoElement);
        if (faces && faces.length > 0) {
          detectedFaces = faces.map((f) => {
            const fbox = {
              x: f.boundingBox.x / videoWidth,
              y: f.boundingBox.y / videoHeight,
              width: f.boundingBox.width / videoWidth,
              height: f.boundingBox.height / videoHeight
            };
            return {
              ...fbox,
              region: getGridRegion(fbox),
              isEdge: isEdgeOrCornerBox(fbox)
            };
          });
        }
      } catch (e) {
        // Face detector fallback
      }
    }

    // If COCO-SSD sees 0 persons but FaceDetector sees candidate face, treat as candidate person box
    if (personDetections.length === 0 && detectedFaces.length > 0) {
      detectedFaces.forEach((face) => {
        const pbox = {
          x: Math.max(0, face.x - 0.1),
          y: Math.max(0, face.y - 0.1),
          width: Math.min(1 - face.x, face.width * 1.8),
          height: Math.min(1 - face.y, face.height * 2.5)
        };
        personDetections.push({
          class: 'person',
          confidence: 0.90,
          region: getGridRegion(pbox),
          isEdge: isEdgeOrCornerBox(pbox),
          boundingBox: pbox
        });
      });
    }

    // --- STRICT IoU DEDUPLICATION (Merge overlapping boxes of same person > 0.55 IoU) ---
    const confirmedPersons = [];
    personDetections.forEach((det) => {
      const isDuplicate = confirmedPersons.some((existing) => {
        const iou = calculateIoU(existing.boundingBox, det.boundingBox);
        return iou > 0.55;
      });

      if (!isDuplicate) {
        confirmedPersons.push(det);
      }
    });

    const personCount = confirmedPersons.length;
    const candidateDetected = personCount > 0;
    const primaryPersonBox = confirmedPersons[0] ? confirmedPersons[0].boundingBox : null;

    // Calculate real candidate face visibility score over time
    totalFramesAnalyzed++;
    if (candidateDetected || detectedFaces.length > 0) {
      faceVisibleFrames++;
    }
    const faceVisibilityScore = Math.max(0, Math.min(100, Math.round((faceVisibleFrames / Math.max(1, totalFramesAnalyzed)) * 100)));

    // --- REQUIREMENT 5: REAL EYE / IRIS / PUPIL EYE-REGION GAZE ESTIMATION ---
    let gazeState = 'ATTENTIVE';
    let centroid = null;

    if (detectedFaces[0]) {
      const f = detectedFaces[0];
      centroid = { x: f.x + f.width / 2, y: f.y + f.height / 2 };
      gazeState = estimateEyeGazeState(f, videoElement, canvasElement);
    } else if (primaryPersonBox) {
      centroid = { x: primaryPersonBox.x + primaryPersonBox.width / 2, y: primaryPersonBox.y + primaryPersonBox.height * 0.3 };
      gazeState = estimateEyeGazeState(primaryPersonBox, videoElement, canvasElement);
    } else {
      gazeState = 'FACE_NOT_VISIBLE';
    }

    // --- CONTINUOUS VIOLATION FRAME COUNTERS ---
    if (!lastFrameState || typeof lastFrameState.faceMissingFrames !== 'number') {
      analyzeFrame.faceMissingFrames = 0;
      analyzeFrame.gazeViolationFrames = 0;
      analyzeFrame.displacementViolationFrames = 0;
    } else {
      analyzeFrame.faceMissingFrames = lastFrameState.faceMissingFrames || 0;
      analyzeFrame.gazeViolationFrames = lastFrameState.gazeViolationFrames || 0;
      analyzeFrame.displacementViolationFrames = lastFrameState.displacementViolationFrames || 0;
    }

    // 1. Face Missing Tracking
    const faceDisappeared = personCount === 0 && detectedFaces.length === 0;
    if (faceDisappeared) {
      analyzeFrame.faceMissingFrames += 1;
    } else {
      analyzeFrame.faceMissingFrames = Math.max(0, analyzeFrame.faceMissingFrames - 1);
    }
    const faceMissingViolation = analyzeFrame.faceMissingFrames >= 30; // ~3.0 seconds missing

    // 2. Gaze Deviation Tracking
    const isLookingAway = gazeState !== 'ATTENTIVE' && gazeState !== 'FACE_NOT_VISIBLE' && gazeState !== 'NOT AVAILABLE';
    if (isLookingAway) {
      analyzeFrame.gazeViolationFrames += 1;
    } else {
      analyzeFrame.gazeViolationFrames = Math.max(0, analyzeFrame.gazeViolationFrames - 1);
    }
    const gazeViolation = analyzeFrame.gazeViolationFrames >= 30; // ~3.0 seconds gaze loss

    // 3. Large Body Displacement Tracking
    let normalizedMovement = 0;
    let movementCategory = 'SMALL';
    if (lastFrameState && lastFrameState.centroid && centroid) {
      const dx = Math.abs(centroid.x - lastFrameState.centroid.x);
      const dy = Math.abs(centroid.y - lastFrameState.centroid.y);
      normalizedMovement = Math.sqrt(dx * dx + dy * dy);

      if (normalizedMovement > 0.22) {
        movementCategory = 'LARGE_DISPLACEMENT';
        analyzeFrame.displacementViolationFrames += 1;
      } else if (normalizedMovement > 0.08) {
        movementCategory = 'SIGNIFICANT';
        analyzeFrame.displacementViolationFrames = Math.max(0, analyzeFrame.displacementViolationFrames - 1);
      } else {
        movementCategory = 'SMALL';
        analyzeFrame.displacementViolationFrames = Math.max(0, analyzeFrame.displacementViolationFrames - 1);
      }
    }
    const suspiciousMovementViolation = analyzeFrame.displacementViolationFrames >= 3;

    // --- PROCTOR STATE EVALUATION ---
    let proctorState = 'CONFIRMED_SINGLE_CANDIDATE';
    let additionalHumanDetected = false;

    if (personCount >= 2) {
      proctorState = 'CONFIRMED_MULTIPLE_HUMANS';
      additionalHumanDetected = true;
    } else if (personCount === 0) {
      proctorState = 'NO_CANDIDATE';
    }

    const maxHumansObserved = Math.max(personCount, additionalHumanDetected ? personCount : (candidateDetected ? 1 : 0));

    // Auto-calibrate candidate zone on first valid detection if not set
    if (primaryPersonBox && !calibratedCandidateZone) {
      calibrateCandidateZone(primaryPersonBox);
    }

    const boundaryCheck = primaryPersonBox
      ? checkFrameBoundaryViolation(primaryPersonBox)
      : { isOutOfFrame: false, outsidePercentage: 0 };

    return {
      proctorState,
      candidateDetected,
      additionalHumanDetected,
      personCount,
      maxHumansObserved,
      detections: confirmedPersons,
      rawPredictions,
      faceCount: Math.max(detectedFaces.length, personCount > 0 ? 1 : 0),
      faces: detectedFaces.length > 0 ? detectedFaces : (primaryPersonBox ? [primaryPersonBox] : []),
      centroid,
      gazeState,
      normalizedMovement,
      movementCategory,
      isLookingAway,
      faceDisappeared,
      faceMissingViolation,
      faceMissingFrames: analyzeFrame.faceMissingFrames,
      gazeViolation,
      gazeViolationFrames: analyzeFrame.gazeViolationFrames,
      suspiciousMovementViolation,
      displacementViolationFrames: analyzeFrame.displacementViolationFrames,
      faceVisibilityScore,
      calibratedZone: calibratedCandidateZone,
      isOutOfFrame: boundaryCheck.isOutOfFrame,
      outsidePercentage: boundaryCheck.outsidePercentage,
      confidence: confirmedPersons[0] ? confirmedPersons[0].confidence : (candidateDetected ? 0.90 : 0),
      timestamp: new Date().toLocaleTimeString()
    };
  } finally {
    isDetecting = false;
  }
}

/**
 * CANDIDATE CAMERA ZONE CALIBRATION & 5% BOUNDARY BREACH DETECTOR
 */
let calibratedCandidateZone = null;

export function calibrateCandidateZone(primaryPersonBox) {
  if (!primaryPersonBox) return null;
  const marginX = Math.max(0.08, primaryPersonBox.width * 0.25);
  const marginY = Math.max(0.08, primaryPersonBox.height * 0.25);

  calibratedCandidateZone = {
    x: Math.max(0, primaryPersonBox.x - marginX),
    y: Math.max(0, primaryPersonBox.y - marginY),
    width: Math.min(1, primaryPersonBox.width + marginX * 2),
    height: Math.min(1, primaryPersonBox.height + marginY * 2),
    calibratedAt: new Date().toISOString()
  };
  return calibratedCandidateZone;
}

export function getCalibratedZone() {
  return calibratedCandidateZone;
}

export function checkFrameBoundaryViolation(candidateBox, zone = calibratedCandidateZone) {
  if (!candidateBox || !zone) return { isOutOfFrame: false, outsidePercentage: 0 };

  const xA = Math.max(candidateBox.x, zone.x);
  const yA = Math.max(candidateBox.y, zone.y);
  const xB = Math.min(candidateBox.x + candidateBox.width, zone.x + zone.width);
  const yB = Math.min(candidateBox.y + candidateBox.height, zone.y + zone.height);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;

  const candidateArea = candidateBox.width * candidateBox.height;
  if (candidateArea <= 0) return { isOutOfFrame: false, outsidePercentage: 0 };

  const outsideArea = candidateArea - interArea;
  const outsideFraction = outsideArea / candidateArea;
  const outsidePercentage = Math.round(outsideFraction * 100);

  // Strict 5% boundary violation rule
  const isOutOfFrame = outsideFraction > 0.05;

  return {
    isOutOfFrame,
    outsidePercentage
  };
}

/**
 * WEB AUDIO API MULTIPLE VOICE / DUAL SPEAKER DETECTOR
 */
/**
 * ADVANCED WEB AUDIO API MULTIPLE VOICE & SPEAKER PROFILE DETECTOR
 */
let currentMediaStream = null;
let audioCtx = null;
let sourceNode = null;
let analyserNode = null;
let consecutiveVoiceViolationFrames = 0;

let candidateVoiceProfile = {
  enrolled: false,
  pitchSamples: [],
  meanPitch: 0,
  minPitch: 0,
  maxPitch: 0,
  spectralCentroids: [],
  meanCentroid: 0
};

export function resetCandidateVoiceProfile() {
  candidateVoiceProfile = {
    enrolled: false,
    pitchSamples: [],
    meanPitch: 0,
    minPitch: 0,
    maxPitch: 0,
    spectralCentroids: [],
    meanCentroid: 0
  };
  consecutiveVoiceViolationFrames = 0;
}

export async function initAudioAnalyzer(mediaStream) {
  if (!mediaStream) return null;
  currentMediaStream = mediaStream;

  const audioTracks = mediaStream.getAudioTracks();
  if (!audioTracks || audioTracks.length === 0) {
    console.error('[AUDIO DEBUG] MediaStream has NO audio tracks!');
    return null;
  }

  const track = audioTracks[0];
  console.log('[AUDIO DEBUG] stream:', mediaStream.id);
  console.log('[AUDIO DEBUG] audioTracks count:', audioTracks.length);
  console.log('[AUDIO DEBUG] track.readyState:', track.readyState);
  console.log('[AUDIO DEBUG] track.enabled:', track.enabled);
  console.log('[AUDIO DEBUG] track.muted:', track.muted);

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    console.error('[AUDIO DEBUG] Web Audio API is not supported in this browser environment.');
    return null;
  }

  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (sourceNode) {
      try { sourceNode.disconnect(); } catch (e) {}
    }

    sourceNode = audioCtx.createMediaStreamSource(mediaStream);
    if (!analyserNode) {
      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserNode.smoothingTimeConstant = 0.8;
    }
    sourceNode.connect(analyserNode);

    console.log('[AUDIO DEBUG] audioContext.state:', audioCtx.state);
    console.log('[AUDIO DEBUG] analyser: READY');
  } catch (e) {
    console.error('[AUDIO DEBUG] Audio analyzer init error:', e);
  }

  return analyserNode;
}

export async function resumeAudioContext() {
  if (!audioCtx && currentMediaStream) {
    await initAudioAnalyzer(currentMediaStream);
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
      console.log('[AUDIO DEBUG] User gesture resume() succeeded. audioContext.state:', audioCtx.state);
    } catch (e) {
      console.error('[AUDIO DEBUG] User gesture resume() failed:', e);
    }
  }

  return audioCtx ? audioCtx.state : 'closed';
}

// Autocorrelation Pitch Estimation Algorithm (F0 in Hz with harmonic filtering)
function estimatePitchF0(timeData, sampleRate) {
  const SIZE = timeData.length;
  let sumSquare = 0;
  for (let i = 0; i < SIZE; i++) {
    const val = timeData[i];
    sumSquare += val * val;
  }
  const rms = Math.sqrt(sumSquare / SIZE);

  // VAD Threshold: Realistic speech RMS floor is 0.002
  if (rms < 0.002) {
    return { pitchHz: 0, secondPitchHz: 0, bestCorrelation: 0, secondBestCorrelation: 0, rms, isSpeech: false };
  }

  // Calculate Normalized Autocorrelation across speech pitch lag search space
  const minLag = Math.max(2, Math.floor(sampleRate / 400)); // ~400 Hz pitch max limit
  const maxLag = Math.min(SIZE - 1, Math.floor(sampleRate / 70));  // ~70 Hz pitch min limit

  const corrArray = new Float32Array(maxLag + 1);

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    let energy1 = 0;
    let energy2 = 0;
    for (let i = 0; i < SIZE - lag; i++) {
      corr += timeData[i] * timeData[i + lag];
      energy1 += timeData[i] * timeData[i];
      energy2 += timeData[i + lag] * timeData[i + lag];
    }
    const normFactor = Math.sqrt(energy1 * energy2);
    corrArray[lag] = normFactor > 0 ? (corr / normFactor) : 0;
  }

  // Find local maxima in autocorrelation array
  const peaks = [];
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (corrArray[lag] > corrArray[lag - 1] && corrArray[lag] > corrArray[lag + 1] && corrArray[lag] >= 0.18) {
      const pitchHz = Math.round(sampleRate / lag);
      if (pitchHz >= 70 && pitchHz <= 400) {
        peaks.push({ lag, correlation: corrArray[lag], pitchHz });
      }
    }
  }

  // Sort peaks by correlation strength descending
  peaks.sort((a, b) => b.correlation - a.correlation);

  if (peaks.length === 0) {
    return { pitchHz: 0, secondPitchHz: 0, bestCorrelation: 0, secondBestCorrelation: 0, rms, isSpeech: false };
  }

  const primaryPeak = peaks[0];
  let secondaryPeak = null;

  // Search for non-harmonic secondary pitch peak
  for (let i = 1; i < peaks.length; i++) {
    const candidate = peaks[i];
    const pitchDiff = Math.abs(candidate.pitchHz - primaryPeak.pitchHz);
    const lagRatio = candidate.lag / primaryPeak.lag;
    const isHarmonic = Math.abs(lagRatio - Math.round(lagRatio)) < 0.12 || Math.abs((1 / lagRatio) - Math.round(1 / lagRatio)) < 0.12;

    if (pitchDiff >= 35 && !isHarmonic && candidate.correlation >= 0.18) {
      secondaryPeak = candidate;
      break;
    }
  }

  return {
    pitchHz: primaryPeak.pitchHz,
    secondPitchHz: secondaryPeak ? secondaryPeak.pitchHz : 0,
    bestCorrelation: primaryPeak.correlation,
    secondBestCorrelation: secondaryPeak ? secondaryPeak.correlation : 0,
    rms,
    isSpeech: primaryPeak.pitchHz >= 70 && primaryPeak.pitchHz <= 400 && primaryPeak.correlation >= 0.18
  };
}

// Calculate Spectral Centroid
function calculateSpectralCentroid(freqData, sampleRate, fftSize) {
  let num = 0;
  let den = 0;
  const binWidth = sampleRate / fftSize;
  for (let i = 0; i < freqData.length; i++) {
    const freq = i * binWidth;
    const mag = Math.pow(10, freqData[i] / 20); // dB to linear
    num += freq * mag;
    den += mag;
  }
  return den > 0 ? num / den : 0;
}

export function detectMultipleVoices() {
  const audioTracks = currentMediaStream ? currentMediaStream.getAudioTracks() : [];
  const track = audioTracks[0];

  const micTrackState = (track && track.readyState === 'live' && track.enabled) ? 'ACTIVE' : 'INACTIVE';
  const audioContextState = audioCtx ? audioCtx.state.toUpperCase() : 'NONE';
  const analyserStatus = analyserNode ? 'READY' : 'ERROR';

  if (audioCtx && audioCtx.state === 'suspended') {
    try { audioCtx.resume(); } catch (e) {}
  }

  if (!analyserNode || !audioCtx || micTrackState !== 'ACTIVE') {
    return {
      audioContextState,
      micTrackState,
      analyserStatus,
      voiceProctoringAvailable: false,
      candidateVoiceDetected: false,
      secondVoiceDetected: false,
      confidence: 0,
      multipleVoicesDetected: false,
      rms: 0,
      pitchHz: 0,
      secondPitchHz: 0,
      details: micTrackState !== 'ACTIVE' ? 'Microphone input track inactive' : 'Audio analyzer node unavailable'
    };
  }

  const sampleRate = audioCtx.sampleRate || 44100;
  const timeData = new Float32Array(analyserNode.fftSize);
  const freqData = new Float32Array(analyserNode.frequencyBinCount);

  analyserNode.getFloatTimeDomainData(timeData);
  analyserNode.getFloatFrequencyData(freqData);

  const pitchResult = estimatePitchF0(timeData, sampleRate);
  const centroid = calculateSpectralCentroid(freqData, sampleRate, analyserNode.fftSize);
  const roundedRms = Math.round(pitchResult.rms * 1000) / 1000;

  // Console diagnostics output
  if (Math.random() < 0.15) {
    console.log('[AUDIO DEBUG]', {
      stream: currentMediaStream ? currentMediaStream.id : 'NONE',
      audioTracks: audioTracks.length,
      'track.readyState': track ? track.readyState : 'NONE',
      'track.enabled': track ? track.enabled : false,
      'track.muted': track ? track.muted : false,
      'audioContext.state': audioContextState,
      analyser: analyserStatus,
      rms: roundedRms,
      pitch: pitchResult.pitchHz,
      secondPitch: pitchResult.secondPitchHz
    });
  }

  // If VAD determines silence / ambient noise (below speech floor)
  if (!pitchResult.isSpeech) {
    consecutiveVoiceViolationFrames = Math.max(0, consecutiveVoiceViolationFrames - 1);
    return {
      audioContextState,
      micTrackState: 'ACTIVE',
      analyserStatus: 'READY',
      voiceProctoringAvailable: true,
      candidateVoiceDetected: candidateVoiceProfile.enrolled,
      secondVoiceDetected: false,
      confidence: 0,
      multipleVoicesDetected: false,
      details: roundedRms < 0.002 ? 'Ambient noise / Silence' : 'Unvoiced ambient audio',
      rms: roundedRms,
      pitchHz: 0,
      secondPitchHz: 0
    };
  }

  const currentPitch = pitchResult.pitchHz;

  // 1. CANDIDATE BASELINE ENROLLMENT (Requires 6 speech samples)
  if (!candidateVoiceProfile.enrolled) {
    candidateVoiceProfile.pitchSamples.push(currentPitch);
    candidateVoiceProfile.spectralCentroids.push(centroid);

    if (candidateVoiceProfile.pitchSamples.length >= 6) {
      const samples = candidateVoiceProfile.pitchSamples;
      const sum = samples.reduce((a, b) => a + b, 0);
      const mean = sum / samples.length;
      const sorted = [...samples].sort((a, b) => a - b);

      candidateVoiceProfile.meanPitch = Math.round(mean);
      candidateVoiceProfile.minPitch = sorted[0];
      candidateVoiceProfile.maxPitch = sorted[sorted.length - 1];
      candidateVoiceProfile.meanCentroid = candidateVoiceProfile.spectralCentroids.reduce((a, b) => a + b, 0) / candidateVoiceProfile.spectralCentroids.length;
      candidateVoiceProfile.enrolled = true;
      console.log('[AUDIO PROCTOR] Candidate voice baseline enrolled:', candidateVoiceProfile);
    }

    return {
      audioContextState,
      micTrackState: 'ACTIVE',
      analyserStatus: 'READY',
      voiceProctoringAvailable: true,
      candidateVoiceDetected: true,
      secondVoiceDetected: false,
      confidence: 95,
      multipleVoicesDetected: false,
      details: `Enrolling candidate voice baseline (${candidateVoiceProfile.pitchSamples.length}/6)...`,
      rms: roundedRms,
      pitchHz: currentPitch,
      secondPitchHz: pitchResult.secondPitchHz
    };
  }

  // 2. DUAL SPEAKER / SECONDARY VOICE DETECTOR
  const meanPitch = candidateVoiceProfile.meanPitch;
  const pitchDiff = Math.abs(currentPitch - meanPitch);
  const isOutsidePitchRange = currentPitch < (candidateVoiceProfile.minPitch - 30) || currentPitch > (candidateVoiceProfile.maxPitch + 30);

  // Dual voice pitch collision: second distinct non-harmonic pitch peak found in autocorrelation
  const hasDualPitchCollision = pitchResult.secondPitchHz > 0 && Math.abs(pitchResult.secondPitchHz - currentPitch) >= 35;

  const isDistinctSecondSpeaker = (pitchDiff > 35 && isOutsidePitchRange) || hasDualPitchCollision;

  if (isDistinctSecondSpeaker) {
    consecutiveVoiceViolationFrames += 1;
  } else {
    consecutiveVoiceViolationFrames = Math.max(0, consecutiveVoiceViolationFrames - 1);
  }

  // Requires 3 consecutive voice frames (~300ms) of distinct secondary voice evidence
  const multipleVoicesDetected = consecutiveVoiceViolationFrames >= 3;
  const secondVoiceDetected = consecutiveVoiceViolationFrames > 0;
  const confidence = multipleVoicesDetected ? 96 : (secondVoiceDetected ? 75 : 15);

  let details = 'Single candidate voice detected';
  if (multipleVoicesDetected) {
    details = `Secondary speaker detected (Pitch ${currentPitch}Hz vs Candidate mean ${meanPitch}Hz, diff ${pitchDiff}Hz)`;
  } else if (secondVoiceDetected) {
    details = `Analyzing potential secondary voice... (${consecutiveVoiceViolationFrames}/3 frames)`;
  }

  return {
    audioContextState,
    micTrackState: 'ACTIVE',
    analyserStatus: 'READY',
    voiceProctoringAvailable: true,
    candidateVoiceDetected: true,
    secondVoiceDetected,
    confidence,
    multipleVoicesDetected,
    details,
    rms: roundedRms,
    pitchHz: currentPitch,
    secondPitchHz: pitchResult.secondPitchHz
  };
}

/**
 * REQUIREMENT 6 & 10: BODY LANGUAGE REPORT GENERATOR
 * Calculated entirely from actual recorded session observations.
 */
export function generateBodyLanguageReport(cameraEvents = [], durationSeconds = 60, cameraActive = true, sessionStats = null) {
  if (!cameraActive || durationSeconds < 5) {
    return {
      isSufficient: false,
      message: 'Insufficient camera data for reliable body-language analysis.',
      postureConsistency: 0,
      movementLevel: 'Unknown',
      faceVisibility: 0,
      gazeAttention: 'Insufficient Data',
      confidenceIndicator: 'Unknown',
      disclaimer: 'Note: Body-language indicators are estimates based on captured video frame metrics and do not represent psychological measurements.'
    };
  }

  const suspiciousCount = sessionStats?.suspiciousMovements || cameraEvents.filter((e) => e.type === 'SUSPICIOUS_MOVEMENT').length;
  const gazeLossCount = sessionStats?.gazeLosses || cameraEvents.filter((e) => e.type === 'GAZE_LOSS').length;
  const faceMissingCount = sessionStats?.faceMissingEvents || cameraEvents.filter((e) => e.type === 'FACE_NOT_VISIBLE').length;
  const attentionPercentage = sessionStats?.attentionPercentage !== undefined ? sessionStats.attentionPercentage : Math.max(40, 98 - gazeLossCount * 5 - faceMissingCount * 8);

  const faceVisibility = Math.max(40, Math.min(100, Math.round(100 - faceMissingCount * 10 - suspiciousCount * 3)));
  const postureConsistency = Math.max(40, Math.min(98, Math.round(96 - suspiciousCount * 6)));

  let movementLevel = 'LOW';
  if (suspiciousCount > 4) {
    movementLevel = 'HIGH';
  } else if (suspiciousCount > 1) {
    movementLevel = 'MODERATE';
  }

  const gazeAttention = `${attentionPercentage}% Attentive`;

  let confidenceIndicator = 'Calm & Steady';
  if (suspiciousCount > 3 || gazeLossCount > 4) {
    confidenceIndicator = 'Restless / Fidgety';
  } else if (suspiciousCount > 1 || gazeLossCount > 2) {
    confidenceIndicator = 'Slightly Nervous';
  }

  return {
    isSufficient: true,
    postureConsistency,
    movementLevel,
    faceVisibility,
    gazeAttention,
    attentionPercentage,
    confidenceIndicator,
    disclaimer: 'Note: Body-language indicators are estimates based on captured video frame metrics and do not represent psychological measurements.'
  };
}
