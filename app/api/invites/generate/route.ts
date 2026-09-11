import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateInviteCode, saveFallbackInvite } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { caregiverId, targetRole = 'patient', maxUses = 1 } = body

    if (!caregiverId) {
      return NextResponse.json(
        { error: 'Caregiver ID is required to generate an invite.' },
        { status: 400 }
      )
    }

    // 1. Verify caregiver exists
    const { data: caregiver, error: cgError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', caregiverId)
      .maybeSingle()

    if (cgError || !caregiver) {
      return NextResponse.json(
        { error: 'Caregiver profile not found.' },
        { status: 404 }
      )
    }

    if (caregiver.role !== 'caregiver') {
      return NextResponse.json(
        { error: 'Only caregivers can generate patient invite codes.' },
        { status: 403 }
      )
    }

    // 2. Generate invite code
    const role = targetRole === 'caregiver' ? 'caregiver' : 'patient'
    const code = generateInviteCode(role)

    // Store in fallback memory store
    saveFallbackInvite({
      code,
      role,
      created_by: caregiverId,
      max_uses: maxUses,
      uses: 0
    })

    // 3. Try to insert into invites table
    const { data: invite, error: insertError } = await supabase
      .from('invites')
      .insert({
        code,
        role,
        created_by: caregiverId,
        max_uses: maxUses,
        uses: 0
      })
      .select('id, code, role, max_uses, created_at')
      .single()

    if (insertError) {
      console.warn('Could not insert into invites table (schema might not be applied yet):', insertError.message)
      // Fallback: return the generated code so testing can continue
      return NextResponse.json({
        success: true,
        code,
        role,
        max_uses: maxUses,
        warning: 'Invites table not yet migrated in Supabase; please apply invites.sql for full persistence.'
      })
    }

    return NextResponse.json({
      success: true,
      invite: {
        code: invite.code,
        role: invite.role,
        max_uses: invite.max_uses,
        created_at: invite.created_at
      }
    })
  } catch (err: any) {
    console.error('Invite generation error:', err)
    return NextResponse.json(
      { error: 'Internal server error while generating invite code.' },
      { status: 500 }
    )
  }
}
