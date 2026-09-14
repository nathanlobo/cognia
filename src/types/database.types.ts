export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      question_bank: {
        Row: {
          id: string
          domain: string
          physical_instruction: string
          cognitive_question: string
          correct_answer: string
          choices: any
          gesture: string
          difficulty: string
          level: number | null
          created_at: string
        }
        Insert: {
          id?: string | null
          domain: string
          physical_instruction: string
          cognitive_question: string
          correct_answer: string
          choices: any
          gesture: string
          difficulty: string
          level?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          domain?: string | null
          physical_instruction?: string | null
          cognitive_question?: string | null
          correct_answer?: string | null
          choices?: any | null
          gesture?: string | null
          difficulty?: string | null
          level?: number | null
          created_at?: string | null
        }
      }
      invites: {
        Row: {
          id: string
          code: string
          role: string
          created_by: string | null
          patient_id: string | null
          max_uses: number
          uses: number
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          code: string
          role: string
          created_by?: string | null
          patient_id?: string | null
          max_uses?: number | null
          uses: number
          expires_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          code?: string | null
          role?: string | null
          created_by?: string | null
          patient_id?: string | null
          max_uses?: number | null
          uses?: number | null
          expires_at?: string | null
          created_at?: string | null
        }
      }
      game_sessions: {
        Row: {
          id: string
          patient_id: string
          completed_at: string
          total_score: number | null
          results_jsonb: any | null
          mood_reported: string | null
          did_breathing_exercise: boolean | null
          loops_completed: number | null
        }
        Insert: {
          id?: string | null
          patient_id: string
          completed_at?: string | null
          total_score?: number | null
          results_jsonb?: any | null
          mood_reported?: string | null
          did_breathing_exercise?: boolean | null
          loops_completed?: number | null
        }
        Update: {
          id?: string | null
          patient_id?: string | null
          completed_at?: string | null
          total_score?: number | null
          results_jsonb?: any | null
          mood_reported?: string | null
          did_breathing_exercise?: boolean | null
          loops_completed?: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          role: string
          email: string | null
          password_hash: string | null
          current_streak: number | null
          longest_streak: number | null
          last_session_date: string | null
          preferences: any | null
          created_at: string
          avatar_url: string | null
          google_id: string | null
        }
        Insert: {
          id?: string | null
          full_name: string
          role: string
          email?: string | null
          password_hash?: string | null
          current_streak?: number | null
          longest_streak?: number | null
          last_session_date?: string | null
          preferences?: any | null
          created_at?: string | null
          avatar_url?: string | null
          google_id?: string | null
        }
        Update: {
          id?: string | null
          full_name?: string | null
          role?: string | null
          email?: string | null
          password_hash?: string | null
          current_streak?: number | null
          longest_streak?: number | null
          last_session_date?: string | null
          preferences?: any | null
          created_at?: string | null
          avatar_url?: string | null
          google_id?: string | null
        }
      }
      session_results: {
        Row: {
          id: string
          session_id: string
          round_id: number
          domain: string
          chosen_answer: string
          correct_answer: string
          is_correct: boolean
          reaction_time_ms: number
          physical_gesture_confirmed: boolean
          created_at: string
        }
        Insert: {
          id?: string | null
          session_id: string
          round_id: number
          domain: string
          chosen_answer: string
          correct_answer: string
          is_correct: boolean
          reaction_time_ms: number
          physical_gesture_confirmed: boolean
          created_at?: string | null
        }
        Update: {
          id?: string | null
          session_id?: string | null
          round_id?: number | null
          domain?: string | null
          chosen_answer?: string | null
          correct_answer?: string | null
          is_correct?: boolean | null
          reaction_time_ms?: number | null
          physical_gesture_confirmed?: boolean | null
          created_at?: string | null
        }
      }
      patient_caregiver_relations: {
        Row: {
          patient_id: string
          caregiver_id: string
          created_at: string
          last_switched_at: string
        }
        Insert: {
          patient_id: string
          caregiver_id: string
          created_at?: string | null
          last_switched_at?: string | null
        }
        Update: {
          patient_id?: string | null
          caregiver_id?: string | null
          created_at?: string | null
          last_switched_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
