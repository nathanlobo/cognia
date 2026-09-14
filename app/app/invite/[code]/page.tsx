'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { 
  HeartHandshake, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  RefreshCw 
} from 'lucide-react'

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const inviteCode = (params?.code as string)?.toUpperCase() || ''

  // Invite Status
  const [checking, setChecking] = useState(true)
  const [inviteValid, setInviteValid] = useState(false)
  const [caregiverName, setCaregiverName] = useState('')
  const [inviteError, setInviteError] = useState('')

  // Wizard Step: 'email' | 'otp' | 'details'
  const [signupStep, setSignupStep] = useState<'email' | 'otp' | 'details'>('email')

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')

  // States
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [emailVerified, setEmailVerified] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Validate Invite on Mount
  useEffect(() => {
    async function validate() {
      if (!inviteCode) {
        setChecking(false)
        setInviteError('No invite code provided.')
        return
      }

      try {
        const res = await fetch(`/api/invites/validate?code=${encodeURIComponent(inviteCode)}`)
        const data = await res.json()
        if (!res.ok || !data.valid) {
          setInviteValid(false)
          setInviteError(data.error || 'This invite link is invalid, expired, or already used.')
        } else {
          setInviteValid(true)
          setCaregiverName(data.caregiverName || 'Your Caregiver')
        }
      } catch (err) {
        console.error(err)
        setInviteError('Could not verify invite link. Please check your connection.')
      } finally {
        setChecking(false)
      }
    }

    validate()
  }, [inviteCode])

  // STEP 1: Send OTP
  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    setOtpSending(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, role: 'patient' })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send verification code.')
      } else {
        setOtpSent(true)
        setSignupStep('otp')
        setResendCooldown(30)
        setSuccessMessage('A 6-digit verification code was sent to your email.')
      }
    } catch (err) {
      console.error(err)
      setError('Network error. Failed to send verification code.')
    } finally {
      setOtpSending(false)
    }
  }

  // STEP 2: Verify OTP
  async function handleVerifyOtp(overrideOtp?: string, e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError('')
    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = (overrideOtp || otp).trim()

    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    setVerifyingOtp(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid or expired verification code.')
      } else {
        setEmailVerified(true)
        setSignupStep('details')
        setError('')
        setSuccessMessage('Email verified successfully! Complete your account below.')
      }
    } catch (err) {
      console.error(err)
      setError('Connection error. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  // STEP 3: Handle Signup
  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const cleanEmail = email.trim().toLowerCase()

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          fullName: fullName.trim(),
          password,
          role: 'patient',
          inviteCode,
          otp: otp.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please check your verification code.')
      } else if (data.profile) {
        localStorage.setItem('care_companion_patient', JSON.stringify(data.profile))
        localStorage.setItem('care_companion_recent_patient_id', data.profile.id)
        window.dispatchEvent(new Event('care_companion_auth_change'))
        router.push('/app/patient')
      }
    } catch (err) {
      console.error(err)
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleAuthSuccess(profile: any) {
    if (!profile) return
    localStorage.setItem('care_companion_patient', JSON.stringify(profile))
    localStorage.setItem('care_companion_recent_patient_id', profile.id)
    window.dispatchEvent(new Event('care_companion_auth_change'))
    router.push('/app/patient')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] text-[#29352F] dark:text-[#F7F4EC] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6F8F7A]/20 dark:border-[#384E3F] border-t-[#6F8F7A] dark:border-t-[#8BAFA0] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-[#6B7C73] dark:text-[#A3B3AA]">Checking your invitation...</p>
        </div>
      </div>
    )
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] text-[#29352F] dark:text-[#F7F4EC] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#16201A] border-2 border-[#EBE6D8] dark:border-[#2D3F33] rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] mb-2">Invitation Unavailable</h1>
          <p className="text-sm text-[#6B7C73] dark:text-[#A3B3AA] leading-relaxed mb-6">{inviteError}</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/app/login"
              className="py-3 px-4 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-bold rounded-xl text-center no-underline transition-all shadow-xs"
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 text-sm text-[#6B7C73] dark:text-[#A3B3AA] hover:text-[#29352F] dark:hover:text-white font-semibold text-center no-underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] text-[#29352F] dark:text-[#F7F4EC] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        
        {/* Brand Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 no-underline group">
            <img 
              src="/dementia-webapp-logo.png" 
              alt="Cognia Logo" 
              className="w-12 h-12 object-contain group-hover:scale-105 transition-transform" 
            />
            <span className="text-2xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] tracking-tight">Cognia</span>
          </Link>
        </div>

        {/* Card Box */}
        <div className="bg-gradient-to-br from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#16201A] border-2 border-[#EBE6D8] dark:border-[#2D3F33] rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* Caregiver Welcome Banner */}
          <div className="p-4 bg-[#E8EFEA] dark:bg-[#223327] border border-[#C5D7CC] dark:border-[#384E3F] rounded-2xl mb-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#425B4C] dark:text-[#A5C4B7] uppercase tracking-wider mb-1">
              <HeartHandshake size={16} className="text-[#6F8F7A] dark:text-[#8BAFA0]" />
              <span>Personal Invitation</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#29352F] dark:text-[#F7F4EC]">
              Welcome to Cognia!
            </h2>
            <p className="text-xs text-[#52685B] dark:text-[#A3B3AA] mt-1 font-medium">
              You have been invited to join by <strong>{caregiverName}</strong>.
            </p>
          </div>

          {/* Email */}
          {signupStep === 'email' && (
            <div className="flex flex-col gap-4">
              <GoogleSignInButton
                role="patient"
                inviteCode={inviteCode}
                onAuthSuccess={handleGoogleAuthSuccess}
                onError={(err) => setError(err)}
                text="continue_with"
              />

              <div className="flex items-center gap-3 my-1">
                <div className="h-px bg-[#E8E2D2] dark:bg-[#2D3F33] flex-1" />
                <span className="text-xs font-extrabold text-[#8E9F95] dark:text-[#6B7C73] tracking-wider uppercase">
                  OR
                </span>
                <div className="h-px bg-[#E8E2D2] dark:bg-[#2D3F33] flex-1" />
              </div>

              <div className="text-center -mt-1">
                <h2 className="text-sm font-bold text-[#47554E] dark:text-[#D5E2D9]">Register with Email</h2>
              </div>

              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#47554E] dark:text-[#D5E2D9] uppercase tracking-wider mb-1.5">
                    Your Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      id="patient-email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      disabled={otpSending}
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] dark:border-[#384E3F] bg-white dark:bg-[#16201A] text-sm focus:outline-none focus:border-[#6F8F7A] focus:ring-2 focus:ring-[#6F8F7A]/30 text-[#29352F] dark:text-[#F7F4EC]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpSending || !email}
                  className="mt-1 w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {otpSending ? 'Sending Verification Code...' : 'Verify Email'}
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* OTP Verification */}
          {signupStep === 'otp' && (
            <form onSubmit={(e) => handleVerifyOtp(undefined, e)} className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-extrabold text-[#29352F] dark:text-[#F7F4EC]">
                    Enter Verification Code
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSignupStep('email')
                      setError('')
                    }}
                    className="text-xs text-[#6F8F7A] dark:text-[#8BAFA0] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    Edit email
                  </button>
                </div>
                <p className="text-xs text-[#6B7C73] dark:text-[#A3B3AA] mb-3">
                  We sent a 6-digit code to <strong className="text-[#29352F] dark:text-[#F7F4EC]">{email}</strong>
                </p>

                <label className="block text-xs font-bold text-[#47554E] dark:text-[#D5E2D9] uppercase tracking-wider mb-1.5">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  name="one-time-code"
                  id="patient-otp"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setOtp(val)
                    if (val.length === 6) {
                      handleVerifyOtp(val)
                    }
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
                    if (pasted.length === 6) {
                      e.preventDefault()
                      setOtp(pasted)
                      handleVerifyOtp(pasted)
                    }
                  }}
                  placeholder="••••••"
                  autoFocus
                  disabled={verifyingOtp}
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl border-2 border-[#DCD6C8] dark:border-[#384E3F] bg-white dark:bg-[#16201A] focus:outline-none focus:border-[#6F8F7A] focus:ring-2 focus:ring-[#6F8F7A]/30 text-[#29352F] dark:text-[#F7F4EC]"
                />

                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-xs text-[#8E9F95] dark:text-[#7C9084]">Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={resendCooldown > 0 || otpSending}
                    className="text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] hover:text-[#5C7966] disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} className={otpSending ? 'animate-spin' : ''} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={verifyingOtp || otp.length !== 6}
                className="mt-1 w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {verifyingOtp ? 'Verifying Code...' : 'Confirm & Continue'}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* Details & Password */}
          {signupStep === 'details' && (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="username"
                id="patient-username"
                autoComplete="username"
                value={email}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-extrabold text-[#29352F] dark:text-[#F7F4EC]">
                    Complete your profile
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-md border border-green-200 dark:border-green-800">
                    <CheckCircle2 size={12} />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-[#6B7C73] dark:text-[#A3B3AA] mb-3">
                  Joining as a patient linked with <strong className="text-[#29352F] dark:text-[#F7F4EC]">{caregiverName}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47554E] dark:text-[#D5E2D9] uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <div className="relative flex items-center">
                  <User size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    id="patient-fullname"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    disabled={loading}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] dark:border-[#384E3F] bg-white dark:bg-[#16201A] text-sm focus:outline-none focus:border-[#6F8F7A] focus:ring-2 focus:ring-[#6F8F7A]/30 text-[#29352F] dark:text-[#F7F4EC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47554E] dark:text-[#D5E2D9] uppercase tracking-wider mb-1.5">
                  Create Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="new-password"
                    id="patient-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DCD6C8] dark:border-[#384E3F] bg-white dark:bg-[#16201A] text-sm focus:outline-none focus:border-[#6F8F7A] focus:ring-2 focus:ring-[#6F8F7A]/30 text-[#29352F] dark:text-[#F7F4EC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#8E9F95] hover:text-[#29352F] dark:hover:text-[#F7F4EC] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47554E] dark:text-[#D5E2D9] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm-password"
                    id="patient-confirm-password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DCD6C8] dark:border-[#384E3F] bg-white dark:bg-[#16201A] text-sm focus:outline-none focus:border-[#6F8F7A] focus:ring-2 focus:ring-[#6F8F7A]/30 text-[#29352F] dark:text-[#F7F4EC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-[#8E9F95] hover:text-[#29352F] dark:hover:text-[#F7F4EC] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Setting Up Your Companion...' : 'Complete Registration'}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#EAE5D9] dark:border-[#2D3F33] text-center">
            <Link href="/app/login" className="text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] hover:underline">
              Already have an account? Sign in here
            </Link>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#8E9F95] dark:text-[#7C9084] mt-4">
          <Link href="/terms" className="hover:text-[#29352F] dark:hover:text-[#F7F4EC] hover:underline transition-colors font-medium">
            Terms of Service
          </Link>
          <span aria-hidden="true">•</span>
          <Link href="/privacy" className="hover:text-[#29352F] dark:hover:text-[#F7F4EC] hover:underline transition-colors font-medium">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
