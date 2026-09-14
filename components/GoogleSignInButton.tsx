'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (parent: HTMLElement, options: any) => void
          prompt: (notification?: any) => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  role?: 'caregiver' | 'patient'
  inviteCode?: string
  onAuthSuccess: (profile: any) => void
  onError?: (errorMsg: string) => void
  text?: 'signin_with' | 'signup_with' | 'continue_with'
  className?: string
}

export default function GoogleSignInButton({
  role = 'caregiver',
  inviteCode,
  onAuthSuccess,
  onError,
  text = 'continue_with',
  className = ''
}: GoogleSignInButtonProps) {
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [configMissing, setConfigMissing] = useState(false)
  const [missingAlert, setMissingAlert] = useState(false)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Load Google Identity Services (GIS) script
  useEffect(() => {
    if (!clientId) {
      setConfigMissing(true)
      return
    }

    if (window.google?.accounts?.id) {
      setScriptLoaded(true)
      return
    }

    const existingScript = document.getElementById('google-gis-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-gis-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script.')
      if (onError) onError('Could not connect to Google services.')
    }
    document.body.appendChild(script)
  }, [clientId, onError])

  // Handle Token verification callback
  async function handleCredentialResponse(response: any) {
    if (!response?.credential) {
      if (onError) onError('Google sign in did not return valid credentials.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
          role,
          inviteCode
        })
      })

      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data.error || 'Failed to authenticate with Google.'
        if (onError) onError(errorMsg)
      } else if (data.profile) {
        onAuthSuccess(data.profile)
      }
    } catch (err: any) {
      console.error('Error verifying Google credential:', err)
      if (onError) onError('Network error verifying Google credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Initialize and render Google Button in same-tab redirect mode
  useEffect(() => {
    if (!scriptLoaded || !clientId || !buttonContainerRef.current) return

    try {
      // Store requested role and inviteCode in cookies for the redirect callback
      document.cookie = `cognia_oauth_role=${role}; path=/; max-age=300; SameSite=Lax`
      if (inviteCode) {
        document.cookie = `cognia_oauth_invite=${encodeURIComponent(inviteCode)}; path=/; max-age=300; SameSite=Lax`
      } else {
        document.cookie = 'cognia_oauth_invite=; path=/; max-age=0'
      }

      const redirectUri = `${window.location.origin}/api/auth/google/callback`

      window.google?.accounts.id.initialize({
        client_id: clientId,
        ux_mode: 'redirect',
        login_uri: redirectUri,
        auto_select: false
      })

      buttonContainerRef.current.innerHTML = ''
      window.google?.accounts.id.renderButton(buttonContainerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: buttonContainerRef.current.clientWidth || 360
      })
    } catch (err) {
      console.error('Failed to render Google button:', err)
    }
  }, [scriptLoaded, clientId, role, inviteCode, text])

  // When Client ID is missing, show a styled mockup button with actionable guidance
  if (configMissing) {
    return (
      <div className={`w-full flex flex-col gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => setMissingAlert(true)}
          className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-[#3c4043] border border-[#dadce0] font-medium text-sm rounded-full shadow-2xs transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {missingAlert && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
            <div className="leading-relaxed">
              <strong>Google Client ID not configured.</strong>
              <p className="mt-0.5 text-amber-700">
                Please add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code> file to enable Google authentication.
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`w-full relative flex flex-col items-center ${className}`}>
      {loading ? (
        <div className="w-full py-2.5 px-4 bg-white border border-[#dadce0] rounded-full flex items-center justify-center gap-2 text-sm text-[#3c4043] font-medium shadow-2xs">
          <Loader2 size={16} className="animate-spin text-[#6F8F7A]" />
          <span>Authenticating with Google...</span>
        </div>
      ) : (
        <div
          ref={buttonContainerRef}
          className="w-full flex justify-center min-h-[40px]"
        />
      )}
    </div>
  )
}
