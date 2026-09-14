'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PatientProvider, usePatient } from '@/lib/PatientContext'
import Header from '@/components/Header'
import { Sun, Heart, Sparkles, Calendar, User, Volume2, VolumeX } from 'lucide-react'

type TabType = 'today' | 'memories' | 'activities' | 'routine' | 'profile'

interface TabItem {
  id: TabType
  label: string
  href: string
  icon: any
  match: (pathname: string) => boolean
}

const TABS: TabItem[] = [
  { 
    id: 'today', 
    label: 'Today', 
    href: '/app/patient', 
    icon: Sun,
    match: (pathname: string) => pathname === '/app/patient' || pathname === '/app/patient/' 
  },
  { 
    id: 'memories', 
    label: 'Memories', 
    href: '/app/patient/memories', 
    icon: Heart,
    match: (pathname: string) => pathname.startsWith('/app/patient/memories') 
  },
  { 
    id: 'activities', 
    label: 'Activities', 
    href: '/app/patient/activities', 
    icon: Sparkles,
    match: (pathname: string) => pathname.startsWith('/app/patient/activities') 
  },
  { 
    id: 'routine', 
    label: 'Routine', 
    href: '/app/patient/routine', 
    icon: Calendar,
    match: (pathname: string) => pathname.startsWith('/app/patient/routine') 
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    href: '/app/patient/profile', 
    icon: User,
    match: (pathname: string) => pathname.startsWith('/app/patient/profile') 
  },
]

function PatientLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { patient, isLoading, ttsOn, setTtsOn, handleLogout } = usePatient()

  if (isLoading || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-[#6F8F7A]/20 dark:border-[#384E3F] border-t-[#6F8F7A] dark:border-t-[#8BAFA0] rounded-full animate-spin mb-4" />
        <p className="text-[#6B7C73] dark:text-[#A3B3AA] font-medium text-sm">Opening companion space...</p>
      </div>
    )
  }

  const isSessionPage = pathname.startsWith('/app/patient/session')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] text-[#29352F] dark:text-[#F7F4EC] flex flex-col transition-colors duration-300 pb-20 md:pb-0">
      <Header 
        userName={patient.full_name}
        userEmail={patient.email}
        avatarUrl={patient.avatar_url}
        roleTitle="Patient Companion"
        onLogout={handleLogout}
        showSwitchToCaregiver={true}
      />
      
      <main className="w-full max-w-7xl mx-auto flex-1 flex justify-center py-4 md:py-6 px-3 sm:px-6 lg:px-8">
        <div 
          className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl bg-gradient-to-br from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#16201A] rounded-[2.5rem] shadow-xs border-2 border-[#EBE6D8] dark:border-[#28372E] overflow-hidden flex flex-col" 
          style={{ minHeight: '82vh' }}
        >
          {/* Top Desktop Navigation Tabs Bar with Voice Dictation */}
          {!isSessionPage && (
            <nav 
              aria-label="Patient Navigation" 
              className="hidden md:flex items-center justify-between px-6 lg:px-10 py-4 border-b-2 border-[#EBE6D8] dark:border-[#28372E] bg-[#FFFDF7]/95 dark:bg-[#1E2922]/95 backdrop-blur-md sticky top-0 z-20 gap-4"
            >
              <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = tab.match(pathname)
                  return (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      className={`flex items-center gap-2.5 py-2.5 px-5 rounded-full transition-all text-base font-extrabold cursor-pointer shrink-0 ${
                        isActive 
                          ? 'text-[#FFFDF7] bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] shadow-xs border-2 border-[#577361]' 
                          : 'text-[#47554E] dark:text-[#D5DED8] hover:text-[#29352F] dark:hover:text-[#F7F4EC] hover:bg-[#F7F4EC] dark:hover:bg-[#28372E] border-2 border-transparent'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* TTS Dictation Quick Toggle */}
              <button
                type="button"
                onClick={() => setTtsOn(!ttsOn)}
                title={ttsOn ? "Voice Dictation is ON — Click to Mute" : "Voice Dictation is MUTED — Click to Unmute"}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer border shadow-xs shrink-0 ${
                  ttsOn 
                    ? 'bg-[#E8EFEA] dark:bg-[#28372E] text-[#6F8F7A] dark:text-[#8BAFA0] border-[#6F8F7A]/40 dark:border-[#3E5246] hover:bg-[#D4E4DC] dark:hover:bg-[#334539]' 
                    : 'bg-[#F7F4EC] dark:bg-[#16201B] text-[#6B7C73] dark:text-[#A3B3AA] border-[#E3DEC3] dark:border-[#33423A] hover:bg-[#EBE6D8] dark:hover:bg-[#28372E]'
                }`}
              >
                {ttsOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{ttsOn ? 'Voice: ON' : 'Voice: Muted'}</span>
              </button>
            </nav>
          )}

          {/* Main Content Area */}
          <div className={`flex-1 overflow-y-auto scroll-smooth flex flex-col p-6 sm:p-8 md:p-10 lg:p-12 ${isSessionPage ? 'p-0 sm:p-0 md:p-0 lg:p-0' : ''}`}>
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom on small screens) */}
      {!isSessionPage && (
        <nav 
          aria-label="Mobile Bottom Navigation" 
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF7]/95 dark:bg-[#1E2922]/95 backdrop-blur-md border-t-2 border-[#EBE6D8] dark:border-[#28372E] px-3 py-2 flex items-center justify-around shadow-lg"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.match(pathname)
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex flex-col items-center justify-center min-h-[52px] px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#6F8F7A] dark:text-[#8BAFA0] font-extrabold bg-[#E8EFEA] dark:bg-[#28372E]'
                    : 'text-[#6B7C73] dark:text-[#A3B3AA] font-bold hover:text-[#29352F] dark:hover:text-[#F7F4EC]'
                }`}
              >
                <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
                <span className="text-[11px] mt-0.5">{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientProvider>
      <PatientLayoutInner>{children}</PatientLayoutInner>
    </PatientProvider>
  )
}
