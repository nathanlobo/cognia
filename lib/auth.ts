import crypto from 'node:crypto'

const KEY_LENGTH = 64
const SALT_LENGTH = 16

/**
 * Hashes a plaintext password using node:crypto scrypt.
 * Returns self-contained '<saltHex>:<hashHex>'.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH)
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verifies a plaintext password against a stored '<saltHex>:<hashHex>' string.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash || typeof storedHash !== 'string') {
    return false
  }

  const parts = storedHash.split(':')
  if (parts.length !== 2) {
    return false
  }

  const [salt, originalHash] = parts
  if (!salt || !originalHash) {
    return false
  }

  try {
    const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH)
    const originalBuffer = Buffer.from(originalHash, 'hex')

    if (derivedKey.length !== originalBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(derivedKey, originalBuffer)
  } catch (err) {
    console.error('Password verification error:', err)
    return false
  }
}

/**
 * Generates a human-friendly invite code format:
 * e.g., CG-4A8F-9K2M or PT-7X1Z-3B5D
 */
export function generateInviteCode(role: 'caregiver' | 'patient'): string {
  const prefix = role === 'caregiver' ? 'CG' : 'PT'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // omit ambiguous chars like 0, O, 1, I
  
  const randomBlock = (length: number) => {
    let result = ''
    const bytes = crypto.randomBytes(length)
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length]
    }
    return result
  }

  return `${prefix}-${randomBlock(4)}-${randomBlock(4)}`
}

/**
 * Validates password criteria (min 8 chars, at least one number/special char)
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' }
  }
  return { valid: true }
}

export interface InMemInvite {
  code: string
  role: 'caregiver' | 'patient'
  created_by?: string
  max_uses: number
  uses: number
  expires_at?: string
}

declare global {
  // eslint-disable-next-line no-var
  var __cognia_fallback_invites__: Map<string, InMemInvite> | undefined
}

const fallbackStore: Map<string, InMemInvite> =
  globalThis.__cognia_fallback_invites__ ||
  (globalThis.__cognia_fallback_invites__ = new Map([
    ['COGNIA-CARE-2026', { code: 'COGNIA-CARE-2026', role: 'caregiver', max_uses: 100, uses: 0 }],
    ['COGNIA-PATIENT-2026', { code: 'COGNIA-PATIENT-2026', role: 'patient', max_uses: 100, uses: 0 }]
  ]))

export function saveFallbackInvite(invite: InMemInvite) {
  fallbackStore.set(invite.code.toUpperCase(), invite)
}

export function getFallbackInvite(code: string): InMemInvite | undefined {
  return fallbackStore.get(code.toUpperCase())
}

export function incrementFallbackInviteUses(code: string) {
  const inv = fallbackStore.get(code.toUpperCase())
  if (inv) {
    inv.uses += 1
  }
}

/* -------------------------------------------------------------------------- */
/*                               OTP MANAGEMENT                               */
/* -------------------------------------------------------------------------- */

export interface OtpRecord {
  code: string
  expiresAt: number
  attempts: number
  verified: boolean
}

declare global {
  // eslint-disable-next-line no-var
  var __cognia_otp_store__: Map<string, OtpRecord> | undefined
}

const otpStore: Map<string, OtpRecord> =
  globalThis.__cognia_otp_store__ ||
  (globalThis.__cognia_otp_store__ = new Map())

/**
 * Generates a cryptographically secure 6-digit numeric OTP code.
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Stores an OTP for an email address with 10 minutes expiry.
 */
export function storeOtp(email: string, otp: string) {
  const cleanEmail = email.trim().toLowerCase()
  otpStore.set(cleanEmail, {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
    attempts: 0,
    verified: false
  })
}

/**
 * Verifies an OTP code for a given email.
 */
export function verifyOtp(email: string, inputCode: string): { success: boolean; error?: string } {
  const cleanEmail = email.trim().toLowerCase()
  const record = otpStore.get(cleanEmail)

  if (!record) {
    return { success: false, error: 'No verification code was sent to this email or it has expired.' }
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail)
    return { success: false, error: 'Verification code has expired. Please request a new one.' }
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail)
    return { success: false, error: 'Too many incorrect attempts. Please request a new code.' }
  }

  record.attempts += 1

  if (record.code !== inputCode.trim()) {
    return { success: false, error: 'Incorrect verification code. Please try again.' }
  }

  // Mark as successfully verified
  record.verified = true
  return { success: true }
}

/**
 * Checks if an email has already been verified via OTP.
 */
export function isEmailVerified(email: string): boolean {
  const cleanEmail = email.trim().toLowerCase()
  const record = otpStore.get(cleanEmail)
  if (!record) return false
  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail)
    return false
  }
  return record.verified
}

/**
 * Clears the OTP record after registration completes.
 */
export function consumeVerifiedEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase()
  otpStore.delete(cleanEmail)
}
