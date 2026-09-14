import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyOtp, consumeVerifiedEmail, verifyResetToken, consumeResetToken, hashPassword, validatePassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, email, otp, newPassword } = body

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required.' },
        { status: 400 }
      )
    }

    // 1. Validate password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    let cleanEmail = email ? String(email).trim().toLowerCase() : ''

    // 2. Verify token (if link reset) or OTP (if code reset)
    if (token) {
      const tokenResult = verifyResetToken(String(token).trim())
      if (!tokenResult.valid || !tokenResult.email) {
        return NextResponse.json(
          { error: tokenResult.error || 'Invalid or expired password reset link.' },
          { status: 400 }
        )
      }
      cleanEmail = tokenResult.email
    } else if (otp && cleanEmail) {
      const otpResult = verifyOtp(cleanEmail, String(otp).trim())
      if (!otpResult.success) {
        return NextResponse.json(
          { error: otpResult.error || 'Invalid or expired verification code.' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Valid reset token or verification code is required.' },
        { status: 400 }
      )
    }

    // 3. Find user profile in database
    const { data: existingProfiles, error: queryError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .ilike('email', cleanEmail)

    if (queryError) {
      console.error('Database query error on password reset:', queryError)
    }

    if (!existingProfiles || existingProfiles.length === 0) {
      return NextResponse.json(
        { error: 'Account not found.' },
        { status: 404 }
      )
    }

    // 4. Hash new password
    const hashedPassword = hashPassword(newPassword)

    // 5. Update password_hash in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ password_hash: hashedPassword })
      .ilike('email', cleanEmail)

    if (updateError) {
      console.error('Failed to update password_hash in database:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password in database: ' + updateError.message },
        { status: 500 }
      )
    }

    // 6. Clear reset session
    if (token) {
      consumeResetToken(String(token).trim())
    }
    if (cleanEmail) {
      consumeVerifiedEmail(cleanEmail)
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully! You can now sign in with your new password.'
    })
  } catch (err: any) {
    console.error('Reset password error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting your password.' },
      { status: 500 }
    )
  }
}
