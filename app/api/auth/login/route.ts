import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, role } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    if (role && role !== 'caregiver' && role !== 'patient') {
      return NextResponse.json(
        { error: 'Invalid role specified.' },
        { status: 400 }
      )
    }

    const cleanEmail = String(email).trim().toLowerCase()

    // 1. Fetch user profile (filtered by role if provided, otherwise all matching this email)
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role, password_hash, preferences')
      .eq('email', cleanEmail)

    if (role) {
      query = query.eq('role', role)
    }

    let profiles: any[] = []
    const { data, error: selectError } = await query

    if (selectError) {
      // Fallback if password_hash column not added to DB yet
      let fallbackQuery = supabase
        .from('profiles')
        .select('id, full_name, email, role, preferences')
        .eq('email', cleanEmail)

      if (role) {
        fallbackQuery = fallbackQuery.eq('role', role)
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery
      if (fallbackError || !fallbackData || fallbackData.length === 0) {
        return NextResponse.json(
          { error: 'No account found with this email. Please check your email or sign up.' },
          { status: 401 }
        )
      }
      profiles = fallbackData
    } else if (data) {
      profiles = data
    }

    if (profiles.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this email. Please check your email or sign up.' },
        { status: 401 }
      )
    }

    // 2. Verify password across matching candidate profiles
    let matchingProfile: any = null
    for (const cand of profiles) {
      const storedHash = cand.password_hash || cand.preferences?.password_hash
      if (storedHash && verifyPassword(password, storedHash)) {
        matchingProfile = cand
        break
      }
    }

    if (!matchingProfile) {
      return NextResponse.json(
        { error: 'Incorrect email or password. Please try again.' },
        { status: 401 }
      )
    }

    const profile = matchingProfile

    if (!profile) {
      return NextResponse.json(
        { error: `No ${role} account found with this email. Please check your email or sign up.` },
        { status: 401 }
      )
    }

    // 2. Extract password hash from column or preferences
    const storedHash = profile.password_hash || profile.preferences?.password_hash

    if (!storedHash) {
      return NextResponse.json(
        { error: 'This account was created without a password. Please sign up or contact your administrator.' },
        { status: 401 }
      )
    }

    // 3. Verify password
    const isPasswordValid = verifyPassword(password, storedHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect email or password. Please try again.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role
      }
    })
  } catch (err: any) {
    console.error('Auth login exception:', err)
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    )
  }
}
