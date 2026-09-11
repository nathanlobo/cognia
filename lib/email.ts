import nodemailer from 'nodemailer'

/**
 * Sends a 6-digit OTP verification email using SMTP (e.g. Brevo)
 * If SMTP credentials are not yet set, falls back to dev simulation.
 */
export async function sendOtpEmail(email: string, otp: string): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'Cognia <no-reply@codinx.app>'

  const isSmtpConfigured = Boolean(host && user && pass)

  if (!isSmtpConfigured) {
    console.log(`\n======================================================`)
    console.log(`[EMAIL SIMULATION - Brevo SMTP not configured yet]`)
    console.log(`Recipient: ${email}`)
    console.log(`Verification Code (OTP): >>> ${otp} <<<`)
    console.log(`To configure real delivery, set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local`)
    console.log(`======================================================\n`)

    return { success: true, simulated: true }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user,
        pass
      }
    })

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #F8FAFC; border-radius: 16px; border: 1px solid #E2E8F0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1E40AF; font-size: 26px; font-weight: 800; margin: 0;">Cognia</h1>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Daily Cognitive Wellness & Care Companion</p>
        </div>
        
        <div style="background-color: #FFFFFF; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); text-align: center;">
          <h2 style="color: #1E293B; font-size: 18px; font-weight: 700; margin-bottom: 12px;">Verify Your Email Address</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            Please use the one-time verification code below to complete your registration on Cognia.
          </p>
          
          <div style="display: inline-block; background-color: #EFF6FF; border: 2px dashed #3B82F6; border-radius: 10px; padding: 14px 32px; margin-bottom: 20px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1D4ED8;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #94A3B8; font-size: 12px; margin: 0;">
            This code expires in 10 minutes. If you did not request this, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #94A3B8; font-size: 11px; margin: 0;">
            Sent by Cognia &bull; codinx.app
          </p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from,
      to: email,
      subject: `Your Cognia Verification Code: ${otp}`,
      text: `Your Cognia verification code is: ${otp}. It will expire in 10 minutes.`,
      html: htmlContent
    })

    return { success: true, simulated: false }
  } catch (error: any) {
    console.error('Failed to send email via SMTP:', error)
    return { success: false, simulated: false, error: error.message || 'Failed to dispatch email' }
  }
}
