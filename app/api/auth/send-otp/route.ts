import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateOtp, storeOtp } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, role } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
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

    // Check if account already exists for this role
    if (role) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .eq('role', role)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: `An account with this email already exists for ${role}. Please log in instead.` },
          { status: 409 }
        )
      }
    }

    // Generate and store OTP
    const otp = generateOtp()
    storeOtp(cleanEmail, otp)

    // Dispatch OTP email (via Brevo SMTP or dev fallback)
    const emailResult = await sendOtpEmail(cleanEmail, otp)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send verification email. Please check your address.' },
        { status: 500 }
      )
    }

    console.log(`[Cognia OTP] Code generated for ${cleanEmail}: ${otp} (SMTP simulated: ${emailResult.simulated})`)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email.',
      simulated: emailResult.simulated
    })
  } catch (err: any) {
    console.error('Send OTP error:', err)
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    )
  }
}
