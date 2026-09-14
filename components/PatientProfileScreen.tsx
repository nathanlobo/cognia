'use client'

import React, { useState, useEffect } from 'react'
import { User, Phone, Heart, Volume2, Shield, Bell, LogOut, CheckCircle2, UserX } from 'lucide-react'
import { getTTSEnabled, setTTSEnabled } from '@/lib/tts'

interface ProfileProps {
  patientName: string;
  patientEmail: string;
  patientId: string;
  preferences?: any;
  patientHistory?: any[];
  streak?: number;
  caregiver?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  } | null;
  onSavePreferences?: (partial: any) => Promise<any>;
  onLogout?: () => void;
}

export default function PatientProfileScreen({
  patientName,
  patientEmail,
  patientId,
  preferences,
  patientHistory = [],
  streak,
  caregiver,
  onSavePreferences,
  onLogout,
}: ProfileProps) {
  const [ttsOn, setTtsOn] = useState(true)
  const [soundChimes, setSoundChimes] = useState(preferences?.sound_chimes ?? true)

  useEffect(() => {
    setTtsOn(getTTSEnabled())
    const handleTtsChange = () => setTtsOn(getTTSEnabled())
    window.addEventListener('tts_toggle_changed', handleTtsChange)
    return () => window.removeEventListener('tts_toggle_changed', handleTtsChange)
  }, [])

  useEffect(() => {
    if (typeof preferences?.sound_chimes === 'boolean') {
      setSoundChimes(preferences.sound_chimes)
    }
  }, [preferences?.sound_chimes])

  const handleToggleTts = async () => {
    const next = !ttsOn
    setTtsOn(next)
    setTTSEnabled(next)
    if (onSavePreferences) {
      await onSavePreferences({ tts_enabled: next })
    }
  }

  const handleToggleChimes = async () => {
    const next = !soundChimes
    setSoundChimes(next)
    if (onSavePreferences) {
      await onSavePreferences({ sound_chimes: next })
    }
  }

  const totalCompletedSessions = patientHistory.length
  const currentStreak = typeof streak === 'number' 
    ? streak 
    : (typeof preferences?.current_streak === 'number' ? preferences.current_streak : 0)

  return (
    <div className="w-full flex flex-col h-full animate-in fade-in duration-300 pb-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-wider mb-1">
          <User size={18} />
          <span>My Profile & Preferences</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] tracking-tight mb-2">
          Hello, {patientName}
        </h1>
        <p className="text-base sm:text-lg text-[#47554E] dark:text-[#A3B3AA]">
          Here are your daily companion preferences and your connected care circle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Card & Milestones */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF7] dark:bg-[#1E2922] border-2 border-[#EBE6D8] dark:border-[#28372E] shadow-xs text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#6F8F7A] text-[#FFFDF7] flex items-center justify-center text-4xl font-extrabold shadow-md mb-4">
              {patientName.charAt(0)}
            </div>
            <h2 className="text-2xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] mb-1">{patientName}</h2>
            <p className="text-sm font-medium text-[#6B7C73] dark:text-[#A3B3AA] mb-4">{patientEmail}</p>

            <div className="w-full pt-4 border-t border-[#EBE6D8] dark:border-[#28372E] flex items-center justify-around">
              <div>
                <span className="text-2xl font-extrabold text-[#D9A441]">
                  {currentStreak} 🔥
                </span>
                <p className="text-xs font-bold text-[#6B7C73] dark:text-[#A3B3AA] uppercase tracking-wider mt-0.5">Day Streak</p>
              </div>
              <div className="h-8 w-px bg-[#EBE6D8] dark:border-[#28372E]" />
              <div>
                <span className="text-2xl font-extrabold text-[#6F8F7A] dark:text-[#8BAFA0]">
                  {totalCompletedSessions} 🌟
                </span>
                <p className="text-xs font-bold text-[#6B7C73] dark:text-[#A3B3AA] uppercase tracking-wider mt-0.5">Activities</p>
              </div>
            </div>
          </div>

          {/* Connected Caregiver Card */}
          <div className="p-6 rounded-3xl bg-[#F1F6F3] dark:bg-[#1E2922] border-2 border-[#D4E4DC] dark:border-[#2F3F36] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-wider mb-2">
              <Heart size={16} className="text-[#C96B5C] fill-current" />
              <span>Connected Caregiver</span>
            </div>

            {caregiver ? (
              <>
                <h3 className="text-xl font-bold text-[#29352F] dark:text-[#F7F4EC] mb-1">{caregiver.full_name}</h3>
                <p className="text-xs text-[#6B7C73] dark:text-[#A3B3AA] mb-2">{caregiver.email}</p>
                <p className="text-sm text-[#47554E] dark:text-[#A3B3AA] mb-4">
                  Receives your daily activity completion notes and mood check-ins.
                </p>

                {caregiver.phone && (
                  <a
                    href={`tel:${caregiver.phone}`}
                    className="w-full py-3 px-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Phone size={16} />
                    <span>Call {caregiver.full_name}</span>
                  </a>
                )}
              </>
            ) : (
              <div className="py-2">
                <div className="flex items-center gap-2 text-[#6B7C73] dark:text-[#A3B3AA] mb-2">
                  <UserX size={20} />
                  <span className="font-bold text-sm">No Caregiver Linked</span>
                </div>
                <p className="text-xs sm:text-sm text-[#47554E] dark:text-[#A3B3AA] leading-relaxed">
                  A family member or professional caregiver can link with your companion account through the Caregiver Portal.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Senior-Friendly Preferences */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF7] dark:bg-[#1E2922] border-2 border-[#EBE6D8] dark:border-[#28372E] shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-[#29352F] dark:text-[#F7F4EC] mb-6 flex items-center gap-2">
              <Shield size={24} className="text-[#6F8F7A] dark:text-[#8BAFA0]" />
              <span>Accessibility & Audio Options</span>
            </h3>

            <div className="space-y-4">
              {/* Voice Dictation Toggle */}
              <div className="p-5 rounded-2xl bg-[#F7F4EC] dark:bg-[#16201B] border-2 border-[#E3DEC3] dark:border-[#2F3F36] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#6F8F7A] text-[#FFFDF7] flex items-center justify-center shrink-0">
                    <Volume2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-[#29352F] dark:text-[#F7F4EC]">Voice Dictation & Read Aloud</h4>
                    <p className="text-xs sm:text-sm text-[#6B7C73] dark:text-[#A3B3AA]">
                      Reads questions, greetings and memory stories aloud in a warm voice.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleTts}
                  className={`px-5 py-2.5 rounded-full font-extrabold text-sm transition cursor-pointer border shadow-xs ${
                    ttsOn
                      ? 'bg-[#6F8F7A] text-[#FFFDF7] border-[#577361]'
                      : 'bg-white dark:bg-[#1E2922] text-[#6B7C73] dark:text-[#A3B3AA] border-[#E3DEC3] dark:border-[#33423A]'
                  }`}
                >
                  {ttsOn ? 'ON 🔊' : 'MUTED 🔇'}
                </button>
              </div>

              {/* Sound Chimes Toggle */}
              <div className="p-5 rounded-2xl bg-[#F7F4EC] dark:bg-[#16201B] border-2 border-[#E3DEC3] dark:border-[#2F3F36] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#D9A441] text-[#FFFDF7] flex items-center justify-center shrink-0">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-[#29352F] dark:text-[#F7F4EC]">Encouragement Chimes</h4>
                    <p className="text-xs sm:text-sm text-[#6B7C73] dark:text-[#A3B3AA]">
                      Plays gentle uplifting sounds when completing a question or streak.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleChimes}
                  className={`px-5 py-2.5 rounded-full font-extrabold text-sm transition cursor-pointer border shadow-xs ${
                    soundChimes
                      ? 'bg-[#D9A441] text-[#FFFDF7] border-[#B88728]'
                      : 'bg-white dark:bg-[#1E2922] text-[#6B7C73] dark:text-[#A3B3AA] border-[#E3DEC3] dark:border-[#33423A]'
                  }`}
                >
                  {soundChimes ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Logout button */}
            {onLogout && (
              <div className="mt-8 pt-6 border-t border-[#EBE6D8] dark:border-[#28372E] flex justify-end">
                <button
                  onClick={onLogout}
                  className="px-6 py-3 rounded-2xl border-2 border-[#EBE6D8] dark:border-[#28372E] hover:border-[#C96B5C] bg-[#FFFDF7] dark:bg-[#1E2922] text-[#C96B5C] dark:text-[#DB8072] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  <LogOut size={16} />
                  <span>Log Out of Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
