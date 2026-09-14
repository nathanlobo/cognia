import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateResetToken, storeResetToken } from '@/lib/auth'
import { sendPasswordResetLinkEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Please enter your email address.' },
        { status: 400 }
      )
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // Check if account exists in profiles
    const { data: existingProfiles, error: queryError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .ilike('email', cleanEmail)

    if (queryError) {
      console.error('Error querying profile for password reset:', queryError)
    }

    if (!existingProfiles || existingProfiles.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this email address.' },
        { status: 404 }
      )
    }

    // Generate secure token and reset link
    const resetToken = generateResetToken()
    storeResetToken(cleanEmail, resetToken, 60) // 60 minutes expiry

    const origin = req.nextUrl.origin
    const resetLink = `${origin}/app/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`

    // Dispatch Password Reset Link Email via Brevo SMTP or dev simulation
    const emailResult = await sendPasswordResetLinkEmail(cleanEmail, resetLink)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send password reset email. Please try again.' },
        { status: 500 }
      )
    }

    console.log(`[Cognia Password Reset] Link generated for ${cleanEmail}: ${resetLink} (SMTP simulated: ${emailResult.simulated})`)

    return NextResponse.json({
      success: true,
      message: `A secure password reset link has been sent to ${cleanEmail}. Please check your inbox.`,
      resetLink: emailResult.simulated ? resetLink : undefined,
      simulated: emailResult.simulated
    })
  } catch (err: any) {
    console.error('Forgot password error:', err)
    return NextResponse.json(
      { error: 'Failed to process password reset request. Please try again.' },
      { status: 500 }
    )
  }
}
