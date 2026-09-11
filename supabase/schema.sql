-- ==============================================================================
-- COGNIA - Complete Database Schema (Single File)
-- Compatible with Supabase / PostgreSQL
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- Table: profiles
-- User accounts for both caregivers and patients
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'caregiver')),
  email TEXT NULL,
  password_hash TEXT NULL,
  current_streak INTEGER NULL DEFAULT 0,
  longest_streak INTEGER NULL DEFAULT 0,
  last_session_date DATE NULL,
  preferences JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_role_key UNIQUE (email, role)
);

CREATE INDEX IF NOT EXISTS idx_profiles_email_role ON public.profiles(email, role);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================================
-- Table: patient_caregiver_relations
-- Junction table mapping caregivers to their managed patients
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.patient_caregiver_relations (
  patient_id UUID NOT NULL,
  caregiver_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_switched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT patient_caregiver_relations_pkey PRIMARY KEY (patient_id, caregiver_id),
  CONSTRAINT patient_caregiver_relations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT patient_caregiver_relations_caregiver_id_fkey FOREIGN KEY (caregiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pcr_caregiver_id ON public.patient_caregiver_relations(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_pcr_patient_id ON public.patient_caregiver_relations(patient_id);
CREATE INDEX IF NOT EXISTS idx_pcr_last_switched ON public.patient_caregiver_relations(last_switched_at DESC);

-- ==============================================================================
-- Table: invites
-- Invite codes for onboarding (caregivers bootstrap, patients join caregivers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('caregiver', 'patient')),
  created_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  patient_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT invites_pkey PRIMARY KEY (id),
  CONSTRAINT invites_code_key UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS idx_invites_code ON public.invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON public.invites(created_by);

-- ==============================================================================
-- Table: game_sessions
-- Daily cognitive training session headers completed by patients
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_score INTEGER NULL,
  results_jsonb JSONB NULL,
  mood_reported TEXT NULL,
  did_breathing_exercise BOOLEAN NULL DEFAULT false,
  loops_completed INTEGER NULL DEFAULT 1,
  CONSTRAINT game_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT game_sessions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_patient_completed ON public.game_sessions(patient_id, completed_at DESC);

-- ==============================================================================
-- Table: session_results
-- Normalized round-by-round results for cognitive exercise sessions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.session_results (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  round_id INTEGER NOT NULL,
  domain TEXT NOT NULL,
  chosen_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  reaction_time_ms INTEGER NOT NULL,
  physical_gesture_confirmed BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT session_results_pkey PRIMARY KEY (id),
  CONSTRAINT session_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.game_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_results_session_id ON public.session_results(session_id);
CREATE INDEX IF NOT EXISTS idx_session_results_domain ON public.session_results(domain);

-- ==============================================================================
-- Table: question_bank
-- Cognitive and physical questions generated for training levels
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.question_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  physical_instruction TEXT NOT NULL,
  cognitive_question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  choices JSONB NOT NULL,
  gesture TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  level INTEGER NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT question_bank_pkey PRIMARY KEY (id),
  CONSTRAINT question_bank_cognitive_question_key UNIQUE (cognitive_question)
);

CREATE INDEX IF NOT EXISTS idx_question_bank_level_difficulty ON public.question_bank(level, difficulty);

-- ==============================================================================
-- Row Level Security (RLS) & Access Policies
-- (Configured for Supabase anon client access used throughout the app)
-- ==============================================================================

-- 1. profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
CREATE POLICY "Allow public read access on profiles" ON public.profiles
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on profiles" ON public.profiles;
CREATE POLICY "Allow public insert on profiles" ON public.profiles
  FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on profiles" ON public.profiles;
CREATE POLICY "Allow public update on profiles" ON public.profiles
  FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on profiles" ON public.profiles;
CREATE POLICY "Allow public delete on profiles" ON public.profiles
  FOR DELETE TO public USING (true);

-- 2. patient_caregiver_relations
ALTER TABLE public.patient_caregiver_relations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on patient_caregiver_relations" ON public.patient_caregiver_relations;
CREATE POLICY "Allow public all on patient_caregiver_relations" ON public.patient_caregiver_relations
  FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. invites
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on invites" ON public.invites;
CREATE POLICY "Allow public read access on invites" ON public.invites
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert and update on invites" ON public.invites;
CREATE POLICY "Allow public insert and update on invites" ON public.invites
  FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. game_sessions
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on game_sessions" ON public.game_sessions;
CREATE POLICY "Allow public all on game_sessions" ON public.game_sessions
  FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. session_results
ALTER TABLE public.session_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on session_results" ON public.session_results;
CREATE POLICY "Allow public all on session_results" ON public.session_results
  FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. question_bank
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on question_bank" ON public.question_bank;
CREATE POLICY "Allow public all on question_bank" ON public.question_bank
  FOR ALL TO public USING (true) WITH CHECK (true);

-- ==============================================================================
-- Initial Bootstrap Seed Data
-- ==============================================================================

-- Seed default initial caregiver invite code
INSERT INTO public.invites (code, role, max_uses)
VALUES ('COGNIA-CARE-2026', 'caregiver', 100)
ON CONFLICT (code) DO NOTHING;
