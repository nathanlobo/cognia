'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Target, Lightbulb, Mic, Heart, Sun, Clock, Calendar, Wind, Sparkles, Trophy, Check, ArrowRight, ShieldCheck } from 'lucide-react'
import GameScreen, { SessionResult } from '@/components/GameScreen'
import { saveGameSession } from '@/lib/db'
import { speak, stopSpeech, registerSpeakListener, preloadCommonPhrases, prefetchTTS, getTTSEnabled, setTTSEnabled } from '@/lib/tts'
import { startSTT, stopSTT } from '@/lib/stt'

type Step = 'setup' | 'greeting' | 'checkin' | 'breathing' | 'cognitive' | 'caregiver' | 'feedback' | 'done'

interface DailySessionScreenProps {
  patientId: string;
  patientName: string;
  patientHistory: any[];
  preferences: any;
  onSessionComplete: () => void;
}

// Helper to record and transcribe with Web Speech + Groq Whisper
function listenForVoice(timeoutMs = 6500): Promise<string> {
  return new Promise((resolve) => {
    let settled = false

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        stopSTT()
        resolve('')
      }
    }, timeoutMs)

    startSTT({
      continuous: true,
      timeoutMs,
      onInterim: (text) => {
        if (!settled && text.trim().length > 1) {
          const lower = text.toLowerCase().trim()
          if (
            lower.includes('good') || lower.includes('great') || lower.includes('happy') ||
            lower.includes('okay') || lower.includes('fine') || lower.includes('calm') ||
            lower.includes('tired') || lower.includes('sleepy') ||
            lower.includes('yes') || lower.includes('yeah') || lower.includes('sure') ||
            lower.includes('no') || lower.includes('skip') || lower.includes('later') ||
            lower.includes('done') || lower.includes('did it') || lower.includes('finish') ||
            lower.includes('more') || lower.includes('play') || lower.includes('again')
          ) {
            settled = true
            clearTimeout(timeout)
            stopSTT()
            resolve(lower)
          }
        }
      },
      onTranscript: (text) => {
        if (!settled && text.trim()) {
          settled = true
          clearTimeout(timeout)
          stopSTT()
          resolve(text.toLowerCase().trim())
        }
      },
      onError: (err) => {
        console.warn('[DailySession STT Error]:', err)
      },
    }).catch(() => {
      if (!settled) {
        settled = true
        clearTimeout(timeout)
        resolve('')
      }
    })
  })
}

export default function DailySessionScreen({
  patientId,
  patientName,
  patientHistory,
  preferences,
  onSessionComplete,
}: DailySessionScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>('setup')
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [gameMode, setGameMode] = useState<'guide' | 'strict'>('guide')
  const [ttsOn, setTtsOn] = useState<boolean>(true)

  // Session Metrics
  const [mood, setMood] = useState<string>('')
  const [didBreathing, setDidBreathing] = useState<boolean>(false)
  const [loopsCompleted, setLoopsCompleted] = useState<number>(0)
  const [gameResults, setGameResults] = useState<SessionResult[]>([])

  const [isListening, setIsListening] = useState(false)
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingTimeLeft, setBreathingTimeLeft] = useState(60)
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [subtitle, setSubtitle] = useState('')

  useEffect(() => {
    setTtsOn(getTTSEnabled())
    const handleTtsChange = () => setTtsOn(getTTSEnabled())
    window.addEventListener('tts_toggle_changed', handleTtsChange)
    return () => window.removeEventListener('tts_toggle_changed', handleTtsChange)
  }, [])

  useEffect(() => {
    preloadCommonPhrases()
    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dayString = now.toLocaleDateString([], { weekday: 'long' })
    prefetchTTS(`Hello ${patientName}. Today is ${dayString}. The time is ${timeString}. Let's begin our gentle daily wellness session.`)
    prefetchTTS('How are you feeling today?')

    const unsubscribe = registerSpeakListener((text: string) => {
      setSubtitle((prev) => (prev !== text ? text : prev))
    })
    return () => { unsubscribe() }
  }, [patientName])

  // Track the actual current step for async callbacks to prevent racing
  const stepRef = useRef<Step>(currentStep)
  useEffect(() => { stepRef.current = currentStep }, [currentStep])

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech()
      stopSTT()
      if (breathingTimerRef.current) clearTimeout(breathingTimerRef.current)
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // STEP 0: Setup & Audio Permissions
  // ---------------------------------------------------------------------------
  const handleStartSession = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null)
        if (stream) {
          stream.getTracks().forEach((t) => t.stop())
        }
      }
      setPermissionsGranted(true)

      // Unlock speech synthesis on user click
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const dummy = new SpeechSynthesisUtterance('')
        dummy.volume = 0
        window.speechSynthesis.speak(dummy)
      }

      setCurrentStep('greeting')
    } catch (err) {
      setCurrentStep('greeting')
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 1: Greeting & Orientation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (currentStep === 'greeting') {
      const now = new Date()
      const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      const dayString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      const prompt = `Good morning ${patientName}! Today is ${dayString}, and the time is ${timeString}. Let's begin our daily companion moments.`

      speak(prompt, () => {
        // Automatically give 2.5s before transitioning to check-in, or allow manual tap
      })
    }
  }, [currentStep, patientName])

  // ---------------------------------------------------------------------------
  // STEP 2: Mood Check-in
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (currentStep === 'checkin') {
      speak('How are you feeling today?', async () => {
        setIsListening(true)
        const text = await listenForVoice(5500)
        setIsListening(false)

        if (text && stepRef.current === 'checkin') {
          if (text.includes('great') || text.includes('good') || text.includes('happy') || text.includes('wonderful')) {
            handleMoodSelect('Joyful & Good')
          } else if (text.includes('okay') || text.includes('fine') || text.includes('calm') || text.includes('peaceful')) {
            handleMoodSelect('Peaceful & Calm')
          } else if (text.includes('tired') || text.includes('sleepy') || text.includes('low')) {
            handleMoodSelect('A Bit Tired')
          } else {
            handleMoodSelect('Peaceful & Calm')
          }
        }
      })
    }
  }, [currentStep])

  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood)
    stopSpeech()
    setCurrentStep('breathing')
  }

  // ---------------------------------------------------------------------------
  // STEP 3: Optional Breathing Exercise
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (currentStep === 'breathing') {
      speak('Would you like to do a quick 1-minute calming breath exercise before we play?', async () => {
        setIsListening(true)
        const text = await listenForVoice(5000)
        setIsListening(false)

        if (stepRef.current !== 'breathing') return

        if (text.includes('yes') || text.includes('yeah') || text.includes('sure') || text.includes('okay') || text.includes('breathe')) {
          startBreathing()
        } else if (text.includes('no') || text.includes('skip') || text.includes('later') || text.includes('play')) {
          skipBreathing()
        }
      })
    }
  }, [currentStep])

  const startBreathing = () => {
    setDidBreathing(true)
    setBreathingActive(true)
    setBreathingTimeLeft(60)
    stopSpeech()

    breathingIntervalRef.current = setInterval(() => {
      setBreathingTimeLeft((prev) => {
        if (prev <= 1) {
          if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    breathingTimerRef.current = setTimeout(() => {
      setBreathingActive(false)
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current)
      setCurrentStep('cognitive')
    }, 60000)
  }

  const skipBreathing = () => {
    if (breathingTimerRef.current) clearTimeout(breathingTimerRef.current)
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current)
    setBreathingActive(false)
    stopSpeech()
    setCurrentStep('cognitive')
  }

  // ---------------------------------------------------------------------------
  // STEP 4: Cognitive (GameScreen) is handled in render
  // ---------------------------------------------------------------------------
  const handleGameComplete = (results: SessionResult[]) => {
    setGameResults((prev) => [...prev, ...results])
    setCurrentStep('caregiver')
  }

  // ---------------------------------------------------------------------------
  // STEP 5: Caregiver Task & Note
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (currentStep === 'caregiver') {
      const task = preferences?.caregiver_daily_task || 'I just wanted to say I love you, have a wonderful and restful day!'
      const prompt = `Here is a special note from home: ${task}. Say "I did it" or tap the button below when you are ready.`
      speak(prompt, async () => {
        const loopListen = async () => {
          if (stepRef.current !== 'caregiver') return
          setIsListening(true)
          const text = await listenForVoice(5000)
          setIsListening(false)

          if (stepRef.current !== 'caregiver') return

          if (text.includes('done') || text.includes('did it') || text.includes('yes') || text.includes('finished') || text.includes('completed')) {
            handleCaregiverTaskDone()
          } else {
            setTimeout(loopListen, 600)
          }
        }
        loopListen()
      })
    }
  }, [currentStep, preferences])

  const handleCaregiverTaskDone = () => {
    stopSpeech()
    setCurrentStep('feedback')
  }

  // ---------------------------------------------------------------------------
  // STEP 6: Feedback & Encouragement Loop
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (currentStep === 'feedback') {
      speak('Wonderful job today! You did great! Would you like to play another quick round, or are you all done for now?', async () => {
        setIsListening(true)
        const text = await listenForVoice(5000)
        setIsListening(false)

        if (stepRef.current !== 'feedback') return

        if (text.includes('yes') || text.includes('more') || text.includes('play') || text.includes('again')) {
          handleLoop('yes')
        } else if (text.includes('no') || text.includes('stop') || text.includes('done') || text.includes('finish')) {
          handleLoop('no')
        }
      })
    }
  }, [currentStep])

  const handleLoop = async (choice: 'yes' | 'no') => {
    stopSpeech()

    if (choice === 'yes') {
      setLoopsCompleted((prev) => prev + 1)
      setCurrentStep('cognitive')
    } else {
      setCurrentStep('done')
      try {
        await saveGameSession(patientId, gameResults, {
          mood_reported: mood,
          did_breathing_exercise: didBreathing,
          loops_completed: loopsCompleted + 1,
        })
      } catch (err) {
        console.error('Failed to save full session data:', err)
      }
      onSessionComplete()
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const renderSubtitle = () => {
    if (!subtitle) return null
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#29352F]/90 backdrop-blur-md text-[#FFFDF7] px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg z-50 text-center max-w-[85vw] animate-in fade-in border border-[#6F8F7A]/40 pointer-events-none">
        🗣️ {subtitle}
      </div>
    )
  }

  // ── STEP 0: Setup Screen ──────────────────────────────────────────────────
  if (currentStep === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] animate-in fade-in duration-300 w-full px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#E8EFEA] text-[#6F8F7A] flex items-center justify-center text-3xl mb-6 shadow-xs">
          🌿
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] mb-3 leading-tight">
          Ready for Today’s Moments?
        </h1>
        <p className="text-base sm:text-lg text-[#47554E] max-w-xl mx-auto mb-8 leading-relaxed">
          We’ll guide you through a peaceful orientation, a gentle mood check-in, and fun, zero-pressure brain games.
        </p>

        {/* Voice Toggle & Mode Cards */}
        <div className="w-full max-w-md mb-8 space-y-4 text-left">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFFDF7] border-2 border-[#EBE6D8] shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ttsOn ? '🔊' : '🔇'}</span>
              <div>
                <p className="font-bold text-sm text-[#29352F]">Voice Guidance</p>
                <p className="text-xs text-[#6B7C73]">
                  {ttsOn ? 'Spoken aloud with comforting voice' : 'Silent mode (visual only)'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !ttsOn
                setTtsOn(next)
                setTTSEnabled(next)
              }}
              className={`px-4 py-2 rounded-full font-bold text-xs transition cursor-pointer border shadow-xs ${
                ttsOn
                  ? 'bg-[#6F8F7A] text-[#FFFDF7] border-[#577361]'
                  : 'bg-[#F7F4EC] text-[#6B7C73] border-[#E3DEC3]'
              }`}
            >
              {ttsOn ? 'ON 🔊' : 'OFF'}
            </button>
          </div>

          <div>
            <p className="text-xs font-bold text-[#6B7C73] uppercase tracking-wider mb-2">Game Assistance</p>
            <div className="flex gap-3">
              {(['guide', 'strict'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setGameMode(m)}
                  className={`flex-1 py-3 px-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    gameMode === m
                      ? 'border-[#6F8F7A] bg-[#F1F6F3] text-[#29352F] shadow-xs'
                      : 'border-[#EBE6D8] bg-[#FFFDF7] text-[#6B7C73]'
                  }`}
                >
                  <div className="mb-1">
                    {m === 'strict' ? <Target size={24} className="text-[#6F8F7A]" /> : <Lightbulb size={24} className="text-[#D9A441]" />}
                  </div>
                  <span className="font-bold text-sm">{m === 'strict' ? 'Classic Mode' : 'Guided Mode'}</span>
                  <span className="text-[11px] opacity-80">{m === 'strict' ? 'No hints' : 'Gentle hints'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleStartSession}
          className="w-full max-w-md py-4 sm:py-5 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-xl sm:text-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>Begin Daily Moments</span>
          <ArrowRight size={24} />
        </button>
        {renderSubtitle()}
      </div>
    )
  }

  // ── STEP 1: Greeting & Orientation ────────────────────────────────────────
  if (currentStep === 'greeting') {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const dayStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] animate-in fade-in duration-300 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FDF4E2] text-[#D9A441] flex items-center justify-center text-4xl mb-6 shadow-xs animate-bounce">
          ☀️
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#29352F] mb-3 leading-tight">
          Good day, {patientName}!
        </h1>

        <div className="p-4 sm:p-6 rounded-3xl bg-[#FFFDF7] border-2 border-[#EBE6D8] shadow-xs my-6 w-full max-w-lg">
          <div className="flex items-center justify-center gap-6 text-[#47554E] font-bold text-base sm:text-lg">
            <span className="flex items-center gap-2">
              <Calendar size={20} className="text-[#6F8F7A]" />
              {dayStr}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={20} className="text-[#D9A441]" />
              {timeStr}
            </span>
          </div>
        </div>

        <p className="text-lg sm:text-xl text-[#47554E] font-medium mb-8 max-w-md">
          Let’s take today one peaceful, joyful step at a time.
        </p>

        <button
          onClick={() => {
            stopSpeech()
            setCurrentStep('checkin')
          }}
          className="w-full max-w-xs py-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight size={20} />
        </button>
        {renderSubtitle()}
      </div>
    )
  }

  // ── STEP 2: Mood Check-in ────────────────────────────────────────────────
  if (currentStep === 'checkin') {
    const moods = [
      { key: 'Joyful & Good', label: 'Joyful & Good', emoji: '🌟', color: '#D9A441', bg: '#FFF8EC' },
      { key: 'Peaceful & Calm', label: 'Peaceful & Calm', emoji: '🌿', color: '#6F8F7A', bg: '#F1F6F3' },
      { key: 'Calm & Relaxed', label: 'Calm & Relaxed', emoji: '☕', color: '#5B7A8C', bg: '#EEF4F8' },
      { key: 'A Bit Tired', label: 'A Bit Tired', emoji: '🛋️', color: '#C96B5C', bg: '#FDF2F0' },
    ]

    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] animate-in slide-in-from-right duration-300 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] mb-3">
          How are you feeling today?
        </h1>
        <p className="text-base sm:text-lg text-[#47554E] mb-8">
          Tap any card below or speak your answer aloud.
        </p>

        {isListening && (
          <div className="mb-6 px-4 py-2 rounded-full bg-[#F1F6F3] text-[#6F8F7A] font-bold text-sm flex items-center gap-2 animate-pulse">
            <Mic size={18} />
            <span>Listening for your voice...</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
          {moods.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => handleMoodSelect(m.key)}
              style={{ backgroundColor: m.bg }}
              className="py-8 px-4 rounded-3xl border-2 border-[#EBE6D8] hover:border-[#6F8F7A] hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-3 shadow-xs hover:shadow-md cursor-pointer"
            >
              <span className="text-5xl">{m.emoji}</span>
              <span className="font-extrabold text-base sm:text-lg text-[#29352F]">{m.label}</span>
            </button>
          ))}
        </div>
        {renderSubtitle()}
      </div>
    )
  }

  // ── STEP 3: Optional Breathing ───────────────────────────────────────────
  if (currentStep === 'breathing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] animate-in slide-in-from-right duration-300 w-full px-4 text-center">
        {!breathingActive ? (
          <div>
            <div className="w-20 h-20 rounded-full bg-[#E8EFEA] text-[#6F8F7A] flex items-center justify-center text-3xl mx-auto mb-6 shadow-xs">
              <Wind size={36} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#29352F] mb-3 max-w-xl mx-auto leading-tight">
              Would you like a 1-minute calming breath?
            </h1>
            <p className="text-base sm:text-lg text-[#47554E] mb-8 max-w-md mx-auto">
              A brief moment to center yourself, or skip right ahead to the games.
            </p>

            {isListening && (
              <div className="mb-6 px-4 py-2 rounded-full bg-[#F1F6F3] text-[#6F8F7A] font-bold text-sm inline-flex items-center gap-2 animate-pulse">
                <Mic size={18} />
                <span>Say "Yes" or "Skip"</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
              <button
                onClick={startBreathing}
                className="w-full sm:flex-1 py-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-bold text-lg transition-all shadow-md cursor-pointer"
              >
                Yes, Let’s Breathe
              </button>
              <button
                onClick={skipBreathing}
                className="w-full sm:flex-1 py-4 rounded-2xl bg-[#FFFDF7] hover:bg-[#F7F4EC] text-[#29352F] border-2 border-[#EBE6D8] font-bold text-lg transition-all cursor-pointer"
              >
                Skip to Play
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29352F] animate-pulse">
              Breathe gently with the flower...
            </h2>

            {/* Calming Animated Flower / Circle */}
            <div className="relative flex items-center justify-center w-64 h-64">
              <div
                className="absolute inset-0 bg-[#6F8F7A]/20 rounded-full"
                style={{ animation: 'breathe-circle 6s ease-in-out infinite' }}
              />
              <div
                className="absolute inset-6 bg-[#6F8F7A]/40 rounded-full"
                style={{ animation: 'breathe-circle 6s ease-in-out infinite 0.5s' }}
              />
              <div className="absolute inset-12 bg-[#6F8F7A] rounded-full shadow-xl flex items-center justify-center text-[#FFFDF7] font-extrabold text-2xl">
                🌸 Inhale &bull; Exhale
              </div>
            </div>

            <p className="text-lg font-bold text-[#6B7C73]">
              {breathingTimeLeft} seconds remaining
            </p>

            <button
              onClick={skipBreathing}
              className="px-6 py-2.5 rounded-full border-2 border-[#EBE6D8] bg-[#FFFDF7] hover:bg-[#F7F4EC] text-[#47554E] font-bold text-sm transition-all cursor-pointer"
            >
              Done &bull; Ready to Play
            </button>
          </div>
        )}
        {renderSubtitle()}
      </div>
    )
  }

  // ── STEP 4: Cognitive Activities (GameScreen) ─────────────────────────────
  if (currentStep === 'cognitive') {
    return (
      <div className="animate-in fade-in duration-300 w-full h-full">
        <GameScreen
          key={`game-loop-${loopsCompleted}-${patientId}`}
          patientId={patientId}
          patientHistory={patientHistory}
          preferences={preferences}
          onComplete={handleGameComplete}
          autoStart={true}
          defaultGameMode={gameMode}
        />
      </div>
    )
  }

  // ── STEP 5: Caregiver Task & Note ─────────────────────────────────────────
  if (currentStep === 'caregiver') {
    const taskNote = preferences?.caregiver_daily_task || 'I just wanted to say I love you, have a wonderful and peaceful day!'

    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] animate-in zoom-in-95 duration-300 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFF8EC] text-[#D9A441] flex items-center justify-center text-4xl mb-6 shadow-xs">
          💌
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#29352F] mb-3">
          A Message From Family
        </h1>
        <p className="text-base sm:text-lg text-[#47554E] mb-6">
          Your loved ones left you a gentle reminder and message:
        </p>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFF8EC] border-2 border-[#FDE6BA] shadow-xs mb-8 w-full max-w-xl text-center">
          <p className="text-xl sm:text-2xl font-bold text-[#29352F] leading-relaxed">
            "{taskNote}"
          </p>
        </div>

        {isListening && (
          <div className="mb-6 px-4 py-2 rounded-full bg-[#F1F6F3] text-[#6F8F7A] font-bold text-sm inline-flex items-center gap-2 animate-pulse">
            <Mic size={18} />
            <span>Say "I did it" or tap below</span>
          </div>
        )}

        <button
          onClick={handleCaregiverTaskDone}
          className="w-full max-w-md py-4 sm:py-5 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-xl sm:text-2xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer"
        >
          <Check size={28} strokeWidth={3} />
          <span>I Completed It!</span>
        </button>
        {renderSubtitle()}
      </div>
    )
  }

  // ── STEP 6: Feedback & Encouragement Celebration ─────────────────────────
  if (currentStep === 'feedback') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] animate-in slide-in-from-bottom duration-300 w-full px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FDF4E2] text-[#D9A441] flex items-center justify-center text-5xl mb-6 shadow-md animate-bounce">
          🏆
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#29352F] mb-3">
          Wonderful Job!
        </h1>
        <p className="text-lg sm:text-xl text-[#47554E] font-medium mb-8 max-w-md">
          You completed today’s gentle moments. Would you like to play another quick round, or finish for now?
        </p>

        {isListening && (
          <div className="mb-6 px-4 py-2 rounded-full bg-[#F1F6F3] text-[#6F8F7A] font-bold text-sm inline-flex items-center gap-2 animate-pulse">
            <Mic size={18} />
            <span>Say "Play more" or "I'm done"</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => handleLoop('yes')}
            className="flex-1 py-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-bold text-lg transition-all shadow-md cursor-pointer"
          >
            Play Another Mix 🎮
          </button>
          <button
            onClick={() => handleLoop('no')}
            className="flex-1 py-4 rounded-2xl bg-[#FFFDF7] hover:bg-[#F7F4EC] text-[#29352F] border-2 border-[#EBE6D8] font-bold text-lg transition-all shadow-xs cursor-pointer"
          >
            I’m Done for Today ✨
          </button>
        </div>
        {renderSubtitle()}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold text-[#6B7C73]">Saving your gentle progress...</h2>
    </div>
  )
}
