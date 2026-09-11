import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  hashPassword, 
  validatePassword, 
  getFallbackInvite, 
  incrementFallbackInviteUses,
  isEmailVerified,
  verifyOtp,
  consumeVerifiedEmail
} from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, fullName, role, inviteCode, otp } = body

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Email, password, full name, and role are required.' },
        { status: 400 }
      )
    }

    if (role !== 'caregiver' && role !== 'patient') {
      return NextResponse.json(
        { error: 'Invalid role specified.' },
        { status: 400 }
      )
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const cleanName = String(fullName).trim()
    const cleanCode = inviteCode ? String(inviteCode).trim().toUpperCase() : ''

    // 1. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // 2. Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // 3. Verify OTP code
    let emailVerified = isEmailVerified(cleanEmail)
    if (!emailVerified && otp) {
      const otpCheck = verifyOtp(cleanEmail, String(otp).trim())
      if (otpCheck.success) {
        emailVerified = true
      } else {
        return NextResponse.json(
          { error: otpCheck.error || 'Invalid email verification code.' },
          { status: 400 }
        )
      }
    }

    if (!emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address with the 6-digit code before registering.' },
        { status: 400 }
      )
    }

    // 4. Role-specific invite validation:
    // - Caregivers: can sign up directly without an invite code.
    // - Patients: MUST provide a valid invite code tied to their caregiver.
    let inviteRecord: any = null
    if (role === 'patient') {
      if (!cleanCode) {
        return NextResponse.json(
          { error: 'Patient registration requires a valid invite link or invite code from your caregiver.' },
          { status: 400 }
        )
      }

      const { data: dbInvite, error: inviteDbError } = await supabase
        .from('invites')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle()

      if (!inviteDbError && dbInvite) {
        inviteRecord = dbInvite
        if (dbInvite.role !== 'patient') {
          return NextResponse.json(
            { error: 'This invite code is not valid for patient registration.' },
            { status: 400 }
          )
        }
        if (dbInvite.uses >= dbInvite.max_uses) {
          return NextResponse.json(
            { error: 'This patient invite link has already been used.' },
            { status: 400 }
          )
        }
        if (dbInvite.expires_at && new Date(dbInvite.expires_at).getTime() < Date.now()) {
          return NextResponse.json(
            { error: 'This invite code has expired.' },
            { status: 400 }
          )
        }
      } else {
        const fallbackInvite = getFallbackInvite(cleanCode)
        if (fallbackInvite) {
          if (fallbackInvite.role !== 'patient') {
            return NextResponse.json(
              { error: 'This invite code is not valid for patient registration.' },
              { status: 400 }
            )
          }
          if (fallbackInvite.uses >= fallbackInvite.max_uses) {
            return NextResponse.json(
              { error: 'This patient invite link has already been used.' },
              { status: 400 }
            )
          }
          inviteRecord = fallbackInvite
        } else {
          return NextResponse.json(
            { error: 'Invalid or unrecognized patient invite link. Please ask your caregiver to generate a new invite.' },
            { status: 400 }
          )
        }
      }
    }

    // 2. Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .eq('role', role)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: `An account with this email already exists for ${role}. Please log in instead.` },
        { status: 409 }
      )
    }

    // 3. Hash Password
    const passwordHash = hashPassword(password)

    // 4. Create Profile (with fallback to preferences if column not added yet)
    let newProfile: any = null
    const insertPayload = {
      email: cleanEmail,
      full_name: cleanName,
      role: role,
      password_hash: passwordHash,
      preferences: {}
    }

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert(insertPayload)
      .select('id, full_name, email, role')
      .single()

    if (insertError) {
      // Column 'password_hash' might not exist if user hasn't run the migration yet
      if (insertError.code === '42703' || insertError.message?.includes('password_hash')) {
        const fallbackPayload = {
          email: cleanEmail,
          full_name: cleanName,
          role: role,
          preferences: { password_hash: passwordHash }
        }
        const { data: fallbackInserted, error: fallbackError } = await supabase
          .from('profiles')
          .insert(fallbackPayload)
          .select('id, full_name, email, role')
          .single()

        if (fallbackError) {
          console.error('Signup profile insertion failed (fallback):', fallbackError)
          return NextResponse.json(
            { error: 'Failed to create profile: ' + fallbackError.message },
            { status: 500 }
          )
        }
        newProfile = fallbackInserted
      } else {
        console.error('Signup profile insertion failed:', insertError)
        return NextResponse.json(
          { error: 'Failed to create profile: ' + insertError.message },
          { status: 500 }
        )
      }
    } else {
      newProfile = inserted
    }

    // 5. Update Invite Usage & Link Caregiver/Patient if applicable
    incrementFallbackInviteUses(cleanCode)

    if (inviteRecord) {
      if (inviteRecord.id) {
        await supabase
          .from('invites')
          .update({ uses: (inviteRecord.uses || 0) + 1 })
          .eq('id', inviteRecord.id)
      }

      // If a caregiver invited this patient, link them immediately
      if (role === 'patient' && inviteRecord.created_by && newProfile) {
        await supabase
          .from('patient_caregiver_relations')
          .upsert({
            caregiver_id: inviteRecord.created_by,
            patient_id: newProfile.id
          })
      }
    }

    consumeVerifiedEmail(cleanEmail)

    return NextResponse.json({
      success: true,
      profile: {
        id: newProfile.id,
        full_name: newProfile.full_name,
        email: newProfile.email,
        role: newProfile.role
      }
    })
  } catch (err: any) {
    console.error('Auth signup exception:', err)
    return NextResponse.json(
      { error: 'Internal server error during registration.' },
      { status: 500 }
    )
  }
}
