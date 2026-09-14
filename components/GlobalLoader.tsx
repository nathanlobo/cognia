'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function GlobalLoader({ children }: { children: React.ReactNode }) {
  // Always start as `true` on both server and client to avoid hydration mismatch.
  // useEffect (client-only) skips the splash if the session already ran it.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If this tab has already shown the loader, skip it immediately
    if (sessionStorage.getItem('cognia_app_loaded')) {
      setLoading(false)
      return
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem('cognia_app_loaded', 'true')
      setLoading(false)
    }, 700)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards" style={{ animationDelay: '0.8s' }}>
        <div className="relative flex items-center justify-center">
          {/* Subtle glowing halo */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#6F8F7A]/20 to-[#526F5D]/20 blur-xl pointer-events-none"></div>

          {/* Rotating gradient ring */}
          <div className="absolute inset-[-1.25rem] rounded-full border-[4px] border-[#6F8F7A]/20 dark:border-[#33423A] border-t-[#6F8F7A] dark:border-t-[#8BAFA0] animate-spin" style={{ animationDuration: '1.2s' }}></div>

          {/* Seamless Floating Logo (No Box / No Border) */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <Image
              src="/dementia-webapp-logo.png"
              alt="Loading Cognia"
              fill
              style={{ objectFit: 'contain' }}
              sizes="112px"
              priority
            />
          </div>
        </div>
        <h2 className="mt-10 text-2xl font-black text-[#29352F] dark:text-[#F7F4EC] tracking-tight">Cognia</h2>
        <p className="mt-2 text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-widest animate-pulse">Personalized Cognitive Care</p>
      </div>
    )
  }

  return <>{children}</>
}
