'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  HeartHandshake, 
  Sparkles,
  RefreshCw
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [signupStep, setSignupStep] = useState<'email' | 'otp' | 'details'>('email')

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')

  // UI States
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

  // Auto-redirect if already logged in
  useEffect(() => {
    try {
      const caregiver = localStorage.getItem('care_companion_caregiver')
      const patient = localStorage.getItem('care_companion_patient')
      if (caregiver) {
        router.replace('/caregiver')
        return
      }
      if (patient) {
        router.replace('/patient')
        return
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e)
    }
  }, [router])

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // STEP 1: Handle Requesting OTP
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
        body: JSON.stringify({ email: cleanEmail, role: 'caregiver' })
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

  // STEP 2: Handle Verifying OTP (supports manual submit, onPaste, and auto-submit on 6th digit)
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

  // Handle Universal Login Submit
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid email or password.')
      } else if (data.profile) {
        const { role } = data.profile
        if (role === 'caregiver') {
          localStorage.setItem('care_companion_caregiver', JSON.stringify(data.profile))
          window.dispatchEvent(new Event('care_companion_auth_change'))
          router.push('/caregiver')
        } else {
          localStorage.setItem('care_companion_patient', JSON.stringify(data.profile))
          localStorage.setItem('care_companion_recent_patient_id', data.profile.id)
          window.dispatchEvent(new Event('care_companion_auth_change'))
          router.push('/patient')
        }
      }
    } catch (err) {
      console.error(err)
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // STEP 3: Handle Caregiver Sign Up Submit
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
          role: 'caregiver',
          otp: otp.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
      } else if (data.profile) {
        localStorage.setItem('care_companion_caregiver', JSON.stringify(data.profile))
        window.dispatchEvent(new Event('care_companion_auth_change'))
        router.push('/caregiver')
      }
    } catch (err) {
      console.error(err)
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#29352F] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md animate-in fade-in duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#E8EFEA] text-[#6F8F7A] font-bold text-xs px-3.5 py-1.5 rounded-full border border-[#D4E4DC] mb-3 shadow-2xs">
            <Sparkles size={14} className="text-[#D9A441]" />
            <span>Daily Cognitive Wellness Companion</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <img 
              src="/dementia-webapp-logo.png" 
              alt="Cognia Logo" 
              className="w-12 h-12 object-contain" 
            />
            <h1 className="text-3xl font-extrabold text-[#29352F] tracking-tight">Cognia</h1>
          </div>
          <p className="text-sm text-[#6B7C73] font-medium max-w-sm mx-auto">
            A gentle companion for memory, movement, and connection.
          </p>
        </div>

        {/* Universal Auth Card */}
        <div className="bg-[#FFFDF7] border-2 border-[#EBE6D8] rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#EAE5D9] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
                setSuccessMessage('')
              }}
              className={`py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#FFFDF7] text-[#29352F] shadow-xs'
                  : 'text-[#6B7C73] hover:text-[#29352F]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError('')
                setSuccessMessage('')
              }}
              className={`py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#FFFDF7] text-[#29352F] shadow-xs'
                  : 'text-[#6B7C73] hover:text-[#29352F]'
              }`}
            >
              Caregiver Sign Up
            </button>
          </div>

          {/* Sign In Form (Universal for both patients & caregivers) */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                  <input
                    type="email"
                    name="username"
                    id="login-username"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="current-password"
                    id="login-password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#8E9F95] hover:text-[#29352F] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 bg-[#6F8F7A] hover:bg-[#5C7966] text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            /* Option B: Caregiver Signup Wizard */
            <div className="flex flex-col gap-4">

              {/* Enter Email & Send OTP */}
              {signupStep === 'email' && (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        id="signup-email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="caregiver@example.com"
                        disabled={otpSending}
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                      {error}
                      {error.includes('already exists') && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('login')
                            setError('')
                          }}
                          className="block mt-1 font-bold underline cursor-pointer text-[#29352F]"
                        >
                          Click here to sign in instead &rarr;
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={otpSending || !email}
                    className="mt-1 w-full py-3 bg-[#6F8F7A] hover:bg-[#5C7966] text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {otpSending ? 'Sending Verification Code...' : 'Verify Email'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {/* OTP Verification Code */}
              {signupStep === 'otp' && (
                <form onSubmit={(e) => handleVerifyOtp(undefined, e)} className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-extrabold text-[#29352F]">
                        Enter Verification Code
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setSignupStep('email')
                          setError('')
                        }}
                        className="text-xs text-[#6F8F7A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft size={12} />
                        Edit email
                      </button>
                    </div>
                    <p className="text-xs text-[#6B7C73] mb-3">
                      We sent a 6-digit code to <strong className="text-[#29352F]">{email}</strong>
                    </p>

                    <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      name="one-time-code"
                      id="signup-otp"
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
                      className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl border-2 border-[#DCD6C8] bg-white focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                    />

                    {/* Resend Cooldown Button */}
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-xs text-[#8E9F95]">Didn't receive code?</span>
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={resendCooldown > 0 || otpSending}
                        className="text-xs font-bold text-[#6F8F7A] hover:text-[#5C7966] disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={12} className={otpSending ? 'animate-spin' : ''} />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={verifyingOtp || otp.length !== 6}
                    className="mt-1 w-full py-3 bg-[#6F8F7A] hover:bg-[#5C7966] text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {verifyingOtp ? 'Verifying Code...' : 'Confirm & Continue'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {/* Full Name & Password */}
              {signupStep === 'details' && (
                <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
                  {/* Hidden email input for browser password managers to associate credential with email */}
                  <input
                    type="text"
                    name="username"
                    id="caregiver-username"
                    autoComplete="username"
                    value={email}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                    className="sr-only"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-extrabold text-[#29352F]">
                        Complete your profile
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                        <CheckCircle2 size={12} />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7C73] mb-3">
                      Creating caregiver account for <strong className="text-[#29352F]">{email}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                      Caregiver Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        id="caregiver-fullname"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Sarah Jenkins"
                        disabled={loading}
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                      Create Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="new-password"
                        id="caregiver-password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        disabled={loading}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-[#8E9F95] hover:text-[#29352F] cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirm-password"
                        id="caregiver-confirm-password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        disabled={loading}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-[#8E9F95] hover:text-[#29352F] cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full py-3 bg-[#D9A441] hover:bg-[#C28F34] text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? 'Creating Caregiver Account...' : 'Complete Registration'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

            </div>
          )}

          {/* Patient Guidance Notice */}
          <div className="mt-8 pt-5 border-t border-[#EAE5D9] text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#6B7C73] mb-1">
              <HeartHandshake size={15} className="text-[#6F8F7A]" />
              <span>Are you a Patient?</span>
            </div>
            <p className="text-xs text-[#829188] leading-relaxed">
              Patient accounts are by invitation only. Ask your caregiver for your personal registration link, or log in above with the credentials created by your caregiver.
            </p>
          </div>
        </div>

        {/* Clinical Footer Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#6B7C73] font-semibold mt-6">
          <ShieldCheck size={16} className="text-[#6F8F7A]" />
          <span>Designed with dementia therapists & cognitive care researchers</span>
        </div>

      </div>
    </div>
  )
}
