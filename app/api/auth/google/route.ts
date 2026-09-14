import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFallbackInvite, incrementFallbackInviteUses } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { credential, role = 'caregiver', inviteCode } = body

    if (!credential || typeof credential !== 'string') {
      return NextResponse.json(
        { error: 'Google credential token is required.' },
        { status: 400 }
      )
    }

    if (role !== 'caregiver' && role !== 'patient') {
      return NextResponse.json(
        { error: 'Invalid role specified.' },
        { status: 400 }
      )
    }

    // 1. Verify ID token with Google's tokeninfo endpoint
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    )

    if (!googleRes.ok) {
      const errData = await googleRes.json().catch(() => ({}))
      console.error('Google token verification failed:', errData)
      return NextResponse.json(
        { error: 'Google authentication failed or session has expired.' },
        { status: 401 }
      )
    }

    const tokenInfo = await googleRes.json()

    // 2. Validate expected audience if configured
    const configuredClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    if (configuredClientId && tokenInfo.aud !== configuredClientId) {
      console.error('Google token audience mismatch:', { aud: tokenInfo.aud, expected: configuredClientId })
      return NextResponse.json(
        { error: 'Google token validation mismatch.' },
        { status: 401 }
      )
    }

    if (!tokenInfo.email || (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true)) {
      return NextResponse.json(
        { error: 'Your Google account email must be verified.' },
        { status: 400 }
      )
    }

    const cleanEmail = String(tokenInfo.email).trim().toLowerCase()
    const cleanName = String(tokenInfo.name || tokenInfo.given_name || cleanEmail.split('@')[0]).trim()
    const avatarUrl = tokenInfo.picture || null
    const googleSub = tokenInfo.sub || null
    const cleanCode = inviteCode ? String(inviteCode).trim().toUpperCase() : ''

    // 3. Check if user already exists in profiles (case-insensitive)
    const { data: existingProfiles, error: queryError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, preferences')
      .ilike('email', cleanEmail)

    if (queryError) {
      console.error('Error querying profiles:', queryError)
    }

    if (existingProfiles && existingProfiles.length > 0) {
      // Prioritize profile matching requested role, or reuse existing profile
      const matchedProfile =
        existingProfiles.find((p) => p.role === role || p.role?.includes(role)) || existingProfiles[0]

      // Link Google metadata into preferences without overwriting other preferences
      const updatedPrefs = {
        ...(matchedProfile.preferences || {}),
        google_id: googleSub || matchedProfile.preferences?.google_id,
        avatar_url: avatarUrl || matchedProfile.preferences?.avatar_url
      }

      const updateData: any = { preferences: updatedPrefs }
      if ((!matchedProfile.full_name || matchedProfile.full_name === cleanEmail) && cleanName) {
        updateData.full_name = cleanName
      }

      // If user logs in with a role they didn't have yet, combine roles rather than duplicating
      let effectiveRole = matchedProfile.role || ''
      if (role && !effectiveRole.includes(role)) {
        effectiveRole = effectiveRole ? `${effectiveRole}, ${role}` : role
        updateData.role = effectiveRole
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', matchedProfile.id)

      // If invited patient logs in with Google, associate with caregiver
      if (cleanCode && (matchedProfile.role === 'patient' || effectiveRole.includes('patient'))) {
        const { data: dbInvite } = await supabase
          .from('invites')
          .select('*')
          .eq('code', cleanCode)
          .maybeSingle()

        if (dbInvite?.created_by) {
          await supabase
            .from('patient_caregiver_relations')
            .upsert({
              caregiver_id: dbInvite.created_by,
              patient_id: matchedProfile.id
            })
        }
      }

      return NextResponse.json({
        success: true,
        profile: {
          id: matchedProfile.id,
          full_name: updateData.full_name || matchedProfile.full_name,
          email: matchedProfile.email,
          role: role || effectiveRole,
          avatar_url: avatarUrl || matchedProfile.preferences?.avatar_url,
          google_id: googleSub || matchedProfile.preferences?.google_id
        },
        isNewUser: false
      })
    }

    // 4. If creating a new patient, validate invite code
    let inviteRecord: any = null
    if (role === 'patient') {
      if (!cleanCode) {
        return NextResponse.json(
          { error: 'Patient registration requires a valid invite link from your caregiver.' },
          { status: 400 }
        )
      }

      const { data: dbInvite } = await supabase
        .from('invites')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle()

      if (dbInvite) {
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
            { error: 'Invalid patient invite code.' },
            { status: 400 }
          )
        }
      }
    }

    // 5. Create new profile in Supabase
    const insertPayload = {
      email: cleanEmail,
      full_name: cleanName,
      role: role,
      password_hash: null,
      preferences: {
        google_id: googleSub,
        avatar_url: avatarUrl
      }
    }

    let newProfile: any = null
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert(insertPayload)
      .select('id, full_name, email, role')
      .single()

    if (insertError) {
      // Fallback if password_hash column does not exist in schema
      if (insertError.code === '42703' || insertError.message?.includes('password_hash')) {
        const fallbackPayload = {
          email: cleanEmail,
          full_name: cleanName,
          role: role,
          preferences: {
            google_id: googleSub,
            avatar_url: avatarUrl
          }
        }
        const { data: fallbackInserted, error: fallbackError } = await supabase
          .from('profiles')
          .insert(fallbackPayload)
          .select('id, full_name, email, role')
          .single()

        if (fallbackError) {
          console.error('Failed to create profile (fallback):', fallbackError)
          return NextResponse.json(
            { error: 'Failed to create profile: ' + fallbackError.message },
            { status: 500 }
          )
        }
        newProfile = fallbackInserted
      } else {
        console.error('Failed to create profile:', insertError)
        return NextResponse.json(
          { error: 'Failed to create profile: ' + insertError.message },
          { status: 500 }
        )
      }
    } else {
      newProfile = inserted
    }

    // 6. Handle Invite Linking
    if (inviteRecord) {
      incrementFallbackInviteUses(cleanCode)

      if (inviteRecord.id) {
        await supabase
          .from('invites')
          .update({ uses: (inviteRecord.uses || 0) + 1 })
          .eq('id', inviteRecord.id)
      }

      if (role === 'patient' && inviteRecord.created_by && newProfile) {
        await supabase
          .from('patient_caregiver_relations')
          .upsert({
            caregiver_id: inviteRecord.created_by,
            patient_id: newProfile.id
          })
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: newProfile.id,
        full_name: newProfile.full_name,
        email: newProfile.email,
        role: newProfile.role,
        avatar_url: avatarUrl,
        google_id: googleSub
      },
      isNewUser: true
    })
  } catch (err: any) {
    console.error('Google Auth Route error:', err)
    return NextResponse.json(
      { error: 'Internal server error during Google authentication.' },
      { status: 500 }
    )
  }
}
