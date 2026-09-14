'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err) {
      setError(decodeURIComponent(err))
      return
    }

    const id = searchParams.get('id')
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const role = searchParams.get('role') || 'caregiver'
    const avatar = searchParams.get('avatar')
    const googleId = searchParams.get('google_id')

    if (!id || !email) {
      setError('Incomplete authentication response received from Google.')
      return
    }

    const profile: any = {
      id,
      email: decodeURIComponent(email),
      full_name: name ? decodeURIComponent(name) : email.split('@')[0],
      role,
      avatar_url: avatar ? decodeURIComponent(avatar) : undefined,
      google_id: googleId ? decodeURIComponent(googleId) : undefined
    }

    try {
      if (role === 'caregiver') {
        localStorage.setItem('care_companion_caregiver', JSON.stringify(profile))
        window.dispatchEvent(new Event('care_companion_auth_change'))
        router.replace('/app/caregiver')
      } else {
        localStorage.setItem('care_companion_patient', JSON.stringify(profile))
        localStorage.setItem('care_companion_recent_patient_id', profile.id)
        window.dispatchEvent(new Event('care_companion_auth_change'))
        router.replace('/app/patient')
      }
    } catch (e) {
      console.error('Error saving session to localStorage:', e)
      setError('Failed to persist session. Please ensure cookies and localStorage are enabled.')
    }
  }, [searchParams, router])

  if (error) {
    return (
      <div className="w-full max-w-md bg-[#FFFDF7] border-2 border-[#EBE6D8] rounded-3xl p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} />
        </div>
        <h1 className="text-xl font-extrabold text-[#29352F] mb-2">Authentication Error</h1>
        <p className="text-sm text-[#6B7C73] leading-relaxed mb-6">{error}</p>
        <Link
          href="/app"
          className="inline-block py-3 px-6 bg-[#6F8F7A] hover:bg-[#5C7966] text-white font-bold rounded-xl text-center no-underline transition-colors text-sm"
        >
          Return to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Loader2 size={28} className="animate-spin text-[#6F8F7A]" />
      </div>
      <h2 className="text-lg font-extrabold text-[#29352F] mb-1">
        Completing Google Sign-In...
      </h2>
      <p className="text-xs text-[#6B7C73]">
        Setting up your companion workspace, just a moment.
      </p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#29352F] flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 size={28} className="animate-spin text-[#6F8F7A] mx-auto mb-2" />
          <p className="text-xs text-[#6B7C73]">Loading...</p>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  )
}
