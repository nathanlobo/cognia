// ─────────────────────────────────────────────────────────────────────────────
// High-Performance Audio TTS with Client-Side In-Memory Caching & Prefetching
// ─────────────────────────────────────────────────────────────────────────────

let activeAudio: HTMLAudioElement | null = null
let activeUtterance: SpeechSynthesisUtterance | null = null
let speechSafetyTimer: ReturnType<typeof setTimeout> | null = null
let speakListeners: ((text: string) => void)[] = []
let currentSpeechId = 0

// In-memory cache for audio blob URLs (0ms playback on hit)
const audioBlobCache = new Map<string, string>()
const pendingPrefetches = new Set<string>()

let ttsEnabled = true

export function getTTSEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cognia_tts_enabled')
    if (saved !== null) return saved === 'true'
  }
  return ttsEnabled
}

export function setTTSEnabled(enabled: boolean): void {
  ttsEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('cognia_tts_enabled', enabled ? 'true' : 'false')
    window.dispatchEvent(new CustomEvent('tts_toggle_changed', { detail: { enabled } }))
  }
  if (!enabled) {
    stopSpeech()
  }
}

export function registerSpeakListener(listener: (text: string) => void) {
  speakListeners.push(listener)
  return () => {
    speakListeners = speakListeners.filter((l) => l !== listener)
  }
}

export function stopSpeech() {
  currentSpeechId++
  if (speechSafetyTimer) {
    clearTimeout(speechSafetyTimer)
    speechSafetyTimer = null
  }
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.onended = null
    activeAudio.onerror = null
    activeAudio = null
  }
  if (activeUtterance) {
    activeUtterance.onend = null
    activeUtterance.onerror = null
    activeUtterance = null
  }
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  } catch (e) {}
  queueMicrotask(() => {
    speakListeners.forEach((l) => l(''))
  })
}

if (typeof window !== 'undefined') {
  window.addEventListener('stop-speech', stopSpeech)
}

/**
 * Prefetch audio for upcoming text in the background so playback is instantaneous.
 */
export async function prefetchTTS(text: string): Promise<void> {
  if (typeof window === 'undefined' || !text || !text.trim() || !getTTSEnabled()) return
  const cleanText = text.trim()
  if (audioBlobCache.has(cleanText) || pendingPrefetches.has(cleanText)) return

  pendingPrefetches.add(cleanText)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2500)
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, voice: 'aura-asteria-en' }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      audioBlobCache.set(cleanText, url)
    }
  } catch (e) {
    // Non-blocking prefetch failure
  } finally {
    clearTimeout(timeoutId)
    pendingPrefetches.delete(cleanText)
  }
}

/**
 * Prefetch standard common phrases across the app on mount.
 */
export function preloadCommonPhrases() {
  const common = [
    'Correct! Well done.',
    'Great job! Task completed.',
    'Moving to the next task.',
    'How are you feeling today?',
    'Wonderful job today! You did great! Would you like to play a few more games?',
    'Great job!',
  ]
  common.forEach((phrase) => prefetchTTS(phrase))
}

/**
 * High-speed speak function. Checks cache first (0ms latency), streams if not cached.
 */
export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !text || !text.trim()) {
    onEnd?.()
    return
  }

  // If user disabled TTS dictation, immediately invoke onEnd and skip audio
  if (!getTTSEnabled()) {
    onEnd?.()
    return
  }

  const cleanText = text.trim()
  stopSpeech()

  currentSpeechId++
  const speechId = currentSpeechId

  queueMicrotask(() => {
    speakListeners.forEach((l) => l(cleanText))
  })

  let hasEnded = false
  const safeEnd = () => {
    if (hasEnded) return
    hasEnded = true
    stopSpeech()
    onEnd?.()
  }

  // Safety fallback: estimate reading time (approx 80ms per char + 2000ms buffer)
  const fallbackMs = Math.max(3000, cleanText.length * 80 + 2000)
  speechSafetyTimer = setTimeout(safeEnd, fallbackMs)

  // 1. Instant Cache Hit Check
  const cachedUrl = audioBlobCache.get(cleanText)
  if (cachedUrl) {
    try {
      const audio = new Audio(cachedUrl)
      activeAudio = audio
      audio.onended = safeEnd
      audio.onerror = () => {
        fallbackToSpeechSynthesis(cleanText, safeEnd)
      }
      audio.play().catch((e) => {
        console.warn('Cached audio playback blocked, using fallback:', e)
        fallbackToSpeechSynthesis(cleanText, safeEnd)
      })
      return
    } catch (e) {
      // Fall through to fetch
    }
  }

  // 2. Fetch from Fast Streaming Deepgram TTS API with graceful fallback
  const controller = new AbortController()
  const fetchTimeout = setTimeout(() => controller.abort(), 4000)

  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: cleanText, voice: 'aura-asteria-en' }),
    signal: controller.signal,
  })
    .then(async (res) => {
      clearTimeout(fetchTimeout)
      if (speechId !== currentSpeechId) return
      if (!res.ok) throw new Error('TTS API failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      // Cache for immediate replay
      audioBlobCache.set(cleanText, url)

      if (speechId !== currentSpeechId) return
      const audio = new Audio(url)
      activeAudio = audio

      audio.onended = safeEnd
      audio.onerror = () => {
        throw new Error('Audio play failed')
      }

      audio.play().catch((e) => {
        fallbackToSpeechSynthesis(cleanText, safeEnd)
      })
    })
    .catch(() => {
      clearTimeout(fetchTimeout)
      if (speechId !== currentSpeechId) return
      fallbackToSpeechSynthesis(cleanText, safeEnd)
    })
}

function fallbackToSpeechSynthesis(text: string, onEnd: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd()
    return
  }
  const utt = new SpeechSynthesisUtterance(text)
  activeUtterance = utt
  utt.rate = 1.0
  utt.pitch = 1.0
  utt.volume = 1.0
  utt.lang = 'en-US'

  utt.onend = onEnd
  utt.onerror = onEnd

  try {
    window.speechSynthesis.speak(utt)
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  } catch (err) {
    console.warn('[SpeechSynthesis speak failed]:', err)
    onEnd()
  }
}
