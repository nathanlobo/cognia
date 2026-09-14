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
          <h1 style="color: #42594B; font-size: 26px; font-weight: 800; margin: 0;">Cognia</h1>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Daily Cognitive Wellness & Care Companion</p>
        </div>
        
        <div style="background-color: #FFFFFF; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); text-align: center;">
          <h2 style="color: #1E293B; font-size: 18px; font-weight: 700; margin-bottom: 12px;">Verify Your Email Address</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            Please use the one-time verification code below to complete your registration on Cognia.
          </p>
          
          <div style="display: inline-block; background-color: #F3F7F4; border: 2px dashed #6F8F7A; border-radius: 10px; padding: 14px 32px; margin-bottom: 20px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #42594B;">
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

/**
 * Sends a 6-digit password reset OTP email using SMTP (e.g. Brevo)
 */
export async function sendPasswordResetEmail(email: string, otp: string): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'Cognia <no-reply@codinx.app>'

  const isSmtpConfigured = Boolean(host && user && pass)

  if (!isSmtpConfigured) {
    console.log(`\n======================================================`)
    console.log(`[PASSWORD RESET EMAIL SIMULATION - Brevo SMTP not configured yet]`)
    console.log(`Recipient: ${email}`)
    console.log(`Password Reset Code (OTP): >>> ${otp} <<<`)
    console.log(`To configure real delivery, set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local`)
    console.log(`======================================================\n`)

    return { success: true, simulated: true }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    })

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #F8FAFC; border-radius: 16px; border: 1px solid #E2E8F0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #42594B; font-size: 26px; font-weight: 800; margin: 0;">Cognia</h1>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Daily Cognitive Wellness & Care Companion</p>
        </div>
        
        <div style="background-color: #FFFFFF; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); text-align: center;">
          <h2 style="color: #1E293B; font-size: 18px; font-weight: 700; margin-bottom: 12px;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            We received a request to reset your Cognia account password. Please use the verification code below to set a new password:
          </p>
          
          <div style="display: inline-block; background-color: #FEF3C7; border: 2px dashed #D97706; border-radius: 10px; padding: 14px 32px; margin-bottom: 20px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #B45309;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #94A3B8; font-size: 12px; margin: 0;">
            This reset code expires in 10 minutes. If you did not request a password reset, you can safely ignore this email; your account remains secure.
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
      subject: `Your Cognia Password Reset Code: ${otp}`,
      text: `Your Cognia password reset code is: ${otp}. It will expire in 10 minutes.`,
      html: htmlContent
    })

    return { success: true, simulated: false }
  } catch (error: any) {
    console.error('Failed to send password reset email via SMTP:', error)
    return { success: false, simulated: false, error: error.message || 'Failed to dispatch email' }
  }
}

/**
 * Sends a password reset link email using SMTP (Brevo) or console simulation fallback
 */
export async function sendPasswordResetLinkEmail(email: string, resetLink: string): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'Cognia <no-reply@codinx.app>'

  const isSmtpConfigured = Boolean(host && user && pass)

  if (!isSmtpConfigured) {
    console.log(`\n======================================================`)
    console.log(`[PASSWORD RESET LINK SIMULATION - Brevo SMTP not configured yet]`)
    console.log(`Recipient: ${email}`)
    console.log(`Password Reset Link: >>> ${resetLink} <<<`)
    console.log(`To configure real delivery, set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local`)
    console.log(`======================================================\n`)

    return { success: true, simulated: true }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    })

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #F8FAFC; border-radius: 16px; border: 1px solid #E2E8F0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6F8F7A; font-size: 26px; font-weight: 800; margin: 0;">Cognia</h1>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Daily Cognitive Wellness & Care Companion</p>
        </div>
        
        <div style="background-color: #FFFFFF; border-radius: 12px; padding: 28px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); text-align: center;">
          <h2 style="color: #1E293B; font-size: 18px; font-weight: 700; margin-bottom: 12px;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
            We received a request to reset your Cognia account password. Click the button below to choose a new password:
          </p>
          
          <div style="margin-bottom: 24px;">
            <a href="${resetLink}" style="display: inline-block; background-color: #6F8F7A; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Reset My Password
            </a>
          </div>

          <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin-bottom: 16px; word-break: break-all;">
            Or copy and paste this link into your browser:<br/>
            <a href="${resetLink}" style="color: #6F8F7A;">${resetLink}</a>
          </p>
          
          <p style="color: #94A3B8; font-size: 12px; margin: 0;">
            This link will expire in 60 minutes. If you did not request a password reset, you can safely ignore this email.
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
      subject: `Reset Your Cognia Password`,
      text: `Click the link below to reset your Cognia password:\n\n${resetLink}\n\nThis link expires in 60 minutes.`,
      html: htmlContent
    })

    return { success: true, simulated: false }
  } catch (error: any) {
    console.error('Failed to send password reset link email via SMTP:', error)
    return { success: false, simulated: false, error: error.message || 'Failed to dispatch email' }
  }
}


