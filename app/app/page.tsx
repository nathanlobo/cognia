'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GoogleSignInButton from '@/components/GoogleSignInButton'
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

export default function AppPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [signupStep, setSignupStep] = useState<'email' | 'otp' | 'details'>('email')

  // Fluid water droplet tab switcher state
  const [isSwitching, setIsSwitching] = useState(false)
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  function handleTabSwitch(newMode: 'login' | 'signup') {
    if (mode !== newMode) {
      setMode(newMode)
      setError('')
      setSuccessMessage('')
      setIsForgotMode(false)
    }
    setIsSwitching(true)
    if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current)
    switchTimeoutRef.current = setTimeout(() => {
      setIsSwitching(false)
    }, 550)
  }

  // Forgot Password State
  const [isForgotMode, setIsForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSending, setForgotSending] = useState(false)
  const [forgotLinkSent, setForgotLinkSent] = useState(false)
  const [simulatedResetLink, setSimulatedResetLink] = useState('')

  async function handleForgotSendLink(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const cleanEmail = (forgotEmail || email).trim().toLowerCase()
    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }
    setError('')
    setSuccessMessage('')
    setForgotSending(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send password reset link.')
      } else {
        setForgotLinkSent(true)
        if (data.resetLink) {
          setSimulatedResetLink(data.resetLink)
        }
        setSuccessMessage(data.message || `Password reset link sent to ${cleanEmail}.`)
      }
    } catch (err) {
      console.error(err)
      setError('Network connection error. Please try again.')
    } finally {
      setForgotSending(false)
    }
  }

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
        router.replace('/app/caregiver')
        return
      }
      if (patient) {
        router.replace('/app/patient')
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
        setError(data.error || 'Failed to send verification code. Please check your email.')
      } else {
        setOtpSent(true)
        setSignupStep('otp')
        setResendCooldown(60)
        setSuccessMessage(`A 6-digit verification code has been sent to ${cleanEmail}.`)
      }
    } catch (err) {
      console.error(err)
      setError('Network connection error. Please try again.')
    } finally {
      setOtpSending(false)
    }
  }

  // STEP 2: Handle Verifying OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    const cleanOtp = otp.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setError('')
    setVerifyingOtp(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid or expired code.')
      } else {
        setEmailVerified(true)
        setSignupStep('details')
        setSuccessMessage('Email verified successfully! Now complete your account details.')
      }
    } catch (err) {
      console.error(err)
      setError('Network connection error. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Universal Login (Password-based)
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
        if (role.includes('caregiver')) {
          localStorage.setItem('care_companion_caregiver', JSON.stringify(data.profile))
          window.dispatchEvent(new Event('care_companion_auth_change'))
          router.push('/app/caregiver')
        } else {
          localStorage.setItem('care_companion_patient', JSON.stringify(data.profile))
          localStorage.setItem('care_companion_recent_patient_id', data.profile.id)
          window.dispatchEvent(new Event('care_companion_auth_change'))
          router.push('/app/patient')
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
        router.push('/app/caregiver')
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
    const { role } = profile
    if (role.includes('caregiver')) {
      localStorage.setItem('care_companion_caregiver', JSON.stringify(profile))
      window.dispatchEvent(new Event('care_companion_auth_change'))
      router.push('/app/caregiver')
    } else {
      localStorage.setItem('care_companion_patient', JSON.stringify(profile))
      localStorage.setItem('care_companion_recent_patient_id', profile.id)
      window.dispatchEvent(new Event('care_companion_auth_change'))
      router.push('/app/patient')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] text-[#29352F] dark:text-[#F7F4EC] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-colors">
      <div className="w-full max-w-md animate-in fade-in duration-300">
        
        {/* Navigation back to landing page */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B7C73] dark:text-[#A3B3AA] hover:text-[#29352F] dark:hover:text-[#F7F4EC] transition-colors no-underline group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Cognia Overview</span>
          </Link>
          <span className="text-[11px] font-semibold text-[#8E9F95] dark:text-[#6B7C73] tracking-wide uppercase">
            Cognia Portal
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#E8EFEA] dark:bg-[#1E2922] text-[#6F8F7A] dark:text-[#8BAFA0] font-bold text-xs px-3.5 py-1.5 rounded-full border border-[#D4E4DC] dark:border-[#33423A] mb-3 shadow-2xs">
            <Sparkles size={14} className="text-[#D9A441]" />
            <span>Daily Cognitive Wellness Companion</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <img 
              src="/dementia-webapp-logo.png" 
              alt="Cognia Logo" 
              className="w-12 h-12 object-contain" 
            />
            <h1 className="text-3xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] tracking-tight">Cognia</h1>
          </div>
          <p className="text-sm text-[#6B7C73] dark:text-[#A3B3AA] font-medium max-w-sm mx-auto">
            A gentle companion for memory, movement, and connection.
          </p>
        </div>

        {/* Universal Auth Card */}
        <div className="bg-gradient-to-br from-[#FFFDF7] via-[#FAFDFB] to-[#F5F8F5] dark:from-[#1E2922] dark:via-[#1A251F] dark:to-[#16201A] border-2 border-[#E8EFEA] dark:border-[#2F3F36] rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* Mode Switch Tabs with Water Droplet Animation */}
          <div className="relative grid grid-cols-2 p-1.5 bg-[#EAE5D9] rounded-full mb-6 border border-[#DDD6C6] shadow-[inset_0_2px_4px_rgba(41,53,47,0.06)] select-none">
            {/* Sliding Fluid Active Pill (Water Droplet Surface) */}
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#FFFDF7] rounded-full shadow-[0_3px_10px_rgba(41,53,47,0.08),0_1px_3px_rgba(41,53,47,0.05)] border border-[#E3DEC3]/70 transition-all duration-400 ease-[cubic-bezier(0.34,1.45,0.64,1)] pointer-events-none ${
                mode === 'login' ? 'left-1.5' : 'left-[calc(50%+3px)]'
              } ${isSwitching ? 'animate-water-drop-bounce' : ''}`}
            >
              {/* Water surface highlight reflection */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/80 via-white/20 to-transparent pointer-events-none" />
            </div>

            {/* Sign In Tab Button */}
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-250 cursor-pointer text-center select-none overflow-hidden ${
                mode === 'login'
                  ? 'text-[#29352F]'
                  : 'text-[#6B7C73] hover:text-[#29352F]'
              }`}
            >
              Sign In
            </button>

            {/* Caregiver Sign Up Tab Button */}
            <button
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-250 cursor-pointer text-center select-none overflow-hidden ${
                mode === 'signup'
                  ? 'text-[#29352F]'
                  : 'text-[#6B7C73] hover:text-[#29352F]'
              }`}
            >
              Caregiver Sign Up
            </button>
          </div>

          {/* Sign In / Forgot Password Form */}
          {mode === 'login' ? (
            isForgotMode ? (
              /* Forgot Password Sub-Flow */
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(false)
                      setError('')
                      setSuccessMessage('')
                    }}
                    className="text-xs font-bold text-[#6F8F7A] hover:text-[#29352F] flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                  <span className="text-[11px] font-bold text-[#D9A441] uppercase tracking-wider">
                    Password Recovery
                  </span>
                </div>

                <div className="text-center my-1">
                  <h2 className="text-base font-extrabold text-[#29352F]">
                    Reset Your Password
                  </h2>
                  <p className="text-xs text-[#6B7C73] mt-1">
                    Enter your registered email address and we will send you a secure link to reset your password.
                  </p>
                </div>

                {successMessage && (
                  <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                      <span>{successMessage}</span>
                    </div>
                    {simulatedResetLink && (
                      <div className="mt-1 pt-2 border-t border-green-200/60 text-[11px]">
                        <span className="text-green-900 font-bold block mb-1">Dev Quick Link (Simulation):</span>
                        <a 
                          href={simulatedResetLink}
                          className="text-[#6F8F7A] underline break-all font-mono"
                        >
                          Click here to open reset password page &rarr;
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                    {error}
                  </div>
                )}

                {!forgotLinkSent ? (
                  <form onSubmit={handleForgotSendLink} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                        Your Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                        <input
                          type="email"
                          name="forgot-email"
                          id="forgot-email"
                          autoComplete="off"
                          value={forgotEmail || email}
                          onChange={(e) => {
                            setForgotEmail(e.target.value)
                            setEmail(e.target.value)
                          }}
                          placeholder="sarah@example.com"
                          required
                          disabled={forgotSending}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotSending}
                      className="mt-1 w-full py-3 bg-[#D9A441] hover:bg-[#C28F34] text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {forgotSending ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                      <ArrowRight size={18} />
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(false)
                        setForgotLinkSent(false)
                        setError('')
                        setSuccessMessage('')
                      }}
                      className="w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Return to Sign In</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Sign In Form */
              <div className="flex flex-col gap-4">
                <GoogleSignInButton
                  role="caregiver"
                  onAuthSuccess={handleGoogleAuthSuccess}
                  onError={(err) => setError(err)}
                  text="continue_with"
                />

                <div className="flex items-center gap-3 my-1">
                  <div className="h-px bg-[#E8E2D2] flex-1" />
                  <span className="text-xs font-extrabold text-[#8E9F95] tracking-wider uppercase">
                    OR
                  </span>
                  <div className="h-px bg-[#E8E2D2] flex-1" />
                </div>

                <div className="text-center -mt-1">
                  <h2 className="text-sm font-bold text-[#47554E]">Sign In with Email</h2>
                </div>

                <form onSubmit={handleLoginSubmit} autoComplete="off" className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        id="login-email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sarah@example.com"
                        required
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(true)
                          setForgotEmail(email)
                          setError('')
                          setSuccessMessage('')
                        }}
                        className="text-xs font-bold text-[#6F8F7A] hover:text-[#29352F] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        id="login-password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
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
                    className="mt-2 w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            )
          ) : (
            /* Caregiver Multi-Step Sign Up Form */
            <div className="flex flex-col gap-4">
              
              <GoogleSignInButton
                role="caregiver"
                onAuthSuccess={handleGoogleAuthSuccess}
                onError={(err) => setError(err)}
                text="continue_with"
              />

              <div className="flex items-center gap-3 my-1">
                <div className="h-px bg-[#E8E2D2] flex-1" />
                <span className="text-xs font-extrabold text-[#8E9F95] tracking-wider uppercase">
                  OR
                </span>
                <div className="h-px bg-[#E8E2D2] flex-1" />
              </div>

              <div className="text-center -mt-1">
                <h2 className="text-sm font-bold text-[#47554E]">Register with Email</h2>
              </div>

              {/* Step indicator breadcrumbs */}
              <div className="flex items-center justify-between px-2 mb-2">
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  signupStep === 'email' ? 'text-[#6F8F7A]' : 'text-[#8E9F95]'
                }`}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#E8EFEA] text-[10px]">1</span>
                  <span>Email</span>
                </div>
                <div className="w-8 h-px bg-[#DCD6C8]" />
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  signupStep === 'otp' ? 'text-[#6F8F7A]' : 'text-[#8E9F95]'
                }`}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#E8EFEA] text-[10px]">2</span>
                  <span>Verify</span>
                </div>
                <div className="w-8 h-px bg-[#DCD6C8]" />
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  signupStep === 'details' ? 'text-[#6F8F7A]' : 'text-[#8E9F95]'
                }`}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#E8EFEA] text-[10px]">3</span>
                  <span>Profile</span>
                </div>
              </div>

              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* STEP 1: Email Form */}
              {signupStep === 'email' && (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                      Your Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                      <input
                        type="email"
                        name="signup-email"
                        id="caregiver-signup-email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sarah@example.com"
                        required
                        disabled={otpSending}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] bg-white text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                      />
                    </div>
                    <p className="text-[11px] text-[#8E9F95] mt-1.5">
                      We will send a 6-digit verification code to confirm your email.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={otpSending}
                    className="mt-2 w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {otpSending ? 'Sending verification code...' : 'Continue to Verification'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {/* STEP 2: OTP Verification Form */}
              {signupStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider">
                        Enter 6-Digit Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSignupStep('email')
                          setError('')
                        }}
                        className="text-xs text-[#6F8F7A] hover:underline font-bold cursor-pointer"
                      >
                        Change Email
                      </button>
                    </div>

                    <input
                      type="text"
                      name="otp-code"
                      id="caregiver-otp-code"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      required
                      disabled={verifyingOtp}
                      className="w-full tracking-widest text-center text-2xl font-mono py-2.5 rounded-xl border border-[#DCD6C8] bg-white focus:outline-none focus:border-[#6F8F7A] text-[#29352F]"
                    />

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-[#8E9F95]">
                        Sent to {email}
                      </span>
                      {resendCooldown > 0 ? (
                        <span className="text-[11px] text-[#8E9F95] font-semibold">
                          Resend code in {resendCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          disabled={otpSending}
                          className="text-[11px] font-bold text-[#6F8F7A] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={12} />
                          <span>Resend Code</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    className="mt-2 w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {verifyingOtp ? 'Verifying Code...' : 'Verify Code'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {/* STEP 3: Complete Details Form */}
              {signupStep === 'details' && (
                <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#47554E] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                      <input
                        type="text"
                        name="full-name"
                        id="caregiver-full-name"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Sarah Jenkins"
                        required
                        disabled={loading}
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
                        name="password"
                        id="caregiver-password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
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
                    className="mt-2 w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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

        {/* Legal Links */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#8E9F95] mt-3">
          <Link href="/terms" className="hover:text-[#29352F] hover:underline transition-colors font-medium">
            Terms of Service
          </Link>
          <span aria-hidden="true">•</span>
          <Link href="/privacy" className="hover:text-[#29352F] hover:underline transition-colors font-medium">
            Privacy Policy
          </Link>
        </div>

      </div>
    </div>
  )
}
