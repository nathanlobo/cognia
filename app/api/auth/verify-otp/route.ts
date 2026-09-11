import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and verification code are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const cleanOtp = String(otp).trim()

    const result = verifyOtp(cleanEmail, cleanOtp)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid verification code.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Email successfully verified.'
    })
  } catch (err: any) {
    console.error('Verify OTP error:', err)
    return NextResponse.json(
      { error: 'Failed to verify code. Please try again.' },
      { status: 500 }
    )
  }
}
