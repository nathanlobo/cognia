'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import NoPatientModal from '@/components/NoPatientModal'

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  roleTitle?: string;
  onLogout?: () => void;
  showSwitchToPatient?: boolean;
  showSwitchToCaregiver?: boolean;
  patients?: any[];
  isLoadingPatients?: boolean;
  onSwitchToPatient?: (patient: any) => void;
  onOpenAddPatient?: () => void;
}

export default function Header({ 
  userName, 
  userEmail,
  avatarUrl,
  roleTitle, 
  onLogout, 
  showSwitchToPatient, 
  showSwitchToCaregiver,
  patients,
  isLoadingPatients,
  onSwitchToPatient,
  onOpenAddPatient
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [noPatientModalOpen, setNoPatientModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const initials = (userName || userEmail || 'C')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <>
      <header className="w-full sticky top-0 z-50 border-b-2 border-[#E8EFEA] dark:border-[#28372E] bg-gradient-to-r from-[#FFFDF7]/95 via-[#F7FAF8]/95 to-[#FFFDF7]/95 dark:from-[#16201B]/95 dark:via-[#1B2721]/95 dark:to-[#16201B]/95 backdrop-blur-md px-4 py-2.5 shadow-xs" role="banner">
        <div className="w-full flex items-center justify-between flex-wrap gap-4">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 no-underline group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFFDF7] to-[#F1F6F3] dark:from-[#1E2922] dark:to-[#16201A] border-2 border-[#E8EFEA] dark:border-[#28372E] shadow-xs flex items-center justify-center group-hover:border-[#6F8F7A] transition-all overflow-hidden p-1.5 shrink-0">
                <img 
                  src="/dementia-webapp-logo.png" 
                  alt="Cognia Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#29352F] dark:text-[#F7F4EC] m-0 leading-tight">
                  Cognia
                </h1>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#6F8F7A] dark:text-[#8BAFA0] tracking-wider uppercase block">
                  Cognitive Therapeutic
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {showSwitchToPatient && (
              <div className="relative" ref={dropdownRef}>
                {isLoadingPatients ? (
                  <button 
                    disabled
                    title="Loading patients..."
                    className="flex items-center gap-2 px-3.5 h-10 rounded-full bg-[#E8EFEA]/50 dark:bg-[#1E2922] text-[#6B7C73] dark:text-[#A3B3AA] border border-[#6F8F7A]/20 dark:border-[#28372E] font-bold text-sm cursor-not-allowed opacity-60"
                    aria-disabled="true"
                  >
                    <svg className="animate-spin h-4 w-4 text-[#6F8F7A]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Patient</span>
                  </button>
                ) : patients && patients.length > 0 ? (
                  <>
                    <button 
                      title="Switch to Patient Portal"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-4 h-10 rounded-full bg-gradient-to-r from-[#E8EFEA] via-[#E0EBE3] to-[#D5E3DA] dark:from-[#1E2922] dark:via-[#24332A] dark:to-[#1E2922] text-[#3D5245] dark:text-[#A5C4B7] hover:from-[#DFE8E1] hover:to-[#CDDDD3] dark:hover:from-[#24332A] dark:hover:to-[#2B3C32] transition-all border border-[#6F8F7A]/35 dark:border-[#33423A] font-bold text-sm cursor-pointer shadow-xs hover:shadow-sm"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/></svg>
                      <span>Patient</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-gradient-to-b from-[#FFFDF7] to-[#F8FAF8] dark:from-[#1E2922] dark:to-[#16201A] border border-[#E8EFEA] dark:border-[#33423A] rounded-2xl shadow-xl z-50 overflow-hidden">
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs font-semibold text-[#6B7C73] dark:text-[#A3B3AA] uppercase tracking-wider bg-[#E8EFEA]/50 dark:bg-[#16201B]/70">
                            Select a Patient
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {patients.map((p, idx) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setDropdownOpen(false);
                                  if (onSwitchToPatient) onSwitchToPatient(p);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[#E8EFEA]/70 dark:hover:bg-[#28372E] transition-colors border-b border-[#E8EFEA] dark:border-[#33423A] last:border-0 flex items-center justify-between cursor-pointer"
                              >
                                <div>
                                  <div className="font-bold text-[#29352F] dark:text-[#F7F4EC] text-sm">{p.full_name}</div>
                                  <div className="text-xs text-[#6B7C73] dark:text-[#A3B3AA]">{p.email}</div>
                                </div>
                                {idx === 0 && <span className="text-[10px] font-bold text-[#42594B] dark:text-[#A5C4B7] bg-[#E8EFEA] dark:bg-[#28372E] px-2 py-0.5 rounded-full border border-[#6F8F7A]/20 dark:border-[#33423A]">Recent</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button 
                    title="Switch to Patient Portal"
                    onClick={() => setNoPatientModalOpen(true)}
                    className="flex items-center gap-2 px-4 h-10 rounded-full bg-gradient-to-r from-[#E8EFEA] via-[#E0EBE3] to-[#D5E3DA] dark:from-[#1E2922] dark:via-[#24332A] dark:to-[#1E2922] text-[#3D5245] dark:text-[#A5C4B7] hover:from-[#DFE8E1] hover:to-[#CDDDD3] dark:hover:from-[#24332A] dark:hover:to-[#2B3C32] transition-all border border-[#6F8F7A]/35 dark:border-[#33423A] font-bold text-sm cursor-pointer shadow-xs hover:shadow-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/></svg>
                    <span>Patient</span>
                  </button>
                )}
              </div>
            )}
            
            {showSwitchToCaregiver && (
              <Link href="/app/caregiver" style={{ textDecoration: 'none' }}>
                <button 
                  title="Switch to Caregiver Portal"
                  className="flex items-center gap-2 px-4 h-10 rounded-full bg-gradient-to-r from-[#E8EFEA] via-[#E0EBE3] to-[#D5E3DA] dark:from-[#1E2922] dark:via-[#24332A] dark:to-[#1E2922] text-[#3D5245] dark:text-[#A5C4B7] hover:from-[#DFE8E1] hover:to-[#CDDDD3] dark:hover:from-[#24332A] dark:hover:to-[#2B3C32] transition-all border border-[#6F8F7A]/35 dark:border-[#33423A] font-bold text-sm cursor-pointer shadow-xs hover:shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/></svg>
                  <span>Caregiver</span>
                </button>
              </Link>
            )}

            {/* Caregiver Profile Avatar & Dropdown */}
            <div className="relative shrink-0" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                title={userName ? `${userName}'s profile menu` : 'Account menu'}
                className="w-10 h-10 min-w-10 max-w-10 min-h-10 max-h-10 aspect-square rounded-full flex items-center justify-center p-0.5 border-2 border-[#6F8F7A] hover:border-[#577361] hover:scale-105 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6F8F7A]/50 cursor-pointer overflow-hidden bg-gradient-to-br from-[#E8EFEA] to-[#D5E3DA] dark:from-[#1E2922] dark:to-[#16201A] shrink-0 shadow-xs"
                style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', borderRadius: '9999px' }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName || 'Profile'}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6F8F7A] to-[#577361] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    {initials}
                  </div>
                )}
              </button>

              {/* Dropdown Menu matching Image 5: Light in light mode, Dark Green in dark mode */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-[#FFFDF7] to-[#F7FAF8] dark:from-[#1E2922] dark:to-[#16201B] text-[#29352F] dark:text-[#F7F4EC] border border-[#E8EFEA] dark:border-[#33423A] rounded-2xl shadow-2xl z-50 overflow-hidden p-2 pb-2 animate-in fade-in zoom-in-95 duration-200">
                  {/* Caregiver Name and Email (Click directs to /app/caregiver/profile) */}
                  <Link
                    href="/app/caregiver/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block p-3 rounded-xl hover:bg-[#E8EFEA]/70 dark:hover:bg-[#28372E] transition-colors group cursor-pointer no-underline text-left"
                    style={{ minHeight: 'unset' }}
                  >
                    <div className="font-bold text-[#29352F] dark:text-[#F7F4EC] text-base group-hover:text-[#577361] dark:group-hover:text-[#8BAFA0] transition-colors truncate">
                      {userName || 'Caregiver User'}
                    </div>
                    <div className="text-xs text-[#6B7C73] dark:text-[#A3B3AA] truncate mt-0.5 font-normal">
                      {userEmail || 'Click to view & edit profile details'}
                    </div>
                  </Link>

                  <div className="my-1 border-t border-[#E8EFEA] dark:border-[#33423A]" />

                  {/* Red Logout Button */}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        onLogout()
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#C96B5C] dark:text-[#DB8072] hover:bg-[#C96B5C]/10 dark:hover:bg-[#DB8072]/15 transition-colors font-semibold text-sm cursor-pointer"
                      style={{ minHeight: 'unset' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C96B5C] dark:text-[#DB8072]">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Logout</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-[#E8EFEA] dark:border-[#33423A]" />

                  {/* Privacy Policy & Terms of Service Footer */}
                  <div className="flex items-center justify-center gap-1.5 px-3 pt-1.5 pb-0.5 text-[11px] text-[#6B7C73] dark:text-[#A3B3AA] whitespace-nowrap">
                    <Link
                      href="/privacy"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="inline text-[11px] text-[#6B7C73] hover:text-[#29352F] dark:text-[#A3B3AA] dark:hover:text-[#F7F4EC] hover:underline underline-offset-2 transition-colors cursor-pointer"
                      style={{ minHeight: 'unset', height: 'auto', display: 'inline' }}
                    >
                      Privacy Policy
                    </Link>
                    <span aria-hidden="true" className="text-[#6F8F7A]/60 dark:text-[#526F5D] leading-none select-none text-[10px]">•</span>
                    <Link
                      href="/terms"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="inline text-[11px] text-[#6B7C73] hover:text-[#29352F] dark:text-[#A3B3AA] dark:hover:text-[#F7F4EC] hover:underline underline-offset-2 transition-colors cursor-pointer"
                      style={{ minHeight: 'unset', height: 'auto', display: 'inline' }}
                    >
                      Terms of Service
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      <NoPatientModal
        isOpen={noPatientModalOpen}
        onClose={() => setNoPatientModalOpen(false)}
        onAddPatient={() => {
          setNoPatientModalOpen(false)
          if (onOpenAddPatient) {
            onOpenAddPatient()
          }
        }}
      />
    </>
  )
}
