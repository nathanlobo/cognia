// ─────────────────────────────────────────────────────────────────────────────
// Universal Speech-to-Text (STT) Engine for Dementia Therapy Voice Interactions
// Dual-Engine: 1. Native Web Speech API (zero latency) + 2. MediaRecorder Fallback
// ─────────────────────────────────────────────────────────────────────────────

export interface STTOptions {
  onTranscript: (text: string, isFinal: boolean) => void
  onInterim?: (interimText: string) => void
  onError?: (error: string) => void
  timeoutMs?: number
  continuous?: boolean
}

let activeRecognition: any = null
let activeMediaStream: MediaStream | null = null
let activeMediaRecorder: MediaRecorder | null = null
let recognitionActive = false
let restartTimeout: NodeJS.Timeout | null = null

/**
 * Check if browser supports native Web Speech API
 */
export function isWebSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
}

/**
 * Stop any active listening session and release microphone resources
 */
export function stopSTT(): void {
  recognitionActive = false

  if (restartTimeout) {
    clearTimeout(restartTimeout)
    restartTimeout = null
  }

  if (activeRecognition) {
    try {
      activeRecognition.onresult = null
      activeRecognition.onerror = null
      activeRecognition.onend = null
      activeRecognition.abort()
    } catch (e) {}
    activeRecognition = null
  }

  if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
    try {
      activeMediaRecorder.stop()
    } catch (e) {}
    activeMediaRecorder = null
  }

  if (activeMediaStream) {
    try {
      activeMediaStream.getTracks().forEach((track) => track.stop())
    } catch (e) {}
    activeMediaStream = null
  }
}

/**
 * Start listening using Web Speech API (instant live transcription)
 * with graceful fallback to MediaRecorder + Groq Whisper
 */
export async function startSTT(options: STTOptions): Promise<() => void> {
  stopSTT()
  recognitionActive = true

  const { onTranscript, onInterim, onError, timeoutMs = 0, continuous = true } = options

  // 1. Try Native Web Speech API first
  if (isWebSpeechSupported()) {
    try {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognitionConstructor()

      recognition.continuous = continuous
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 3

      recognition.onresult = (event: any) => {
        if (!recognitionActive) return

        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i]
          const transcript = item[0]?.transcript || ''
          if (item.isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript + ' '
          }
        }

        const cleanText = (finalTranscript || interimTranscript).trim()
        if (!cleanText) return

        if (onInterim) {
          onInterim(cleanText)
        }

        onTranscript(cleanText, Boolean(finalTranscript.trim()))
      }

      recognition.onerror = (event: any) => {
        if (event.error === 'aborted' || !recognitionActive) {
          return
        }
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          onError?.('Microphone access denied. Please click the microphone icon in your browser address bar to allow.')
          stopSTT()
          return
        }
        if (event.error === 'no-speech') {
          // Normal timeout when patient is thinking
          return
        }
        if (event.error === 'network' || event.error === 'service-not-allowed') {
          startWhisperRecorder(options).catch((err) => onError?.(err.message))
        }
      }

      recognition.onend = () => {
        if (recognitionActive && continuous) {
          restartTimeout = setTimeout(() => {
            if (recognitionActive && activeRecognition) {
              try {
                activeRecognition.start()
              } catch (e) {}
            }
          }, 200)
        }
      }

      activeRecognition = recognition
      try {
        recognition.start()
      } catch (err) {
        console.warn('[startSTT start error]:', err)
      }

      // Optional timeout safety
      if (timeoutMs > 0) {
        setTimeout(() => {
          if (recognitionActive) {
            stopSTT()
          }
        }, timeoutMs)
      }

      return stopSTT
    } catch (err: any) {
      console.warn('[startSTT fallback to Whisper]:', err)
    }
  }

  // 2. Fallback to MediaRecorder + Groq Whisper
  await startWhisperRecorder(options)
  return stopSTT
}

/**
 * Fallback recorder using MediaRecorder and Groq Whisper API
 */
async function startWhisperRecorder(options: STTOptions): Promise<void> {
  const { onTranscript, onInterim, onError, timeoutMs = 5000 } = options

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    if (!recognitionActive) {
      stream.getTracks().forEach((t) => t.stop())
      return
    }

    activeMediaStream = stream
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined,
    })
    activeMediaRecorder = mediaRecorder
    const audioChunks: BlobPart[] = []

    onInterim?.('Listening for your voice...')

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      try {
        stream.getTracks().forEach((t) => t.stop())
      } catch (e) {}

      if (!recognitionActive || audioChunks.length === 0) return

      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      const formData = new FormData()
      formData.append('file', audioBlob, 'speech.webm')

      try {
        onInterim?.('Processing speech...')
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          const text = (data.text || '').trim()
          if (text) {
            onTranscript(text, true)
          }
        }
      } catch (err: any) {
        console.warn('[STT Whisper error]:', err)
        onError?.('Speech service offline')
      }
    }

    mediaRecorder.start()

    setTimeout(() => {
      if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
        try {
          activeMediaRecorder.stop()
        } catch (e) {}
      }
    }, timeoutMs)
  } catch (err: any) {
    console.error('[STT MediaRecorder Error]:', err)
    onError?.('Microphone permission required for speech recognition')
  }
}

/**
 * Intelligent Answer Matcher: Resolves spoken phrases to one of the 4 question choices
 */
export function resolveSpokenChoice(spokenText: string, choices: string[]): string | null {
  if (!spokenText || !choices || choices.length === 0) return null

  const clean = spokenText.toLowerCase().replace(/[.,!?'"()]/g, '').trim()
  const cleanChoices = choices.map((c) => c.toLowerCase().replace(/[.,!?'"()]/g, '').trim())

  // 1. Direct Exact Match
  for (let i = 0; i < cleanChoices.length; i++) {
    if (clean === cleanChoices[i]) {
      return choices[i]
    }
  }

  // 2. Positional / Ordinal Word Matches
  const optionNumberMap: Record<string, number> = {
    'option 1': 0, 'option one': 0, 'first': 0, 'first one': 0, 'choice 1': 0, 'number 1': 0, 'number one': 0, '1': 0, 'one': 0, 'a': 0, 'option a': 0,
    'option 2': 1, 'option two': 1, 'second': 1, 'second one': 1, 'choice 2': 1, 'number 2': 1, 'number two': 1, '2': 1, 'two': 1, 'b': 1, 'option b': 1,
    'option 3': 2, 'option three': 2, 'third': 2, 'third one': 2, 'choice 3': 2, 'number 3': 2, 'number three': 2, '3': 2, 'three': 2, 'c': 2, 'option c': 2,
    'option 4': 3, 'option four': 3, 'fourth': 3, 'fourth one': 3, 'choice 4': 3, 'number 4': 3, 'number four': 3, '4': 3, 'four': 3, 'd': 3, 'option d': 3,
  }

  for (const [trigger, index] of Object.entries(optionNumberMap)) {
    const regex = new RegExp(`\\b${trigger}\\b`, 'i')
    if (regex.test(clean) && choices[index]) {
      return choices[index]
    }
  }

  // 3. Substring inclusion ("I think it is Spring" -> matches "Spring")
  for (let i = 0; i < cleanChoices.length; i++) {
    const choiceText = cleanChoices[i]
    if (choiceText.length >= 2 && clean.includes(choiceText)) {
      return choices[i]
    }
  }

  // 4. Token overlap
  const spokenTokens = new Set(clean.split(/\s+/))
  let bestMatch: string | null = null
  let highestOverlap = 0

  for (let i = 0; i < cleanChoices.length; i++) {
    const choiceTokens = cleanChoices[i].split(/\s+/)
    let matches = 0
    for (const token of choiceTokens) {
      if (token.length > 2 && spokenTokens.has(token)) {
        matches++
      }
    }
    if (matches > highestOverlap && matches >= Math.ceil(choiceTokens.length / 2)) {
      highestOverlap = matches
      bestMatch = choices[i]
    }
  }

  return bestMatch
}
