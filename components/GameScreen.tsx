'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkles, ArrowLeft, ArrowRight, Lightbulb, Volume2, VolumeX, Mic, Camera, PartyPopper, Check, X } from 'lucide-react'
import { speak, stopSpeech, registerSpeakListener, prefetchTTS, preloadCommonPhrases, getTTSEnabled, setTTSEnabled } from '@/lib/tts'
import { startSTT, stopSTT, resolveSpokenChoice } from '@/lib/stt'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Phase = 
  | 'idle'
  | 'fetching-levels'
  | 'speaking-physical'
  | 'waiting-physical'
  | 'speaking-cognitive'
  | 'answering'
  | 'feedback'
  | 'complete'

/** Which upper-body gesture this round expects the patient to perform */
type GestureType = 'left-raise' | 'right-raise' | 'both-raise' | 'ear-cover' | 'none'

type CameraStatus = 'idle' | 'pending' | 'active' | 'denied'

interface Round {
  id: number
  domain: string
  physicalInstruction: string
  cognitiveQuestion: string
  correctAnswer: string
  choices: string[]
  /** Which upper-body gesture the webcam tracker watches for */
  gesture: GestureType
  /** Difficulty of the question */
  difficulty?: 'easy' | 'medium' | 'hard'
  level?: number
}

export interface SessionResult {
  roundId: number
  domain: string
  chosenAnswer: string
  correctAnswer: string
  isCorrect: boolean
  /** Domain 8 (Behaviour & Engagement) is implicitly logged via this hesitation time */
  reactionTimeMs: number
  /** Whether the webcam confirmed the physical gesture was held for ≥500 ms */
  physicalGestureConfirmed: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Static game data — 7 dual-task rounds strictly using the 4 approved gestures:
// 1. Raise left hand
// 2. Raise right hand
// 3. Touch both hands to ears
// 4. Raise both hands
// ─────────────────────────────────────────────────────────────────────────────

const ROUNDS: Round[] = [
  {
    id: 1,
    domain: 'Episodic Memory',
    physicalInstruction: 'Raise your LEFT hand',
    cognitiveQuestion: 'Which season comes after winter?',
    correctAnswer: 'Spring',
    choices: ['Spring', 'Summer', 'Autumn', 'Winter'],
    gesture: 'left-raise',
    difficulty: 'easy',
  },
  {
    id: 2,
    domain: 'Working Memory',
    physicalInstruction: 'Raise your RIGHT hand',
    cognitiveQuestion: 'Which was second: Tea, Silk, Apple?',
    correctAnswer: 'Silk',
    choices: ['Silk', 'Tea', 'Apple', 'Water'],
    gesture: 'right-raise',
    difficulty: 'easy',
  },
  {
    id: 3,
    domain: 'Attention',
    physicalInstruction: 'Raise BOTH hands',
    cognitiveQuestion: 'Which number is odd?',
    correctAnswer: '7',
    choices: ['4', '8', '7', '2'],
    gesture: 'both-raise',
    difficulty: 'easy',
  },
  {
    id: 4,
    domain: 'Executive Function',
    physicalInstruction: 'Touch both hands to your ears',
    cognitiveQuestion: 'What is the first step to make tea?',
    correctAnswer: 'Boil water',
    choices: ['Boil water', 'Pour tea', 'Wash cup', 'Drink tea'],
    gesture: 'ear-cover',
    difficulty: 'easy',
  },
  {
    id: 5,
    domain: 'Language',
    physicalInstruction: 'Raise your LEFT hand',
    cognitiveQuestion: "What is the opposite of 'Hot'?",
    correctAnswer: 'Cold',
    choices: ['Cold', 'Warm', 'Sunny', 'Bright'],
    gesture: 'left-raise',
    difficulty: 'easy',
  },
  {
    id: 6,
    domain: 'Visuospatial',
    physicalInstruction: 'Raise your RIGHT hand',
    cognitiveQuestion: 'Which object is shaped like a circle?',
    correctAnswer: 'Coin',
    choices: ['Coin', 'Book', 'Box', 'Door'],
    gesture: 'right-raise',
  },
  {
    id: 7,
    domain: 'Orientation',
    physicalInstruction: 'Touch both hands to your ears',
    cognitiveQuestion: 'What meal is eaten in the morning?',
    correctAnswer: 'Breakfast',
    choices: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    gesture: 'ear-cover',
  },
]

// MediaPipe landmark indices used for upper-body gesture detection
const LM = {
  NOSE:           0,
  LEFT_EYE:       2,
  RIGHT_EYE:      5,
  LEFT_EAR:       7,
  RIGHT_EAR:      8,
  LEFT_SHOULDER:  11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW:     13,
  RIGHT_ELBOW:    14,
  LEFT_WRIST:     15,
  RIGHT_WRIST:    16,
  LEFT_PINKY:     17,
  RIGHT_PINKY:    18,
  LEFT_INDEX:     19,
  RIGHT_INDEX:    20,
  LEFT_THUMB:     21,
  RIGHT_THUMB:    22,
} as const

/** How long (ms) the gesture must be held before it counts as confirmed */
const HOLD_MS = 350

interface Landmark { x: number; y: number; z: number; visibility?: number }

function isGestureActive(landmarks: Landmark[], gesture: GestureType): boolean {
  if (gesture === 'none') return false
  const ls = landmarks[LM.LEFT_SHOULDER]
  const rs = landmarks[LM.RIGHT_SHOULDER]
  const lw = landmarks[LM.LEFT_WRIST]
  const rw = landmarks[LM.RIGHT_WRIST]
  const nose = landmarks[LM.NOSE]
  if (!ls || !rs) return false

  // All hand & finger landmarks (Index, Thumb, Pinky, Wrist)
  const leftHandPoints = [
    landmarks[LM.LEFT_INDEX],
    landmarks[LM.LEFT_THUMB],
    landmarks[LM.LEFT_PINKY],
    landmarks[LM.LEFT_WRIST],
  ].filter(Boolean)

  const rightHandPoints = [
    landmarks[LM.RIGHT_INDEX],
    landmarks[LM.RIGHT_THUMB],
    landmarks[LM.RIGHT_PINKY],
    landmarks[LM.RIGHT_WRIST],
  ].filter(Boolean)

  const allHandPoints = [...leftHandPoints, ...rightHandPoints]

  // In MediaPipe's normalised coordinate space, y=0 is top.
  // "hand above shoulder" → any hand point y < shoulder.y
  const leftRaised  = leftHandPoints.some(p => p.y < ls.y && (p.visibility ?? 0) > 0.3)
  const rightRaised = rightHandPoints.some(p => p.y < rs.y && (p.visibility ?? 0) > 0.3)

  // Shoulder touch: require any hand/wrist near either shoulder
  const SHOULDER_TOUCH_THRESHOLD = 0.28
  const leftHandNearShoulders = leftHandPoints.some(p => 
    p.y < ls.y + 0.35 && (Math.abs(p.x - ls.x) < SHOULDER_TOUCH_THRESHOLD || Math.abs(p.x - rs.x) < SHOULDER_TOUCH_THRESHOLD)
  )
  const rightHandNearShoulders = rightHandPoints.some(p => 
    p.y < rs.y + 0.35 && (Math.abs(p.x - ls.x) < SHOULDER_TOUCH_THRESHOLD || Math.abs(p.x - rs.x) < SHOULDER_TOUCH_THRESHOLD)
  )
  const bothShouldersTouched = leftHandNearShoulders || rightHandNearShoulders

  // ── Head Tilt Detection ───────────────────────────────────────────────────
  let headTiltedLeft = false
  let headTiltedRight = false

  const leftEye  = landmarks[LM.LEFT_EYE]
  const rightEye = landmarks[LM.RIGHT_EYE]
  const leftEar  = landmarks[LM.LEFT_EAR]
  const rightEar = landmarks[LM.RIGHT_EAR]

  if (leftEye && rightEye) {
    const eyeDy = leftEye.y - rightEye.y
    const eyeDx = Math.abs(leftEye.x - rightEye.x) || 0.1
    const eyeSlope = eyeDy / eyeDx

    if (eyeSlope > 0.07 || eyeDy > 0.015) {
      headTiltedLeft = true
    } else if (eyeSlope < -0.07 || eyeDy < -0.015) {
      headTiltedRight = true
    }
  }

  if (!headTiltedLeft && !headTiltedRight && leftEar && rightEar) {
    const earDy = leftEar.y - rightEar.y
    if (earDy > 0.02) headTiltedLeft = true
    else if (earDy < -0.02) headTiltedRight = true
  }

  if (!headTiltedLeft && !headTiltedRight && nose) {
    const shoulderMidX = (ls.x + rs.x) / 2
    const shoulderWidth = Math.abs(rs.x - ls.x) || 0.3
    const noseOffset = (nose.x - shoulderMidX) / shoulderWidth
    if (noseOffset > 0.06) headTiltedLeft = true
    else if (noseOffset < -0.06) headTiltedRight = true
  }

  // ── Touch Both Hands to Ears ──────────────────────────────────────────────
  const EAR_TOUCH_DISTANCE = 0.28
  const leftHandTouchesLeftEar = leftEar && leftHandPoints.some(p => Math.hypot(p.x - leftEar.x, p.y - leftEar.y) < EAR_TOUCH_DISTANCE || (p.y < ls.y && Math.abs(p.x - leftEar.x) < 0.22))
  const rightHandTouchesRightEar = rightEar && rightHandPoints.some(p => Math.hypot(p.x - rightEar.x, p.y - rightEar.y) < EAR_TOUCH_DISTANCE || (p.y < rs.y && Math.abs(p.x - rightEar.x) < 0.22))
  const bothHandsTouchEars = (leftHandTouchesLeftEar && rightHandTouchesRightEar) || 
    (leftHandTouchesLeftEar && rightHandPoints.some(p => p.y < rs.y)) || 
    (rightHandTouchesRightEar && leftHandPoints.some(p => p.y < ls.y))

  switch (gesture) {
    case 'left-raise':      return leftRaised
    case 'right-raise':     return rightRaised
    case 'both-raise':      return leftRaised && rightRaised
    case 'ear-cover':       return !!bothHandsTouchEars
    default:                return false
  }
}

const GESTURE_LABELS: Record<GestureType, string> = {
  'left-raise':      '✓ Left hand raised!',
  'right-raise':     '✓ Right hand raised!',
  'both-raise':      '✓ Both hands raised!',
  'ear-cover':       '✓ Touched both hands to ears!',
  'none':            '',
}

const GESTURE_PROMPTS: Record<GestureType, string> = {
  'left-raise':      'Raise your LEFT hand',
  'right-raise':     'Raise your RIGHT hand',
  'both-raise':      'Raise BOTH hands',
  'ear-cover':       'Touch both hands to your ears',
  'none':            '',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface GameScreenProps {
  patientId: string
  patientHistory: any[]
  preferences?: any
  onComplete?: (results: SessionResult[]) => void
  autoStart?: boolean
  defaultGameMode?: 'strict' | 'guide'
}


export default function GameScreen({ patientId, patientHistory, preferences, onComplete, autoStart, defaultGameMode = 'guide' }: GameScreenProps) {
  // ── Game state ────────────────────────────────────────────────────────────
  const [phase, setPhase]           = useState<Phase>('idle')
  const [gameMode, setGameMode]     = useState<'strict' | 'guide'>(defaultGameMode)
  const [rounds, setRounds]         = useState<Round[]>(ROUNDS)
  const [roundIndex, setRoundIndex] = useState(0)
  const [lastAnswer, setLastAnswer] = useState<{ chosen: string; correct: boolean } | null>(null)
  const [guideHighlightActive, setGuideHighlightActive] = useState(false)
  const [subtitle, setSubtitle] = useState('')
  const [ttsOn, setTtsOn] = useState<boolean>(true)

  useEffect(() => {
    setTtsOn(getTTSEnabled())
    const handleTtsChange = () => setTtsOn(getTTSEnabled())
    window.addEventListener('tts_toggle_changed', handleTtsChange)
    return () => window.removeEventListener('tts_toggle_changed', handleTtsChange)
  }, [])

  useEffect(() => {
    preloadCommonPhrases()
    const unsubscribe = registerSpeakListener((text: string) => setSubtitle(text))
    return () => { unsubscribe() }
  }, [])
  
  // Streak & Celebration State
  const [streakData, setStreakData] = useState<{ current_streak: number; longest_streak: number; is_new_day: boolean; was_protected?: boolean } | null>(null)
  const [isPersonalized, setIsPersonalized] = useState(false)
  
  const playChime = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error('Audio chime failed:', e);
    }
  }, []);

  // ── Camera / pose state ───────────────────────────────────────────────────
  const [cameraStatus, setCameraStatus]     = useState<CameraStatus>('idle')
  const [poseLabel, setPoseLabel]           = useState('Waiting for action...')
  const [physicalConfirmed, setPhysicalConfirmed] = useState(false)
  const [isListening, setIsListening]       = useState(false)
  const [spokenText, setSpokenText]         = useState('')

  // ── Refs (stable across renders) ──────────────────────────────────────────
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poseRef    = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef  = useRef<any>(null)

  const choiceShownAtRef      = useRef<number>(0)
  const resultsRef            = useRef<SessionResult[]>([])
  const gestureStartRef       = useRef<number | null>(null)
  const physicalConfirmedRef  = useRef(false)
  // Avoids stale closure inside the MediaPipe onResults callback
  const currentGestureRef     = useRef<GestureType>('none')

  // ── Camera lazy-init: only start when game is actually running ──────────
  const cameraInitializedRef = useRef(false)
  const isMountedRef         = useRef(true)

  const stopCamera = useCallback(() => {
    try {
      cameraRef.current?.stop()
      poseRef.current?.close()
    } catch (e) {}
    cameraRef.current = null
    poseRef.current   = null
    cameraInitializedRef.current = false
    setCameraStatus('idle')
  }, [])

  useEffect(() => {
    const shouldRun = phase !== 'idle' && phase !== 'complete' && phase !== 'fetching-levels'

    if (shouldRun && !cameraInitializedRef.current) {
      cameraInitializedRef.current = true

      async function initPose() {
        if (!videoRef.current || !canvasRef.current) return
        setCameraStatus('pending')

        try {
          const [
            { Pose, POSE_CONNECTIONS },
            { Camera },
            { drawConnectors, drawLandmarks },
          ] = await Promise.all([
            import('@mediapipe/pose'),
            import('@mediapipe/camera_utils'),
            import('@mediapipe/drawing_utils'),
          ])

          if (!isMountedRef.current || !cameraInitializedRef.current) return

          const pose = new Pose({
            locateFile: (file: string) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
          })

          pose.setOptions({
            modelComplexity:        1,
            smoothLandmarks:        true,
            enableSegmentation:     false,
            minDetectionConfidence: 0.65,
            minTrackingConfidence:  0.5,
          })

          pose.onResults((results: any) => {
            if (!isMountedRef.current || !cameraInitializedRef.current || !canvasRef.current) return
            const canvas = canvasRef.current
            const ctx    = canvas.getContext('2d')
            if (!ctx) return

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (results.poseLandmarks) {
              drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
                color: '#3b82f6',
                lineWidth: 3,
              })
              drawLandmarks(ctx, results.poseLandmarks, {
                color: '#ef4444',
                lineWidth: 2,
                radius: 5,
              })

              const gesture  = currentGestureRef.current
              const detected = isGestureActive(results.poseLandmarks, gesture)

              if (gesture !== 'none' && !physicalConfirmedRef.current) {
                if (detected) {
                  if (gestureStartRef.current === null) {
                    gestureStartRef.current = Date.now()
                  } else if (Date.now() - gestureStartRef.current >= HOLD_MS) {
                    physicalConfirmedRef.current = true
                    setPhysicalConfirmed(true)
                    setPoseLabel(GESTURE_LABELS[gesture])
                  }
                } else {
                  gestureStartRef.current = null
                }
              }
            }
          })

          poseRef.current = pose

          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && poseRef.current && cameraInitializedRef.current && isMountedRef.current) {
                try {
                  await poseRef.current.send({ image: videoRef.current })
                } catch (frameErr) {
                  console.warn('[MediaPipe frame send error]:', frameErr)
                }
              }
            },
            width:      640,
            height:     480,
            facingMode: 'user',
          })

          await camera.start()
          cameraRef.current = camera
          if (isMountedRef.current && cameraInitializedRef.current) {
            setCameraStatus('active')
          }
        } catch (err) {
          console.warn('[GameScreen] Camera/MediaPipe init failed:', err)
          if (isMountedRef.current) setCameraStatus('denied')
        }
      }

      initPose()
    } else if (!shouldRun && cameraInitializedRef.current) {
      stopCamera()
    }
  }, [phase, stopCamera])

  // ── Component unmount cleanup ─────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      stopCamera()
      stopSpeech()
    }
  }, [stopCamera, stopSpeech])

  const currentRound = rounds[roundIndex]
  const totalRounds  = rounds.length
  
  // Any phase past idle and before complete
  const isActivePhase = phase !== 'idle' && phase !== 'complete' && phase !== 'fetching-levels'

  // Should we show the cognitive question card and answer buttons?
  const showCognitive = phase === 'speaking-cognitive' || phase === 'answering' || phase === 'feedback'

  // ── Keep gesture ref in sync + reset per round ───────────────────────────
  useEffect(() => {
    currentGestureRef.current    = rounds[roundIndex]?.gesture ?? 'none'
    gestureStartRef.current      = null
    physicalConfirmedRef.current = false
    setPhysicalConfirmed(false)
    setPoseLabel('Waiting for action...')
  }, [roundIndex])



  // ── Game logic ────────────────────────────────────────────────────────────

  // Helper to strictly separate rounds into Phase 1 (Pure Physical Motor Warmups) and Phase 2 (Pure Cognitive Questions)
  const separateRounds = (rawRounds: Round[]): Round[] => {
    const separated: Round[] = []
    
    // Phase 1: Pure Physical Warmup Rounds (strictly limited to the 4 approved gestures)
    const sanitizePhysicalGesture = (g: any): { gesture: GestureType; instruction: string } => {
      if (g === 'left-raise') return { gesture: 'left-raise', instruction: 'Raise your LEFT hand' }
      if (g === 'right-raise') return { gesture: 'right-raise', instruction: 'Raise your RIGHT hand' }
      if (g === 'both-raise') return { gesture: 'both-raise', instruction: 'Raise BOTH hands' }
      if (g === 'ear-cover' || g === 'nose-touch' || g === 'shoulder-touch') return { gesture: 'ear-cover', instruction: 'Touch both hands to your ears' }
      if (g === 'head-tilt-left') return { gesture: 'left-raise', instruction: 'Raise your LEFT hand' }
      if (g === 'head-tilt-right') return { gesture: 'right-raise', instruction: 'Raise your RIGHT hand' }
      return { gesture: 'both-raise', instruction: 'Raise BOTH hands' }
    }

    const physicalCandidates = rawRounds.filter(r => r.gesture && r.gesture !== 'none' && r.physicalInstruction)
    const sourcePhysical = (physicalCandidates.length > 0 ? physicalCandidates : rawRounds.filter(r => r.physicalInstruction)).slice(0, 3)
    
    sourcePhysical.forEach((r) => {
      const { gesture, instruction } = sanitizePhysicalGesture(r.gesture)
      separated.push({
        id: separated.length + 1,
        domain: `Motor Warmup: ${r.domain.replace(/^(Warmup|Cognitive|Motor Warmup):\s*/i, '')}`,
        physicalInstruction: instruction,
        gesture: gesture,
        cognitiveQuestion: '',
        correctAnswer: 'none',
        choices: [],
        difficulty: r.difficulty || 'easy',
      })
    })

    // Phase 2: Pure Cognitive Question Rounds (no physical gestures or camera requirements)
    const cognitiveCandidates = rawRounds.filter(r => r.cognitiveQuestion && r.cognitiveQuestion.trim().length > 0 && r.choices && r.choices.length > 0)
    const sourceCognitive = cognitiveCandidates.length > 0 ? cognitiveCandidates : rawRounds.filter(r => r.correctAnswer && r.correctAnswer !== 'none')
    
    sourceCognitive.forEach((r) => {
      separated.push({
        id: separated.length + 1,
        domain: r.domain.replace(/^(Warmup|Cognitive|Motor Warmup):\s*/i, ''),
        physicalInstruction: '',
        gesture: 'none',
        cognitiveQuestion: r.cognitiveQuestion,
        correctAnswer: r.correctAnswer,
        choices: r.choices,
        difficulty: r.difficulty || 'easy',
      })
    })
    
    // Re-index levels and IDs sequentially
    return separated.map((r, i) => ({ ...r, level: i + 1, id: i + 1 }))
  }

  // Ref used to trigger startRound after state settles (avoids stale closure in setTimeout)
  const pendingStartRef = useRef(false)

  const fetchLevelsAndStart = useCallback(async () => {
    setPhase('fetching-levels')
    resultsRef.current = []
    setRoundIndex(0)

    try {
      const recentQuestions = patientHistory
        .flatMap(session => session.results || session.round_results || [])
        .map(r => r.cognitiveQuestion || r.cognitive_question)
        .filter(Boolean)
        .slice(-10)

      const res = await fetch('/api/generate-levels', {
        method: 'POST',
        cache: 'no-store', // Force no caching
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({ 
          history: patientHistory, 
          patientId, 
          recentQuestions,
          randomSeed: Math.random(),
          forcedTopic: ["morning weather", "a trip to the market", "cooking dinner", "visiting a neighbor", "cleaning the house"][Math.floor(Math.random() * 5)]
        }),
      })
      if (!res.ok) throw new Error('Failed to generate levels')
      const data = await res.json()
      let preparedRounds: Round[] = []
      if (data && data.levels && data.levels.length > 0) {
        preparedRounds = separateRounds(data.levels)
      } else {
        preparedRounds = separateRounds(ROUNDS)
      }
      setRounds(preparedRounds)

      // Background prefetch audio for all rounds so speech playback is 0ms instant
      preparedRounds.forEach((r, idx) => {
        if (r.gesture !== 'none') {
          prefetchTTS(`Round ${idx + 1} of ${preparedRounds.length}. Physical task: ${r.physicalInstruction}. `)
        } else {
          prefetchTTS(`Round ${idx + 1} of ${preparedRounds.length}. ${r.cognitiveQuestion}`)
        }
      })
      
      if (data?.isPersonalized) {
        setIsPersonalized(true)
      }

      // ASYNC: Fire-and-forget background replenishment for the NEXT session
      const diff = data?.difficulty || 'easy'
      fetch('/api/replenish-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: diff, count: 6 }),
      }).catch((e) => console.warn('[Background replenish error]:', e))

    } catch (err) {
      console.error('API failed, falling back to static rounds:', err)
      const fallbackPrepared = separateRounds(ROUNDS)
      setRounds(fallbackPrepared)
      fallbackPrepared.forEach((r, idx) => {
        if (r.gesture !== 'none') {
          prefetchTTS(`Round ${idx + 1} of ${fallbackPrepared.length}. Physical task: ${r.physicalInstruction}. `)
        } else {
          prefetchTTS(`Round ${idx + 1} of ${fallbackPrepared.length}. ${r.cognitiveQuestion}`)
        }
      })
    }
    // Signal the effect below to call startRound once state commits
    pendingStartRef.current = true
    setPhase('speaking-physical')
  }, [patientHistory, patientId])

  useEffect(() => {
    if (autoStart && phase === 'idle') {
      fetchLevelsAndStart()
    }
  }, [autoStart, phase, fetchLevelsAndStart])

  const startRound = useCallback((index: number, latestRounds?: Round[]) => {
    const roundsList = latestRounds ?? rounds
    setLastAnswer(null)
    hasAdvancedToCognitiveRef.current = false

    const round = roundsList[index]
    if (!round) return

    const isCognitiveOnly = round.gesture === 'none' || (round.correctAnswer !== 'none' && !round.physicalInstruction)

    if (isCognitiveOnly) {
      // Pure cognitive round: directly speak cognitive question
      setPhase('speaking-cognitive')
      const prompt = `Round ${index + 1} of ${roundsList.length}. ${round.cognitiveQuestion}`
      speak(prompt, () => {
        choiceShownAtRef.current = Date.now()
        setPhase('answering')
      })
      return
    }

    // Pure physical round
    setPhase('speaking-physical')
    const fullPrompt =
      `Round ${index + 1} of ${roundsList.length}. ` +
      `Physical task: ${round.physicalInstruction}. `

    speak(fullPrompt, () => {
      setPhase('waiting-physical')
    })
  }, [rounds])

  // When fetchLevelsAndStart sets phase to 'speaking-physical' with pendingStartRef=true,
  // we speak the prompt using the freshly-set rounds state
  useEffect(() => {
    if (phase === 'speaking-physical' && pendingStartRef.current) {
      pendingStartRef.current = false
      setLastAnswer(null)
      const round = rounds[0]
      if (round) {
        hasAdvancedToCognitiveRef.current = false
        const isCognitiveOnly = round.gesture === 'none' || !round.physicalInstruction
        if (isCognitiveOnly) {
          setPhase('speaking-cognitive')
          const prompt = `Round 1 of ${rounds.length}. ${round.cognitiveQuestion}`
          speak(prompt, () => {
            choiceShownAtRef.current = Date.now()
            setPhase('answering')
          })
        } else {
          setPhase('speaking-physical')
          const fullPrompt = `Round 1 of ${rounds.length}. Physical task: ${round.physicalInstruction}. `
          speak(fullPrompt, () => setPhase('waiting-physical'))
        }
      }
    }
  }, [phase, rounds])

  const hasAdvancedToCognitiveRef = useRef(false)
  useEffect(() => { hasAdvancedToCognitiveRef.current = false }, [roundIndex])

  const handleAnswer = useCallback(
    (chosen: string, roundOverride?: Round) => {
      const round = roundOverride || currentRound
      if (!round) return
      
      // Prevent multiple answer submissions for the same round (e.g. double-click or click + voice)
      if (resultsRef.current.some(r => r.roundId === round.id)) return

      const isPhysicalRound = round.correctAnswer === 'none' || (round.gesture !== 'none' && !round.cognitiveQuestion)
      const reactionTimeMs = isPhysicalRound ? 0 : Date.now() - choiceShownAtRef.current
      const isCorrect = isPhysicalRound 
        ? (chosen === 'completed' || physicalConfirmedRef.current)
        : (chosen === round.correctAnswer)

      resultsRef.current.push({
        roundId:                  round.id,
        domain:                   round.domain,
        chosenAnswer:             chosen,
        correctAnswer:            round.correctAnswer,
        isCorrect,
        reactionTimeMs,
        physicalGestureConfirmed: isPhysicalRound ? (chosen === 'completed' || physicalConfirmedRef.current) : false,
      })

      setLastAnswer({ chosen, correct: isCorrect })
      setPhase('feedback')

      const feedbackText = isPhysicalRound
        ? (isCorrect ? 'Great job! Task completed.' : 'Moving to the next task.')
        : isCorrect
          ? 'Correct! Well done.'
          : `Not quite. The answer was ${round.correctAnswer}.`

      // Guaranteed minimum visual delay of 3 seconds so the patient can clearly see the green/red highlight
      const MIN_VISUAL_DELAY_MS = 3000
      let speechFinished = false
      let timerFinished = false
      let advanced = false

      const tryAdvance = async () => {
        if (advanced) return
        if (!speechFinished || !timerFinished) return
        advanced = true

        const nextIndex = rounds.findIndex(r => r.id === round.id) + 1
        if (nextIndex >= totalRounds) {
          setPhase('complete')
          
          // Save to Supabase
          try {
            const { saveGameSession, updatePatientStreak } = await import('@/lib/db')
            await saveGameSession(patientId, resultsRef.current)
            const streak = await updatePatientStreak(patientId)
            if (streak) {
              setStreakData(streak)
              if (streak.is_new_day) playChime()
            }
          } catch (e) {
            console.error('Failed to save session:', e)
          }

        } else {
          setRoundIndex(nextIndex)
          startRound(nextIndex)
        }
      }

      setTimeout(() => {
        timerFinished = true
        tryAdvance()
      }, MIN_VISUAL_DELAY_MS)

      speak(feedbackText, () => {
        speechFinished = true
        tryAdvance()
      })
    },
    [currentRound, rounds, totalRounds, onComplete, patientId, startRound, playChime],
  )

  // ── Guide Mode: Delay before highlighting the correct answer (gives patient time to try first) ──
  useEffect(() => {
    if (phase === 'answering' && gameMode === 'guide') {
      setGuideHighlightActive(false)
      const timer = setTimeout(() => {
        setGuideHighlightActive(true)
      }, 3500) // 3.5-second delay before hint activates
      return () => clearTimeout(timer)
    } else {
      setGuideHighlightActive(false)
    }
  }, [phase, gameMode, roundIndex])

  // ── Auto-advance when physical gesture confirmed ─────────────────────────
  useEffect(() => {
    if (phase === 'waiting-physical' && physicalConfirmed) {
      // Small delay so the user sees the green checkmark before advancing
      const timer = setTimeout(() => {
        handleAnswer('completed')
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [phase, physicalConfirmed, handleAnswer])

  // ── Speech Recognition Engine (Dual Web Speech + Whisper Fallback) ──────
  const handleAnswerRef = useRef(handleAnswer)
  useEffect(() => { handleAnswerRef.current = handleAnswer }, [handleAnswer])
  
  const currentRoundRef = useRef(currentRound)
  useEffect(() => { currentRoundRef.current = currentRound }, [currentRound])

  const stopListening = useCallback(() => {
    setIsListening(false)
    stopSTT()
  }, [])

  const startListening = useCallback(async () => {
    stopListening()
    setIsListening(true)
    setSpokenText('')

    startSTT({
      continuous: true,
      timeoutMs: 30000,
      onInterim: (interimText) => {
        setSpokenText(interimText)
        const choices = currentRoundRef.current?.choices || []
        const matched = resolveSpokenChoice(interimText, choices)
        if (matched) {
          stopListening()
          handleAnswerRef.current(matched)
        }
      },
      onTranscript: (finalText) => {
        setSpokenText(finalText)
        const choices = currentRoundRef.current?.choices || []
        const matched = resolveSpokenChoice(finalText, choices)
        if (matched) {
          stopListening()
          handleAnswerRef.current(matched)
        }
      },
      onError: (err) => {
        console.warn('[GameScreen STT Error]:', err)
      },
    })
  }, [stopListening])

  // Lifecycle trigger when entering/leaving answering phase
  useEffect(() => {
    if (phase === 'answering') {
      const timer = setTimeout(() => {
        startListening()
      }, 150)
      return () => {
        clearTimeout(timer)
        stopListening()
      }
    } else {
      stopListening()
    }
  }, [phase, startListening, stopListening])

  // ── Progress ──────────────────────────────────────────────────────────────

  const progressPct =
    phase === 'complete'
      ? 100
      : Math.round((roundIndex / totalRounds) * 100)

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  //
  // IMPORTANT: <video> and <canvas> are ALWAYS in the DOM (never inside a
  // conditional block) so their refs remain stable across phase changes.
  // We use `display: none` (not conditional JSX removal) to show/hide the
  // camera section, which does NOT cause React to unmount/remount the elements.
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 px-2 pb-6">

      {/* ════════════════════════════════════════════════════════════════════
          IDLE screen
          ════════════════════════════════════════════════════════════════════ */}
      {phase === 'idle' && (
        <div className="flex flex-col items-center justify-center gap-4 py-6 px-2 text-center">
          <div
            aria-hidden="true"
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: '#DBEAFE' }}
          >
            🧠
          </div>

          <h1
            className="font-bold tracking-tight"
            style={{ fontSize: 'var(--font-size-accessible-3xl)', color: 'var(--color-content-primary)' }}
          >
            Simon Says
          </h1>

          <p className="text-xl mb-6 font-medium max-w-xl text-balance" style={{ color: 'var(--color-content-secondary)' }}>
            Are you ready for your personalized dual-task exercise today? We'll test your memory, balance, and quick thinking.
          </p>

          {cameraStatus === 'denied' && (
            <p
              role="alert"
              style={{
                fontSize: 'var(--font-size-accessible-sm)',
                color: '#854D0E',
                backgroundColor: '#FEF9C3',
                border: '2px solid #FDE047',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                maxWidth: '28rem',
                fontWeight: 600,
              }}
            >
              📷 Camera unavailable — you can still play using the answer buttons.
            </p>
          )}

          {/* ── Mode Selector ────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '28rem' }}>
            <p style={{ fontSize: 'var(--font-size-accessible-sm)', fontWeight: 700, color: 'var(--color-content-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Select Mode
            </p>
            <div role="group" aria-label="Game mode" style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              {(['guide', 'strict'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  id={`mode-select-${m}`}
                  aria-pressed={gameMode === m}
                  onClick={() => setGameMode(m)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    border: `2px solid ${gameMode === m ? (m === 'guide' ? '#7C3AED' : 'var(--color-accessible-blue)') : '#E2E8F0'}`,
                    backgroundColor: gameMode === m ? (m === 'guide' ? '#EDE9FE' : '#DBEAFE') : '#F8FAFC',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 'var(--font-size-accessible-sm)',
                    color: gameMode === m ? (m === 'guide' ? '#5B21B6' : '#1E40AF') : '#64748B',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span style={{ fontSize: '1.75rem' }}>{m === 'strict' ? '🎯' : '💡'}</span>
                  <span>{m === 'strict' ? 'Strict Mode' : 'Guide Mode'}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.75 }}>
                    {m === 'strict' ? 'No hints — real assessment' : 'Hints highlighted after a delay'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            id="start-game-btn"
            className="btn-accessible-primary"
            onClick={fetchLevelsAndStart}
            aria-label="Start the Simon Says game"
          >
            ▶ &nbsp; Let's Start
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          FETCHING screen
          ════════════════════════════════════════════════════════════════════ */}
      {phase === 'fetching-levels' && (
        <div className="flex flex-col items-center justify-center gap-4 py-6 px-2 text-center">
          <div
            aria-hidden="true"
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: '#DBEAFE' }}
          >
            <span style={{ animation: 'spin 3s linear infinite' }}>⚙️</span>
          </div>
          <h1
            className="font-extrabold tracking-tight"
            style={{ fontSize: '2.5rem', color: 'var(--color-accessible-blue)' }}
          >
            Preparing personalized exercise...
          </h1>
          <p className="text-xl mb-6 font-medium max-w-xl" style={{ color: 'var(--color-content-secondary)' }}>
            Our clinical AI is reviewing your past sessions and personal preferences to generate the perfect difficulty level for you today.
          </p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          COMPLETE screen
          ════════════════════════════════════════════════════════════════════ */}
      {phase === 'complete' && (
        <div className="flex flex-col items-center justify-center gap-4 py-6 px-2 text-center">
          <div
            aria-hidden="true"
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            🎉
          </div>

          <h1
            className="font-bold"
            style={{ fontSize: 'var(--font-size-accessible-3xl)', color: 'var(--color-content-primary)' }}
          >
            All Done!
          </h1>

          <p style={{ fontSize: 'var(--font-size-accessible-lg)', color: 'var(--color-content-secondary)' }}>
            You completed the exercise session! Here is your summary:
          </p>

          {/* Session summary card */}
          <div
            className="card-accessible w-full max-w-sm text-left"
            role="region"
            aria-label="Session summary"
          >
            <p
              className="font-semibold mb-3"
              style={{ fontSize: 'var(--font-size-accessible-base)', color: 'var(--color-content-primary)' }}
            >
              Session summary
            </p>
            <ul className="space-y-2">
              {resultsRef.current.map((r) => {
                const isPhysical = r.correctAnswer === 'none'
                return (
                  <li
                    key={r.roundId}
                    className="flex items-start gap-3"
                    style={{ fontSize: 'var(--font-size-accessible-sm)', color: 'var(--color-content-secondary)' }}
                  >
                    <span aria-hidden="true">{r.isCorrect ? '✅' : '❌'}</span>
                    <span>
                      Round {r.roundId} — {r.domain} — {isPhysical 
                        ? (r.physicalGestureConfirmed ? 'Physical task completed ✓' : 'Physical task skipped')
                        : (r.isCorrect ? 'Correct ✓' : `Wrong (${r.correctAnswer})`)}
                      {!isPhysical && ` — ${(r.reactionTimeMs / 1000).toFixed(1)}s`}
                    </span>
                  </li>
                )
              })}
            </ul>
            <p
              className="mt-4 pt-4"
              style={{ fontSize: 'var(--font-size-accessible-sm)', color: 'var(--color-content-muted)', borderTop: '2px solid #e2e8f0' }}
            >
              {(() => {
                const cognitiveResults = resultsRef.current.filter(r => r.correctAnswer !== 'none')
                const physicalResults = resultsRef.current.filter(r => r.correctAnswer === 'none')
                const avgRt = cognitiveResults.length > 0
                  ? (Math.round(cognitiveResults.reduce((s, r) => s + r.reactionTimeMs, 0) / cognitiveResults.length / 100) / 10).toFixed(1)
                  : '0.0'
                const gesturesDone = resultsRef.current.filter(r => r.physicalGestureConfirmed).length
                return (
                  <>
                    Avg response time: <strong>{avgRt}s</strong>
                    {physicalResults.length > 0 && (
                      <>
                        &nbsp;·&nbsp;Physical tasks: <strong>{gesturesDone}/{physicalResults.length}</strong>
                      </>
                    )}
                  </>
                )
              })()}
            </p>
          </div>

          <button
            type="button"
            id="restart-game-btn"
            className="btn-accessible-secondary"
            onClick={() => {
              if (onComplete) {
                onComplete(resultsRef.current)
              } else {
                resultsRef.current = []
                setRoundIndex(0)
                setLastAnswer(null)
                startRound(0)
              }
            }}
            aria-label={onComplete ? "Continue to next step" : "Restart the game from the beginning"}
          >
            {onComplete ? 'Continue ➔' : '↩  Play Again'}
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ACTIVE ROUND
          ════════════════════════════════════════════════════════════════════ */}
      {isActivePhase && (
        <>
          {/* Header & Progress bar */}
          <div className="flex flex-col gap-3 mb-2">
            
            {isPersonalized && (
              <div className="mb-2 inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-4 py-2 rounded-full font-bold text-sm shadow-sm border border-purple-200">
                <span className="text-lg">✨</span> Personalized Level Loaded for Patient
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className="px-4 py-1.5 rounded-full font-extrabold text-xs sm:text-sm border-2 shadow-2xs flex items-center gap-1.5"
                style={{
                  backgroundColor: currentRound?.gesture !== 'none' ? '#E8EFEA' : '#FFF8EC',
                  color: currentRound?.gesture !== 'none' ? '#577361' : '#D9A441',
                  borderColor: currentRound?.gesture !== 'none' ? '#D4E4DC' : '#FDE6BA',
                }}
              >
                <span>{currentRound?.gesture !== 'none' ? '🧘 Physical Task' : '🧠 Brain Puzzle'}</span>
                <span>&bull;</span>
                <span>Round {roundIndex + 1} of {totalRounds}</span>
                <span>&bull;</span>
                <span>{currentRound?.domain}</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = !ttsOn
                    setTtsOn(next)
                    setTTSEnabled(next)
                  }}
                  title={ttsOn ? "Voice Dictation: ON (Click to mute)" : "Voice Dictation: MUTED (Click to unmute)"}
                  className={`px-3.5 py-1.5 rounded-full transition cursor-pointer border shadow-2xs flex items-center gap-1.5 text-xs font-bold ${
                    ttsOn 
                      ? 'bg-[#E8EFEA] text-[#6F8F7A] border-[#D4E4DC] hover:bg-[#D4E4DC]' 
                      : 'bg-[#F7F4EC] text-[#6B7C73] border-[#E3DEC3] hover:bg-[#EBE6D8]'
                  }`}
                >
                  {ttsOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  <span>{ttsOn ? 'Voice On' : 'Muted'}</span>
                </button>

                <span className="text-xs sm:text-sm font-bold text-[#6B7C73]">
                  {progressPct}%
                </span>
              </div>
            </div>
            
            <div
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Round ${roundIndex + 1} of ${totalRounds}`}
              className="w-full rounded-full overflow-hidden p-0.5 bg-[#EBE6D8]"
              style={{ height: '14px' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${progressPct}%`, backgroundColor: currentRound?.gesture !== 'none' ? '#6F8F7A' : '#D9A441' }}
              />
            </div>
          </div>

          {/* Physical instruction card (Only shown on physical rounds) */}
          {currentRound?.gesture !== 'none' && (
            <section className="card-accessible bg-[#FFFDF7] border-2 border-[#EBE6D8] rounded-3xl p-6 md:p-8 shadow-xs" aria-labelledby="physical-label">
              <div className="flex items-center justify-between mb-3">
                <p
                  id="physical-label"
                  className="uppercase tracking-widest font-extrabold m-0 text-xs sm:text-sm text-[#6F8F7A]"
                >
                  🧘 Gentle Movement Warm-up
                </p>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#E8EFEA] text-[#577361] uppercase tracking-wide border border-[#D4E4DC]">
                  {currentRound?.domain}
                </span>
              </div>
              <p
                className="font-extrabold leading-snug text-2xl sm:text-3xl text-[#29352F]"
              >
                {currentRound?.physicalInstruction}
              </p>

            {/* Guide mode: slow-blinking gesture hint */}
            {gameMode === 'guide' && phase === 'waiting-physical' && (
              <div
                role="note"
                aria-label={`Guide hint: ${GESTURE_PROMPTS[currentRound.gesture]}`}
                className="mt-4 p-4 rounded-2xl bg-[#FFF8EC] border-2 border-[#FDE6BA] flex items-center gap-3 shadow-xs"
                style={{ animation: 'guide-blink 2s ease-in-out infinite' }}
              >
                <span className="flex items-center text-[#D9A441]">
                  {currentRound.gesture === 'left-raise'  && <ArrowLeft size={28} />}
                  {currentRound.gesture === 'right-raise' && <ArrowRight size={28} />}
                  {currentRound.gesture === 'both-raise'  && <div className="flex gap-1"><ArrowLeft size={24} /><ArrowRight size={24} /></div>}
                  {currentRound.gesture === 'ear-cover'   && <div className="text-2xl">👂</div>}
                </span>
                <div>
                  <p className="m-0 font-extrabold text-xs sm:text-sm text-[#D9A441] flex items-center gap-1.5">
                    <Lightbulb size={16} /> Gentle Hint
                  </p>
                  <p className="m-0 text-xs sm:text-sm font-bold text-[#29352F]">
                    {GESTURE_PROMPTS[currentRound.gesture]}
                  </p>
                </div>
              </div>
            )}

            {/* Physical round action buttons */}
            {(phase === 'waiting-physical' || phase === 'speaking-physical') && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    stopSpeech()
                    handleAnswer('completed')
                  }}
                  className="flex-1 py-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-lg sm:text-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={24} strokeWidth={3} />
                  <span>I Did It!</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopSpeech()
                    handleAnswer('skipped')
                  }}
                  className="py-4 px-6 rounded-2xl bg-[#FFFDF7] hover:bg-[#F7F4EC] text-[#6B7C73] font-bold text-base border-2 border-[#EBE6D8] transition-all cursor-pointer"
                >
                  Skip Task
                </button>
              </div>
            )}
          </section>
          )}

          {/* Cognitive question card (Only shown on cognitive rounds) */}
          {currentRound?.gesture === 'none' && showCognitive && (
            <section className="card-accessible bg-[#FFFDF7] border-2 border-[#EBE6D8] rounded-3xl p-6 md:p-8 shadow-xs" aria-labelledby="cognitive-label">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                <p
                  id="cognitive-label"
                  className="uppercase tracking-widest font-extrabold m-0 text-xs sm:text-sm text-[#D9A441]"
                >
                  🧠 Brain Activity
                </p>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFF8EC] text-[#D9A441] uppercase tracking-wide border border-[#FDE6BA]">
                  Domain: {currentRound.domain}
                </span>
              </div>
              <p
                className="font-extrabold leading-snug text-2xl sm:text-3xl text-[#29352F]"
              >
                {currentRound.cognitiveQuestion}
              </p>
            </section>
          )}

          {/* TTS speaking indicator */}
          {(phase === 'speaking-physical' || phase === 'speaking-cognitive') && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 rounded-2xl px-5 py-4"
              style={{ backgroundColor: '#EFF6FF', border: '2px solid #BFDBFE' }}
            >
              <span className="text-blue-600" aria-hidden="true" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                <Volume2 size={32} />
              </span>
              <p className="font-semibold" style={{ fontSize: 'var(--font-size-accessible-base)', color: '#1E40AF' }}>
                Listening… please follow the instructions above.
              </p>
            </div>
          )}

          {/* Voice input indicator & Tap to Speak */}
          {currentRound?.gesture === 'none' && phase === 'answering' && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl px-5 py-4 border-2 shadow-xs transition-all"
              style={{
                backgroundColor: isListening ? '#FDF2F8' : '#F8FAFC',
                borderColor: isListening ? '#F472B6' : '#E2E8F0'
              }}
            >
              <div className="flex items-center gap-3">
                <span 
                  className={`p-2 rounded-full ${isListening ? 'bg-pink-100 text-pink-600 animate-bounce' : 'bg-slate-100 text-slate-500'}`} 
                  aria-hidden="true"
                >
                  <Mic size={24} />
                </span>
                <div>
                  <p className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                    {isListening ? 'Microphone Active — Speak your answer aloud' : 'Voice detection paused'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isListening ? 'You can also tap any option button below.' : 'Click the button on the right to turn on mic.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      stopListening()
                    } else {
                      startListening()
                    }
                  }}
                  className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shadow-xs border ${
                    isListening 
                      ? 'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200' 
                      : 'bg-[#4A6B82] text-white border-transparent hover:bg-[#3A556A]'
                  }`}
                >
                  <Mic size={16} />
                  <span>{isListening ? 'Mic Listening...' : '🎙️ Tap to Speak'}</span>
                </button>
              </div>

              {spokenText && (
                <div 
                  className="w-full mt-2 p-2.5 rounded-xl font-medium text-xs sm:text-sm bg-white dark:bg-slate-900 border border-pink-200 text-pink-900 dark:text-pink-200 animate-in fade-in"
                >
                  🗣️ Heard: <strong>"{spokenText}"</strong>
                </div>
              )}
            </div>
          )}

          {/* Answer buttons (Only on cognitive rounds) */}
          {currentRound?.gesture === 'none' && (phase === 'answering' || phase === 'feedback') && currentRound.correctAnswer !== 'none' && (
            <section aria-labelledby="choices-label">
              <p
                id="choices-label"
                className="font-bold mb-4"
                style={{ fontSize: 'var(--font-size-accessible-base)', color: 'var(--color-content-secondary)' }}
              >
                Choose your answer:
              </p>

              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Answer choices">
                {currentRound.choices.map((choice) => {
                  const isCorrectChoice  = choice.trim().toLowerCase() === currentRound.correctAnswer.trim().toLowerCase()
                  const isSelected       = !!lastAnswer && (lastAnswer.chosen.trim().toLowerCase() === choice.trim().toLowerCase())
                  const isWrongSelection = isSelected && !isCorrectChoice
                  const isGuideHighlight = gameMode === 'guide' && phase === 'answering' && guideHighlightActive && isCorrectChoice

                  let bg        = 'var(--color-accessible-blue)'
                  let textColor = '#ffffff'
                  let border    = '3px solid transparent'
                  let boxShadow = '0 1px 2px rgb(0 0 0 / 0.12)'
                  let transform = 'none'

                  if (isGuideHighlight) {
                    bg = '#7C3AED'
                    border = '3px solid #A78BFA'
                    boxShadow = '0 0 0 4px #C4B5FD'
                  }

                  if (phase === 'feedback') {
                    if (isCorrectChoice) {
                      bg = '#16A34A' // High-contrast Emerald Green
                      border = '3px solid #4ADE80'
                      boxShadow = '0 0 0 4px #86EFAC, 0 4px 12px rgba(22, 163, 74, 0.4)'
                      transform = 'scale(1.02)'
                    } else if (isWrongSelection) {
                      bg = '#DC2626' // High-contrast Rose Red
                      border = '3px solid #F87171'
                      boxShadow = '0 0 0 4px #FECACA, 0 4px 12px rgba(220, 38, 38, 0.4)'
                    } else {
                      bg = '#94A3B8'
                      textColor = '#F1F5F9'
                    }
                  }

                  return (
                    <button
                      type="button"
                      key={choice}
                      id={`answer-btn-${choice.replace(/\s+/g, '-').toLowerCase()}`}
                      disabled={phase === 'feedback'}
                      onClick={() => handleAnswer(choice)}
                      aria-pressed={phase === 'feedback' ? isSelected : undefined}
                      aria-label={`Answer: ${choice}${phase === 'feedback' ? (isCorrectChoice ? ' — Correct' : isSelected ? ' — Wrong' : '') : ''}${isGuideHighlight ? ' (Hint: this is correct)' : ''}`}
                      style={{
                        minHeight:       'var(--min-height-touch-lg)',
                        fontSize:        'var(--font-size-accessible-lg)',
                        fontWeight:      700,
                        backgroundColor: bg,
                        color:           textColor,
                        border:          border,
                        borderRadius:    '1rem',
                        cursor:          phase === 'feedback' ? 'default' : 'pointer',
                        display:         'flex',
                        alignItems:      'center',
                        justifyContent:  'center',
                        padding:         '0.85rem 1rem',
                        transform:       transform,
                        transition:      'all 200ms ease',
                        boxShadow:       boxShadow,
                        opacity:         phase === 'feedback' && !isCorrectChoice && !isSelected ? 0.4 : 1,
                        animation:       isGuideHighlight ? 'guide-blink 2s ease-in-out infinite' : 'none',
                      }}
                    >
                      {phase === 'feedback' && isCorrectChoice && <span aria-hidden="true" className="mr-2 flex items-center font-bold text-white"><Check size={24} strokeWidth={3} />&nbsp;</span>}
                      {phase === 'feedback' && isWrongSelection && <span aria-hidden="true" className="mr-2 flex items-center font-bold text-white"><X size={24} strokeWidth={3} />&nbsp;</span>}
                      {isGuideHighlight && phase === 'answering' && <span aria-hidden="true" style={{ marginRight: '0.4rem' }}><Lightbulb size={20} /></span>}
                      <span>{choice}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Inline feedback */}
          {phase === 'feedback' && lastAnswer && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-2xl px-5 py-4 flex items-center gap-3"
              style={{
                backgroundColor: lastAnswer.correct ? '#DCFCE7' : '#FEE2E2',
                border: `2px solid ${lastAnswer.correct ? '#86EFAC' : '#FCA5A5'}`,
              }}
            >
              <span aria-hidden="true">{lastAnswer.correct ? <PartyPopper size={32} className="text-green-600" /> : <Lightbulb size={32} className="text-red-500" />}</span>
              <p
                className="font-bold"
                style={{
                  fontSize: 'var(--font-size-accessible-base)',
                  color:    lastAnswer.correct ? 'var(--color-accessible-green)' : 'var(--color-accessible-red)',
                }}
              >
                {currentRound?.gesture !== 'none'
                  ? (lastAnswer.correct ? 'Great job! Physical task completed.' : 'Task skipped.')
                  : lastAnswer.correct
                    ? 'Correct! Great job!'
                    : `Not quite — the answer was "${currentRound?.correctAnswer}".`}
              </p>
            </div>
          )}

          {/* Camera unavailable fallback notice (only shown if denied AND active physical round) */}
          {cameraStatus === 'denied' && currentRound?.gesture !== 'none' && (
            <p
              role="alert"
              style={{
                fontSize: 'var(--font-size-accessible-sm)',
                color: '#854D0E',
                backgroundColor: '#FEF9C3',
                border: '2px solid #FDE047',
                padding: '0.6rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
              }}
            >
              <div className="flex items-center gap-2">
                <Camera size={20} /> Camera unavailable — you can tap "I Did It" or "Skip Task" above.
              </div>
            </p>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CAMERA FEED — always in the DOM, hidden via CSS during idle/complete
          or when on a pure cognitive question round.
          Using display:none (NOT conditional &&) preserves the refs so
          MediaPipe can keep running without restarting between phases.
          ════════════════════════════════════════════════════════════════════ */}
      <div
        aria-label="Webcam gesture tracking"
        style={{ display: (isActivePhase && currentRound?.gesture !== 'none') ? 'block' : 'none' }}
      >
        {/* Loading overlay (shown while camera is still initialising) */}
        {cameraStatus === 'pending' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '2rem',
              backgroundColor: '#F1F5F9',
              borderRadius: '1rem',
              border: '2px dashed #CBD5E1',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 'var(--font-size-accessible-sm)', color: 'var(--color-content-muted)', fontWeight: 600, margin: 0 }}>
              ⏳ Loading gesture tracker…
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-content-muted)', margin: 0 }}>
              Allow camera access when prompted.
            </p>
          </div>
        )}

        {/* Live camera feed — visible once camera is active */}
        <div
          style={{
            display:         cameraStatus === 'active' ? 'block' : 'none',
            position:        'relative',
            maxWidth:        '400px',
            width:           '100%',
            margin:          '0 auto',
            borderRadius:    '1rem',
            overflow:        'hidden',
            backgroundColor: '#0F172A',
            aspectRatio:     '4/3',
            boxShadow:       '0 4px 16px rgb(0 0 0 / 0.2)',
          }}
        >
          {/* Live camera feed (mirrored for selfie-view) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            aria-hidden="true"
            style={{
              position:   'absolute',
              inset:      0,
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              transform:  'scaleX(-1)',
            }}
          />

          {/* Skeleton overlay canvas (CSS-mirrored so landmarks align with video) */}
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            aria-hidden="true"
            style={{
              position:  'absolute',
              inset:     0,
              width:     '100%',
              height:    '100%',
              transform: 'scaleX(-1)',
            }}
          />

          {/* Status pill */}
          <div
            role="status"
            aria-live="polite"
            style={{
              position:        'absolute',
              bottom:          '0.75rem',
              left:            '0.5rem',
              right:           '0.5rem',
              display:         'flex',
              alignItems:      'center',
              gap:             '0.5rem',
              backgroundColor: physicalConfirmed
                ? 'rgba(22, 163, 74, 0.92)'
                : 'rgba(15, 23, 42, 0.80)',
              color:           '#ffffff',
              padding:         '0.4rem 0.875rem',
              borderRadius:    '9999px',
              fontSize:        '0.82rem',
              fontWeight:      700,
              backdropFilter:  'blur(6px)',
              transition:      'background-color 300ms ease',
            }}
          >
            <span aria-hidden="true">{physicalConfirmed ? '✓' : '👁'}</span>
            <span>
              {physicalConfirmed
                ? poseLabel
                : currentRound?.gesture !== 'none'
                  ? `Waiting — ${GESTURE_PROMPTS[currentRound?.gesture ?? 'none']}`
                  : 'Gesture tracking active'}
            </span>
          </div>

          {/* "LIVE" badge */}
          <div
            aria-hidden="true"
            style={{
              position:        'absolute',
              top:             '0.625rem',
              right:           '0.625rem',
              backgroundColor: '#EF4444',
              color:           '#fff',
              fontSize:        '0.65rem',
              fontWeight:      800,
              padding:         '0.15rem 0.5rem',
              borderRadius:    '9999px',
              letterSpacing:   '0.08em',
            }}
          >
            LIVE
          </div>
          
          {/* Subtitles Overlay - Compact non-intrusive pill */}
          {subtitle && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md text-white px-5 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg z-50 text-center max-w-[85vw] animate-in fade-in border border-slate-600/50 pointer-events-none">
              🗣️ {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
