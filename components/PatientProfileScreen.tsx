'use client'

import React, { useState, useEffect } from 'react'
import { User, Phone, Heart, Volume2, Shield, Bell, Moon, Sun, LogOut, CheckCircle2, Award } from 'lucide-react'
import { getTTSEnabled, setTTSEnabled } from '@/lib/tts'

interface ProfileProps {
  patientName: string;
  patientEmail: string;
  patientId: string;
  preferences?: any;
  patientHistory?: any[];
  onLogout?: () => void;
}

export default function PatientProfileScreen({
  patientName,
  patientEmail,
  patientId,
  preferences,
  patientHistory = [],
  onLogout,
}: ProfileProps) {
  const [ttsOn, setTtsOn] = useState(true)
  const [largeText, setLargeText] = useState(false)
  const [soundChimes, setSoundChimes] = useState(true)

  useEffect(() => {
    setTtsOn(getTTSEnabled())
    const handleTtsChange = () => setTtsOn(getTTSEnabled())
    window.addEventListener('tts_toggle_changed', handleTtsChange)
    return () => window.removeEventListener('tts_toggle_changed', handleTtsChange)
  }, [])

  const caregiverName = preferences?.caregiver_name || 'Care Partner'
  const caregiverPhone = preferences?.caregiver_phone || 'Family Contact'
  const totalCompletedSessions = patientHistory.length

  return (
    <div className="w-full flex flex-col h-full animate-in fade-in duration-300 pb-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6F8F7A] uppercase tracking-wider mb-1">
          <User size={18} />
          <span>My Profile & Preferences</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] tracking-tight mb-2">
          Hello, {patientName}
        </h1>
        <p className="text-base sm:text-lg text-[#47554E]">
          Here are your daily companion preferences and your connected care circle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Card & Milestones */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF7] border-2 border-[#EBE6D8] shadow-xs text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#6F8F7A] text-[#FFFDF7] flex items-center justify-center text-4xl font-extrabold shadow-md mb-4">
              {patientName.charAt(0)}
            </div>
            <h2 className="text-2xl font-extrabold text-[#29352F] mb-1">{patientName}</h2>
            <p className="text-sm font-medium text-[#6B7C73] mb-4">{patientEmail}</p>

            <div className="w-full pt-4 border-t border-[#EBE6D8] flex items-center justify-around">
              <div>
                <span className="text-2xl font-extrabold text-[#D9A441]">
                  {preferences?.current_streak || 1} 🔥
                </span>
                <p className="text-xs font-bold text-[#6B7C73] uppercase tracking-wider mt-0.5">Day Streak</p>
              </div>
              <div className="h-8 w-px bg-[#EBE6D8]" />
              <div>
                <span className="text-2xl font-extrabold text-[#6F8F7A]">
                  {totalCompletedSessions} 🌟
                </span>
                <p className="text-xs font-bold text-[#6B7C73] uppercase tracking-wider mt-0.5">Activities</p>
              </div>
            </div>
          </div>

          {/* Connected Caregiver Card */}
          <div className="p-6 rounded-3xl bg-[#F1F6F3] border-2 border-[#D4E4DC] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6F8F7A] uppercase tracking-wider mb-2">
              <Heart size={16} className="text-[#C96B5C] fill-current" />
              <span>Connected Caregiver</span>
            </div>
            <h3 className="text-xl font-bold text-[#29352F] mb-1">{caregiverName}</h3>
            <p className="text-sm text-[#47554E] mb-4">
              Your loved one receives your daily activity completion notes and mood check-ins.
            </p>

            {caregiverPhone && caregiverPhone !== 'Family Contact' && (
              <a
                href={`tel:${caregiverPhone}`}
                className="w-full py-3 px-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Phone size={16} />
                <span>Call {caregiverName}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Senior-Friendly Preferences */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF7] border-2 border-[#EBE6D8] shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-[#29352F] mb-6 flex items-center gap-2">
              <Shield size={24} className="text-[#6F8F7A]" />
              <span>Accessibility & Audio Options</span>
            </h3>

            <div className="space-y-4">
              {/* Voice Dictation Toggle */}
              <div className="p-5 rounded-2xl bg-[#F7F4EC] border-2 border-[#E3DEC3] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#6F8F7A] text-[#FFFDF7] flex items-center justify-center shrink-0">
                    <Volume2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-[#29352F]">Voice Dictation & Read Aloud</h4>
                    <p className="text-xs sm:text-sm text-[#6B7C73]">
                      Reads questions, greetings and memory stories aloud in a warm voice.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !ttsOn
                    setTtsOn(next)
                    setTTSEnabled(next)
                  }}
                  className={`px-5 py-2.5 rounded-full font-extrabold text-sm transition cursor-pointer border shadow-xs ${
                    ttsOn
                      ? 'bg-[#6F8F7A] text-[#FFFDF7] border-[#577361]'
                      : 'bg-white text-[#6B7C73] border-[#E3DEC3]'
                  }`}
                >
                  {ttsOn ? 'ON 🔊' : 'MUTED 🔇'}
                </button>
              </div>

              {/* Sound Chimes Toggle */}
              <div className="p-5 rounded-2xl bg-[#F7F4EC] border-2 border-[#E3DEC3] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#D9A441] text-[#FFFDF7] flex items-center justify-center shrink-0">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-[#29352F]">Encouragement Chimes</h4>
                    <p className="text-xs sm:text-sm text-[#6B7C73]">
                      Plays gentle uplifting sounds when completing a question or streak.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundChimes(!soundChimes)}
                  className={`px-5 py-2.5 rounded-full font-extrabold text-sm transition cursor-pointer border shadow-xs ${
                    soundChimes
                      ? 'bg-[#D9A441] text-[#FFFDF7] border-[#B88728]'
                      : 'bg-white text-[#6B7C73] border-[#E3DEC3]'
                  }`}
                >
                  {soundChimes ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Logout button */}
            {onLogout && (
              <div className="mt-8 pt-6 border-t border-[#EBE6D8] flex justify-end">
                <button
                  onClick={onLogout}
                  className="px-6 py-3 rounded-2xl border-2 border-[#EBE6D8] hover:border-[#C96B5C] bg-[#FFFDF7] text-[#C96B5C] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all"
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
