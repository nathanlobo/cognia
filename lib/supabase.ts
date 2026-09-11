import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('[Supabase] Warning: NEXT_PUBLIC_SUPABASE_URL is not configured.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
