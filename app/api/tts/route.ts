import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { text, voice = 'aura-asteria-en' } = await req.json().catch(() => ({}))

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'DEEPGRAM_API_KEY is not configured' }, { status: 500 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const deepgramRes = await fetch(`https://api.deepgram.com/v1/speak?model=${voice}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!deepgramRes.ok) {
        const errorText = await deepgramRes.text()
        throw new Error(`Deepgram API error: ${deepgramRes.status} - ${errorText}`)
      }

      // Pass the readable stream directly to the client for instant first-byte delivery
      return new Response(deepgramRes.body, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      })
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error: any) {
    // Graceful fallback to client SpeechSynthesis without noise
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 502 })
  }
}
