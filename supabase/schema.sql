-- Auto-generated SQL schema from Supabase OpenAPI endpoint

CREATE TABLE IF NOT EXISTS public.question_bank (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain text NOT NULL,
  physical_instruction text NOT NULL,
  cognitive_question text NOT NULL,
  correct_answer text NOT NULL,
  choices jsonb NOT NULL,
  gesture text NOT NULL,
  difficulty text NOT NULL,
  level integer DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL,
  role text NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  patient_id uuid REFERENCES public.profiles(id),
  max_uses integer NOT NULL DEFAULT 1,
  uses integer NOT NULL,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.profiles(id),
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  total_score integer,
  results_jsonb jsonb,
  mood_reported text,
  did_breathing_exercise boolean,
  loops_completed integer DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  role text NOT NULL,
  email text,
  password_hash text,
  current_streak integer,
  longest_streak integer,
  last_session_date date,
  preferences jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  avatar_url text,
  google_id text
);

CREATE TABLE IF NOT EXISTS public.session_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.game_sessions(id),
  round_id integer NOT NULL,
  domain text NOT NULL,
  chosen_answer text NOT NULL,
  correct_answer text NOT NULL,
  is_correct boolean NOT NULL,
  reaction_time_ms integer NOT NULL,
  physical_gesture_confirmed boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_caregiver_relations (
  patient_id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles(id),
  caregiver_id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_switched_at timestamp with time zone NOT NULL DEFAULT now()
);

