'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const emailParam = searchParams.get('email') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: emailParam,
          newPassword
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to reset password. The link may have expired.')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error(err)
      setError('Network connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] text-[#29352F] dark:text-[#F7F4EC] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md animate-in fade-in duration-300">
        
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B7C73] dark:text-[#A3B3AA] hover:text-[#29352F] dark:hover:text-white transition-colors no-underline group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#16201A] border-2 border-[#EBE6D8] dark:border-[#2D3F33] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#6F8F7A]/15 text-[#6F8F7A] dark:text-[#8BAFA0] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Set New Password</h1>
            <p className="text-xs text-[#6B7C73] dark:text-[#A3B3AA] mt-1">
              {emailParam ? `Choose a new secure password for ${decodeURIComponent(emailParam)}.` : 'Choose a new secure password for your Cognia account.'}
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4 py-2">
              <div className="p-4 bg-[#E8EFEA] dark:bg-[#233328] border border-[#B5CEBF] dark:border-[#384E3F] text-[#2D4536] dark:text-[#C5DCD0] text-sm font-semibold rounded-2xl flex flex-col items-center gap-2">
                <CheckCircle2 size={32} className="text-[#577361] dark:text-[#8BAFA0]" />
                <span>Password updated successfully!</span>
                <p className="text-xs text-[#42594B] dark:text-[#A3B3AA] font-normal mt-1">
                  You can now log in using your new credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push('/app')}
                className="w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : !token ? (
            <div className="text-center space-y-4 py-2">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-2xl flex items-start gap-2">
                <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Missing reset token. Please request a new password reset link from the sign-in page.</span>
              </div>

              <button
                type="button"
                onClick={() => router.push('/app')}
                className="w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Go to Sign In</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#47554E] dark:text-[#D5E2D9] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    disabled={loading}
                    autoComplete="new-password"
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
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    disabled={loading}
                    autoComplete="new-password"
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

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6F8F7A] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
