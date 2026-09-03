export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
})

// Short, clear fallback rounds with proper options
const FALLBACK_ROUNDS = [
  {
    domain: 'Episodic Memory',
    physical_instruction: 'Raise your LEFT hand',
    cognitive_question: 'Which season comes after winter?',
    correct_answer: 'Spring',
    choices: ['Spring', 'Summer', 'Autumn', 'Winter'],
    gesture: 'left-raise',
    difficulty: 'easy',
    level: 1,
  },
  {
    domain: 'Language',
    physical_instruction: 'Raise your RIGHT hand',
    cognitive_question: "What is the opposite of 'Hot'?",
    correct_answer: 'Cold',
    choices: ['Cold', 'Warm', 'Sunny', 'Bright'],
    gesture: 'right-raise',
    difficulty: 'easy',
    level: 1,
  },
  {
    domain: 'Visuospatial',
    physical_instruction: 'Raise BOTH hands',
    cognitive_question: 'Which object is shaped like a circle?',
    correct_answer: 'Coin',
    choices: ['Coin', 'Book', 'Box', 'Door'],
    gesture: 'both-raise',
    difficulty: 'easy',
    level: 1,
  },
  {
    domain: 'Orientation',
    physical_instruction: 'Touch both hands to your ears',
    cognitive_question: 'What meal is eaten in the morning?',
    correct_answer: 'Breakfast',
    choices: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    gesture: 'ear-cover',
    difficulty: 'easy',
    level: 1,
  },
]

const RoundSchema = z.object({
  domain: z.string(),
  physicalInstruction: z.string(),
  cognitiveQuestion: z.string(),
  correctAnswer: z.string(),
  choices: z.array(z.string()).length(4),
  gesture: z.enum(['left-raise', 'right-raise', 'both-raise', 'ear-cover', 'none']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  level: z.number().int().min(1).max(3)
})

const GenerationSchema = z.object({
  rounds: z.array(RoundSchema).length(7)
})

interface DifficultyProfile {
  userLevel: number
  profileName: string
  difficulty: 'easy' | 'medium' | 'hard'
}

function determineDifficultyProfile(history: any[]): DifficultyProfile {
  const sessionCount = history?.length || 0
  if (sessionCount <= 1) return { userLevel: 1, profileName: 'Level 1 (Novice)', difficulty: 'easy' }

  let totalCorrect = 0, totalRounds = 0
  for (const session of history) {
    const results = session.results || session.round_results || []
    if (Array.isArray(results) && results.length > 0) {
      totalCorrect += results.filter((r: any) => r.is_correct || r.isCorrect).length
      totalRounds += results.length
    }
  }

  const avgAccuracy = totalRounds > 0 ? (totalCorrect / totalRounds) * 100 : 60
  if (sessionCount >= 5 && avgAccuracy >= 75) {
    return { userLevel: 3, profileName: 'Level 3 (Advanced)', difficulty: 'hard' }
  }
  return { userLevel: 2, profileName: 'Level 2 (Intermediate)', difficulty: 'medium' }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { history, patientId, recentQuestions = [], randomSeed } = body

    const profile = determineDifficultyProfile(history)

    // 1. Fetch preferences
    let preferences: any = {}
    if (patientId) {
      const { data } = await supabase.from('profiles').select('preferences').eq('id', patientId).single()
      if (data?.preferences) preferences = data.preferences
    }

    if (!preferences.address) {
      preferences = {
        ...preferences,
        address: "123 Maple Street",
        phone_number: "555-0198",
        family_members: [
          { relation: "Daughter", name: "Sarah" },
          { relation: "Son", name: "David" },
          { relation: "Grandson", name: "Leo" }
        ],
        favorite_drink: "Tea",
        favorite_activity: "Gardening"
      }
    }

    // 2. Prepare AI generation prompt
    const prefsString = JSON.stringify(preferences, null, 2)
    const recentQuestionsStr = recentQuestions.length > 0 
      ? JSON.stringify(recentQuestions, null, 2)
      : '[]'

    const prompt = `
      You are an expert game designer creating cognitive exercises for seniors with mild cognitive impairment.
      Generate exactly 7 dual-task rounds.
      Target difficulty: ${profile.difficulty.toUpperCase()} (Level ${profile.userLevel}).
      Random Seed: ${randomSeed || Date.now()}
      
      PATIENT PERSONALIZATION:
      ${prefsString}

      CRITICAL RULES FOR QUESTIONS:
      1. KEEP QUESTIONS SHORT, DIRECT, AND STRAIGHT TO THE POINT (MAXIMUM 5 TO 7 WORDS).
      2. ABSOLUTELY NO NARRATIVE STORIES, FLUFF, OR PREAMBLES.
         - Good: "What is your daughter's name?"
         - Good: "Which tool turns a screw?"
         - Good: "What meal is eaten in the morning?"
         - Good: "Which season comes after winter?"
         - Good: "What is the opposite of 'Hot'?"
         - Good: "Which object is shaped like a circle?"
         - Good: "What color is a ripe banana?"
      
      CRITICAL RULES FOR OPTIONS / CHOICES:
      1. Every choice in "choices" MUST be short (1 to 2 words max).
      2. All 4 choices MUST be from the EXACT same semantic category as the correct answer.
         - If asking for a season, choices must be 4 distinct seasons: ["Spring", "Summer", "Autumn", "Winter"].
         - If asking for a meal, choices must be 4 distinct meals: ["Breakfast", "Lunch", "Dinner", "Snack"].
         - If asking for an opposite of 'Hot', choices must be 4 temperature words: ["Cold", "Warm", "Cool", "Sunny"].
         - If asking for a daughter's name, choices must be 4 female names: ["Sarah", "Emily", "Laura", "Anna"].
         - If asking for a shape/circle, choices must be 4 everyday objects: ["Coin", "Book", "Box", "Door"].
      3. Exactly one choice in "choices" MUST match "correctAnswer" character-for-character.
      4. Never give nonsensical, duplicate, or unrelated choices.

      REQUIRED DOMAINS TO MIX:
      - Object Recognition (Visuospatial) -> Gesture: 'both-raise'
      - Personal Memory (Episodic) -> Gesture: 'ear-cover'
      - Language / Opposites -> Gesture: 'left-raise'
      - Orientation / Time / Season -> Gesture: 'right-raise'
      - Attention / Simple Numbers -> Gesture: 'both-raise'

      GESTURES & PHYSICAL INSTRUCTIONS (strictly limited to these 4 only):
      - 'left-raise' -> "Raise your LEFT hand"
      - 'right-raise' -> "Raise your RIGHT hand"
      - 'both-raise' -> "Raise BOTH hands"
      - 'ear-cover' -> "Touch both hands to your ears"

      Do NOT repeat these recent questions: ${recentQuestionsStr}
    `

    let finalLevels: any[] = []
    let isPersonalized = false

    const candidateModels = ['llama-3.1-8b-instant', 'qwen/qwen3.8-27b', 'gemma2-9b-it', 'llama-3.3-70b-versatile']

    if (process.env.GROQ_API_KEY) {
      for (const modelName of candidateModels) {
        try {
          const result = await generateObject({
            model: groq(modelName),
            schema: GenerationSchema,
            prompt: prompt,
            temperature: 0.5,
          })
          if (result.object?.rounds && result.object.rounds.length > 0) {
            // Sanitize choices and ensure correctAnswer exists in choices
            finalLevels = result.object.rounds.map((r, i) => {
              let choices = Array.isArray(r.choices) ? r.choices.slice(0, 4) : []
              if (!choices.includes(r.correctAnswer)) {
                if (choices.length >= 4) {
                  choices[0] = r.correctAnswer
                } else {
                  choices.push(r.correctAnswer)
                }
              }
              // Fill up to 4 if less
              while (choices.length < 4) {
                choices.push(`Option ${choices.length + 1}`)
              }

              return {
                ...r,
                choices,
                id: i + 1,
              }
            })

            if (prefsString !== '{}') {
              isPersonalized = true
            }
            break
          }
        } catch (llmError: any) {
          console.warn(`[generate-levels] Model ${modelName} failed:`, llmError.message)
        }
      }
    }

    if (finalLevels.length === 0) {
      // Fallback
      finalLevels = FALLBACK_ROUNDS.map((q: any, index: number) => ({
        id: index + 1,
        domain: q.domain,
        physicalInstruction: q.physical_instruction,
        cognitiveQuestion: q.cognitive_question,
        correctAnswer: q.correct_answer,
        choices: q.choices,
        gesture: q.gesture,
        difficulty: q.difficulty,
        level: q.level,
      }))
    }

    return NextResponse.json({
      levels: finalLevels,
      userLevel: profile.userLevel,
      profileName: profile.profileName,
      difficulty: profile.difficulty,
      sessionCount: history?.length || 0,
      isPersonalized
    })
  } catch (error: any) {
    console.error('Error generating levels:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate levels' },
      { status: 500 }
    )
  }
}
