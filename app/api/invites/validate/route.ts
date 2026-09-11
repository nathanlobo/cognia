import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFallbackInvite } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')?.trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ valid: false, error: 'No invite code provided.' }, { status: 400 })
    }

    let inviteRecord: any = null
    let caregiverName = 'Your Caregiver'

    // 1. Check DB invites
    const { data: dbInvite, error } = await supabase
      .from('invites')
      .select('*, caregiver:profiles!invites_created_by_fkey(full_name)')
      .eq('code', code)
      .maybeSingle()

    if (!error && dbInvite) {
      inviteRecord = dbInvite
      if (dbInvite.caregiver?.full_name) {
        caregiverName = dbInvite.caregiver.full_name
      }
    } else {
      // 2. Check fallback store
      const fallback = getFallbackInvite(code)
      if (fallback) {
        inviteRecord = fallback
        if (fallback.created_by) {
          const { data: cg } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', fallback.created_by)
            .maybeSingle()
          if (cg?.full_name) {
            caregiverName = cg.full_name
          }
        }
      }
    }

    if (!inviteRecord) {
      return NextResponse.json({
        valid: false,
        error: 'Invite link is invalid or does not exist.'
      }, { status: 404 })
    }

    if (inviteRecord.role !== 'patient') {
      return NextResponse.json({
        valid: false,
        error: 'This invite link is not intended for patient registration.'
      }, { status: 400 })
    }

    if (inviteRecord.uses >= inviteRecord.max_uses) {
      return NextResponse.json({
        valid: false,
        error: 'This invitation link has already been used.'
      }, { status: 410 })
    }

    if (inviteRecord.expires_at && new Date(inviteRecord.expires_at).getTime() < Date.now()) {
      return NextResponse.json({
        valid: false,
        error: 'This invitation link has expired.'
      }, { status: 410 })
    }

    return NextResponse.json({
      valid: true,
      role: inviteRecord.role,
      code: inviteRecord.code,
      caregiverName
    })
  } catch (err: any) {
    console.error('Validate invite error:', err)
    return NextResponse.json({ valid: false, error: 'Internal server error.' }, { status: 500 })
  }
}
