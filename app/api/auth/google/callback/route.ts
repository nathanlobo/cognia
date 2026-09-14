import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFallbackInvite, incrementFallbackInviteUses } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin

  try {
    const formData = await req.formData()
    const credential = formData.get('credential') as string | null

    if (!credential) {
      return NextResponse.redirect(`${origin}/auth/callback?error=${encodeURIComponent('No credential received from Google.')}`, 303)
    }

    // 1. Verify token with Google
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    )

    if (!googleRes.ok) {
      return NextResponse.redirect(`${origin}/auth/callback?error=${encodeURIComponent('Google authentication failed or expired.')}`, 303)
    }

    const tokenInfo = await googleRes.json()

    // 2. Validate expected client ID if configured
    const configuredClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    if (configuredClientId && tokenInfo.aud !== configuredClientId) {
      console.error('Audience mismatch on redirect callback:', { aud: tokenInfo.aud, expected: configuredClientId })
      return NextResponse.redirect(`${origin}/auth/callback?error=${encodeURIComponent('Google Client ID validation failed.')}`, 303)
    }

    if (!tokenInfo.email || (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true)) {
      return NextResponse.redirect(`${origin}/auth/callback?error=${encodeURIComponent('Your Google account email must be verified.')}`, 303)
    }

    const cleanEmail = String(tokenInfo.email).trim().toLowerCase()
    const cleanName = String(tokenInfo.name || tokenInfo.given_name || cleanEmail.split('@')[0]).trim()
    const avatarUrl = tokenInfo.picture || null
    const googleSub = tokenInfo.sub || null

    // 3. Read role and inviteCode from cookies
    const cookieRole = req.cookies.get('cognia_oauth_role')?.value
    const role = (cookieRole === 'patient' ? 'patient' : 'caregiver') as 'patient' | 'caregiver'
    const cookieInvite = req.cookies.get('cognia_oauth_invite')?.value
    const cleanCode = cookieInvite ? String(cookieInvite).trim().toUpperCase() : ''

    // 4. Lookup existing profile (case-insensitive)
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, preferences')
      .ilike('email', cleanEmail)

    let finalProfile: { id: string; full_name: string; email: string; role: string; avatar_url?: string; google_id?: string } | null = null

    if (existingProfiles && existingProfiles.length > 0) {
      const matchedProfile =
        existingProfiles.find((p) => p.role === role) || existingProfiles[0]

      const updatedPrefs = {
        ...(matchedProfile.preferences || {}),
        google_id: googleSub || matchedProfile.preferences?.google_id,
        avatar_url: avatarUrl || matchedProfile.preferences?.avatar_url
      }

      const updateData: any = { preferences: updatedPrefs }
      if ((!matchedProfile.full_name || matchedProfile.full_name === cleanEmail) && cleanName) {
        updateData.full_name = cleanName
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', matchedProfile.id)

      // If invited patient logs in with Google, associate with caregiver
      if (cleanCode && matchedProfile.role === 'patient') {
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

      finalProfile = {
        id: matchedProfile.id,
        full_name: updateData.full_name || matchedProfile.full_name,
        email: matchedProfile.email,
        role: matchedProfile.role,
        avatar_url: avatarUrl || matchedProfile.preferences?.avatar_url,
        google_id: googleSub || matchedProfile.preferences?.google_id
      }
    } else {
      // 5. New profile creation
      let inviteRecord: any = null
      if (role === 'patient') {
        if (!cleanCode) {
          return NextResponse.redirect(`${origin}/auth/callback?error=${encodeURIComponent('Patient registration requires a valid invite link.')}`, 303)
        }

        const { data: dbInvite } = await supabase
          .from('invites')
          .select('*')
          .eq('code', cleanCode)
          .maybeSingle()

        if (dbInvite && dbInvite.role === 'patient' && dbInvite.uses < dbInvite.max_uses) {
          inviteRecord = dbInvite
        } else {
          const fallbackInvite = getFallbackInvite(cleanCode)
          if (fallbackInvite && fallbackInvite.role === 'patient' && fallbackInvite.uses < fallbackInvite.max_uses) {
            inviteRecord = fallbackInvite
          } else {
            return NextResponse.redirect(`${origin}/auth/callback?error=${encodeURIComponent('Invalid or expired patient invite code.')}`, 303)
          }
        }
      }

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

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert(insertPayload)
        .select('id, full_name, email, role')
        .single()

      if (insertError) {
        // Fallback for schema variance
        const fallbackPayload = {
          email: cleanEmail,
          full_name: cleanName,
          role: role,
          preferences: { google_id: googleSub, avatar_url: avatarUrl }
        }
        const { data: fallbackInserted } = await supabase
          .from('profiles')
          .insert(fallbackPayload)
          .select('id, full_name, email, role')
          .single()

        finalProfile = fallbackInserted
      } else {
        finalProfile = inserted
      }

      if (inviteRecord && finalProfile) {
        incrementFallbackInviteUses(cleanCode)
        if (inviteRecord.id) {
          await supabase
            .from('invites')
            .update({ uses: (inviteRecord.uses || 0) + 1 })
            .eq('id', inviteRecord.id)
        }
        if (role === 'patient' && inviteRecord.created_by) {
          await supabase
            .from('patient_caregiver_relations')
            .upsert({
              caregiver_id: inviteRecord.created_by,
              patient_id: finalProfile.id
            })
        }
      }
    }

    if (!finalProfile) {
      return NextResponse.redirect(`${origin}/auth/callback?error=${encodeURIComponent('Could not create or retrieve user profile.')}`, 303)
    }

    // 6. Redirect to callback completion page and clear temporary cookies
    const redirectUrl = new URL(`${origin}/auth/callback`)
    redirectUrl.searchParams.set('id', finalProfile.id)
    redirectUrl.searchParams.set('email', encodeURIComponent(finalProfile.email))
    redirectUrl.searchParams.set('name', encodeURIComponent(finalProfile.full_name))
    redirectUrl.searchParams.set('role', finalProfile.role)

    const avatarParam = finalProfile.avatar_url || avatarUrl
    if (avatarParam) {
      redirectUrl.searchParams.set('avatar', encodeURIComponent(avatarParam))
    }
    const googleIdParam = finalProfile.google_id || googleSub
    if (googleIdParam) {
      redirectUrl.searchParams.set('google_id', encodeURIComponent(googleIdParam))
    }

    const response = NextResponse.redirect(redirectUrl.toString(), 303)
    response.cookies.delete('cognia_oauth_role')
    response.cookies.delete('cognia_oauth_invite')

    return response
  } catch (err: any) {
    console.error('Exception in Google OAuth callback route:', err)
    return NextResponse.redirect(`${origin}/auth/callback?error=${encodeURIComponent('Unexpected error during Google authentication.')}`, 303)
  }
}
