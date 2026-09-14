import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFallbackInvitesByCaregiver, deleteFallbackInvite } from '@/lib/auth'

/**
 * GET /api/invites?caregiverId=xxx
 * Returns all active invites created by a specific caregiver.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const caregiverId = searchParams.get('caregiverId')

    if (!caregiverId) {
      return NextResponse.json(
        { error: 'Caregiver ID is required.' },
        { status: 400 }
      )
    }

    // 1. Fetch from Supabase
    const { data: dbInvites, error: queryError } = await supabase
      .from('invites')
      .select('id, code, role, max_uses, uses, created_at, expires_at')
      .eq('created_by', caregiverId)
      .order('created_at', { ascending: false })

    if (queryError) {
      console.warn('Could not query invites table:', queryError.message)
    }

    // 2. Fetch from fallback memory store
    const fallbackList = getFallbackInvitesByCaregiver(caregiverId)

    // Merge without duplicates by code
    const inviteMap = new Map<string, any>()

    if (dbInvites) {
      dbInvites.forEach(inv => inviteMap.set(inv.code.toUpperCase(), inv))
    }
    fallbackList.forEach(inv => {
      if (!inviteMap.has(inv.code.toUpperCase())) {
        inviteMap.set(inv.code.toUpperCase(), inv)
      }
    })

    const invites = Array.from(inviteMap.values())

    return NextResponse.json({
      success: true,
      invites
    })
  } catch (err: any) {
    console.error('Error fetching caregiver invites:', err)
    return NextResponse.json(
      { error: 'Internal error while fetching invites.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/invites?code=xxx&caregiverId=xxx
 * Invalidates / deletes an invite code created by the caregiver.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const caregiverId = searchParams.get('caregiverId')

    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required to delete.' },
        { status: 400 }
      )
    }

    const cleanCode = String(code).trim().toUpperCase()

    // 1. Delete from fallback store
    deleteFallbackInvite(cleanCode)

    // 2. Delete from Supabase
    let query = supabase.from('invites').delete().eq('code', cleanCode)
    if (caregiverId) {
      query = query.eq('created_by', caregiverId)
    }

    const { error: deleteError } = await query

    if (deleteError) {
      console.warn('Could not delete from Supabase invites table:', deleteError.message)
    }

    return NextResponse.json({
      success: true,
      message: `Invite code ${cleanCode} has been deleted and invalidated.`
    })
  } catch (err: any) {
    console.error('Error deleting invite code:', err)
    return NextResponse.json(
      { error: 'Internal error while deleting invite code.' },
      { status: 500 }
    )
  }
}
