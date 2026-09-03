'use client'

import React from 'react'
import { Sparkles, Sun, Flame, Play, ArrowRight, CheckCircle2, Heart } from 'lucide-react'

interface OverviewProps {
  patientName: string;
  preferences: any;
  patientHistory: any[];
  selectedMood?: string;
  onCheckIn: () => void;
  onDiary?: () => void;
  onMemory?: () => void;
  onActivity: () => void;
  onPlanner?: () => void;
}

export default function PatientHomeOverviewScreen({ 
  patientName,
  preferences,
  patientHistory = [],
  selectedMood,
  onCheckIn, 
  onActivity,
}: OverviewProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayIso = new Date().toISOString().split('T')[0]

  // Progress from history
  const completedToday = patientHistory.filter(s => s.completedAt && s.completedAt.startsWith(todayIso)).length
  const totalMoments = 3
  const progressPercent = Math.min(100, Math.round((completedToday / totalMoments) * 100))

  const activeMood = selectedMood || patientHistory[0]?.moodReported || patientHistory[0]?.mood_reported || ''
  const moodLabels: Record<string, string> = {
    'Joyful & Good': 'Feeling Joyful & Good 🌟',
    'Peaceful & Calm': 'Feeling Peaceful & Calm 🌿',
    'Calm & Relaxed': 'Doing Calm & Relaxed ☕',
    'A Bit Tired': 'Resting — A Bit Tired 🛋️',
    good: 'Feeling Good 🌟',
    okay: 'Doing Okay 🌿',
    tired: 'A Bit Tired 🛋️'
  }
  const moodDisplay = activeMood ? (moodLabels[activeMood] || activeMood) : ''
  const streakCount = Math.max(1, preferences?.current_streak || 1)
  const activeDayClamped = Math.min(streakCount, 7)

  return (
    <div className="flex flex-col h-full justify-between animate-in fade-in duration-300 pb-4">
      <div>
        {/* Top Date & Greeting Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6F8F7A] uppercase tracking-wider mb-2 bg-[#E8EFEA] px-4 py-1 rounded-full border border-[#D4E4DC]">
            <Sun size={16} className="text-[#D9A441]" />
            <span>{today}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] tracking-tight mb-2">
            Good day, {patientName}
          </h1>
          <p className="text-base sm:text-lg text-[#47554E] max-w-lg mx-auto">
            Welcome to today's calm, joyful wellness moments.
          </p>
        </div>

        {/* Big Centered Streak Showcase Card */}
        <div className="w-full max-w-2xl mx-auto mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FFF8EC] via-[#FFF3D6] to-[#FDE6BA] border-2 border-[#F6CE85] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D9A441] text-[#FFFDF7] flex items-center justify-center text-4xl sm:text-5xl mb-3 shadow-md">
            🔥
          </div>

          <span className="text-xs sm:text-sm font-extrabold text-[#B88728] uppercase tracking-widest mb-1">
            Current Daily Streak
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#29352F] mb-2 tracking-tight">
            {streakCount} {streakCount === 1 ? 'Day' : 'Days'} Active
          </h2>
          <p className="text-sm sm:text-base font-semibold text-[#664D14] max-w-md mb-6 leading-relaxed">
            {streakCount > 1 
              ? `Wonderful consistency! You are nurturing your brain and memory every day.` 
              : `You're starting an inspiring daily cognitive wellness journey!`}
          </p>

          {/* 7-Day Visual Tracker Dots */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-sm pt-4 border-t border-[#F1C877]">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const isDone = day <= activeDayClamped
              const isCurrent = day === activeDayClamped
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-2xs ${
                      isDone
                        ? 'bg-[#D9A441] text-[#FFFDF7] shadow-xs ring-2 ring-[#B88728]/30'
                        : 'bg-white/80 text-[#8C733E] border border-[#F1C877]'
                    }`}
                  >
                    {isDone ? '✓' : `D${day}`}
                  </div>
                  <span className="text-[10px] font-bold text-[#8C733E]">
                    Day {day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 2 Main Action Cards (Today's Journey & Mood Check-in) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-8">
          {/* Big Start Today's Journey Card */}
          <button
            type="button"
            onClick={onActivity}
            className="w-full p-6 sm:p-7 rounded-3xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] border-2 border-[#577361] shadow-md hover:shadow-lg transition-all text-left flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2 bg-[#FFFDF7]/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold w-fit mb-3">
                <Sparkles size={14} className="text-[#D9A441]" />
                <span>Today’s 6-Step Journey</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#FFFDF7] mb-2">
                Start Daily Session
              </h3>
              <p className="text-sm text-[#FFFDF7]/90 leading-relaxed">
                A peaceful sequence of orientation, breathing, and fun brain games.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 font-extrabold text-base text-[#FFFDF7] mt-6 group-hover:translate-x-1 transition-transform">
              <Play size={18} className="fill-current text-[#D9A441]" />
              <span>Begin Now &rarr;</span>
            </span>
          </button>

          {/* Daily Check-in Card */}
          <button 
            type="button"
            onClick={onCheckIn}
            className="w-full bg-[#FFFDF7] border-2 border-[#EBE6D8] hover:border-[#6F8F7A] rounded-3xl p-6 sm:p-7 text-left shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-[#6F8F7A] uppercase tracking-wider mb-2">
                Daily Check-in
              </p>
              <h3 className="font-extrabold text-2xl text-[#29352F] mb-2">
                {moodDisplay ? moodDisplay : 'How are you feeling?'}
              </h3>
              <p className="text-sm text-[#47554E] leading-relaxed">
                {moodDisplay 
                  ? 'Check-in recorded for today. Tap anytime to update.' 
                  : 'A brief check-in helps personalize your daily experience.'}
              </p>
            </div>
            <span className="text-sm font-bold text-[#6F8F7A] mt-6 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>{moodDisplay ? 'Update feeling' : 'Record check-in'}</span>
              <ArrowRight size={18} />
            </span>
          </button>
        </div>
      </div>

      {/* Gentle Progress Footer */}
      <div className="pt-6 border-t-2 border-[#EBE6D8] max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm sm:text-base text-[#29352F] font-extrabold flex items-center gap-2">
            <span>🌿</span> Today’s gentle wellness progress
          </span>
          <span className="text-xs sm:text-sm text-[#6F8F7A] font-bold bg-[#E8EFEA] px-3.5 py-1 rounded-full">
            {completedToday > 0 ? `${completedToday} moments nurtured` : 'Ready to begin'}
          </span>
        </div>
        <div className="w-full bg-[#EBE6D8] rounded-full h-4 overflow-hidden p-0.5">
          <div 
            className="bg-[#6F8F7A] h-full rounded-full transition-all duration-500 shadow-xs" 
            style={{ width: `${Math.max(progressPercent, completedToday > 0 ? 33 : 10)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
