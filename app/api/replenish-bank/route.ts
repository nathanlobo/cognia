import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
})
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

export const maxDuration = 60

const RoundSchema = z.object({
  domain: z.string(),
  physicalInstruction: z.string(),
  cognitiveQuestion: z.string(),
  correctAnswer: z.string(),
  choices: z.array(z.string()),
  gesture: z.enum(['left-raise', 'right-raise', 'both-raise', 'ear-cover', 'none']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

const GenerationSchema = z.object({
  levels: z.array(RoundSchema)
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const targetDifficulty: 'easy' | 'medium' | 'hard' = body.difficulty || 'easy'
    const targetLevelNumber = targetDifficulty === 'hard' ? 3 : targetDifficulty === 'medium' ? 2 : 1
    const batchSize = Math.min(body.count || 6, 8)

    const prompt = `
You are an expert game designer creating cognitive questions for seniors.
Generate ${batchSize} distinct exercise questions.
Target Difficulty: '${targetDifficulty}' (Level ${targetLevelNumber})

CRITICAL QUESTION RULES:
1. Every "cognitiveQuestion" MUST be short, direct, and straight to the point (under 8 words).
2. NO filler words, narrative stories, or conversational preamble.
   - Good: "Which season comes after winter?"
   - Good: "What is the opposite of 'Hot'?"
   - Good: "Which animal barks?"
   - Good: "What meal is eaten in the morning?"
   - Good: "Which object is shaped like a circle?"
3. "gesture" must STRICTLY be one of:
   - 'left-raise' (Raise your LEFT hand)
   - 'right-raise' (Raise your RIGHT hand)
   - 'both-raise' (Raise BOTH hands)
   - 'ear-cover' (Touch both hands to your ears)
   - 'none'
4. "choices" must contain exactly 4 distinct answer choices, one matching "correctAnswer" exactly.
5. "domain" should cover: 'Episodic Memory', 'Working Memory', 'Attention', 'Executive Function', 'Language', 'Visuospatial', 'Orientation'.
`

    const candidateModels = ['llama-3.1-8b-instant', 'qwen/qwen3.8-27b', 'gemma2-9b-it', 'llama-3.3-70b-versatile']
    let object: any = null

    if (process.env.GROQ_API_KEY) {
      for (const modelName of candidateModels) {
        try {
          const result = await generateObject({
            model: groq(modelName),
            schema: GenerationSchema,
            prompt: prompt,
            temperature: 0.6,
          })
          if (result.object?.levels && result.object.levels.length > 0) {
            object = result.object
            break
          }
        } catch (llmErr: any) {
          // Try next model
        }
      }
    }

    if (object?.levels && object.levels.length > 0) {
      const inserts = object.levels.map((q: any) => ({
        domain: q.domain,
        physical_instruction: q.physicalInstruction,
        cognitive_question: q.cognitiveQuestion,
        correct_answer: q.correctAnswer,
        choices: q.choices,
        gesture: q.gesture,
        difficulty: targetDifficulty,
        level: targetLevelNumber,
      }))

      const { error: insertError } = await supabase
        .from('question_bank')
        .upsert(inserts, { onConflict: 'cognitive_question', ignoreDuplicates: true })

      if (insertError && insertError.code !== 'PGRST205') {
        console.warn('[replenish-bank] DB insert note:', insertError.message || insertError)
      }

      return NextResponse.json({ success: true, count: object.levels.length, level: targetLevelNumber })
    }

    return NextResponse.json({ success: false, message: 'Skipped background replenishment' })
  } catch (error: any) {
    console.warn('[replenish-bank] Background generation error handled:', error?.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 200 })
  }
}
