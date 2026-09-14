'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { Sparkles, Sun, Play, ArrowRight } from 'lucide-react'
import { parseDailyRoutine } from './PatientDiaryScreen'

interface OverviewProps {
  patientName: string;
  preferences: any;
  patientHistory: any[];
  selectedMood?: string;
  streak?: number;
  todayIso?: string;
  onCheckIn?: () => void;
  onDiary?: () => void;
  onMemory?: () => void;
  onActivity?: () => void;
  onPlanner?: () => void;
}

export default function PatientHomeOverviewScreen({ 
  patientName,
  preferences,
  patientHistory = [],
  selectedMood,
  streak,
  todayIso,
  onCheckIn, 
  onActivity,
}: OverviewProps) {
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const actualToday = todayIso || new Date().toISOString().split('T')[0]

  // 1. Live Streak from database
  const streakCount = typeof streak === 'number' 
    ? streak 
    : (typeof preferences?.current_streak === 'number' ? preferences.current_streak : 0)
  const activeDayClamped = Math.min(streakCount, 7)

  // 2. Activity session completed today
  const completedTodaySessions = patientHistory.filter(
    s => s.completedAt && s.completedAt.startsWith(actualToday)
  ).length

  // 3. Mood check-in for today
  const savedTodayMood = preferences?.today_mood?.[actualToday] || ''
  const activeMood = selectedMood || savedTodayMood || (patientHistory[0]?.completedAt?.startsWith(actualToday) ? patientHistory[0]?.moodReported : '') || ''

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

  // 4. Daily Routine completions for today
  const rawCompletions = preferences?.routine_completions?.[actualToday]
  const completionsJson = JSON.stringify(rawCompletions || {})
  const routineItems = useMemo(() => {
    return parseDailyRoutine(preferences?.daily_routine, rawCompletions || {})
  }, [preferences?.daily_routine, completionsJson])

  const totalRoutineCount = routineItems.length
  const completedRoutineCount = routineItems.filter(i => i.completed).length

  // Calculate dynamic progress based on available tasks:
  // - Goal 1: Daily Mood Check-In (1 point)
  // - Goal 2: Mind Game / Daily Session (1 point)
  // - Goal 3: Routine Schedule (if scheduled, 1 point when completed or proportional)
  const goals: { name: string; isComplete: boolean; weight: number; points: number }[] = [
    {
      name: 'Daily Check-in',
      isComplete: Boolean(activeMood),
      weight: 1,
      points: activeMood ? 1 : 0
    },
    {
      name: 'Cognitive Session',
      isComplete: completedTodaySessions > 0,
      weight: 1,
      points: completedTodaySessions > 0 ? 1 : 0
    }
  ]

  if (totalRoutineCount > 0) {
    goals.push({
      name: 'Daily Routine',
      isComplete: completedRoutineCount === totalRoutineCount,
      weight: 1,
      points: completedRoutineCount / totalRoutineCount
    })
  }

  const totalWeight = goals.reduce((acc, g) => acc + g.weight, 0)
  const earnedPoints = goals.reduce((acc, g) => acc + g.points, 0)
  const progressPercent = totalWeight > 0 ? Math.round((earnedPoints / totalWeight) * 100) : 0
  const completedMomentsCount = goals.filter(g => g.isComplete).length

  return (
    <div className="flex flex-col h-full justify-between animate-in fade-in duration-300 pb-4">
      <div>
        {/* Top Date & Greeting Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-wider mb-2 bg-[#E8EFEA] dark:bg-[#28372E] px-4 py-1 rounded-full border border-[#D4E4DC] dark:border-[#3E5246]">
            <Sun size={16} className="text-[#D9A441]" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] tracking-tight mb-2">
            Good day, {patientName}
          </h1>
          <p className="text-base sm:text-lg text-[#47554E] dark:text-[#A3B3AA] max-w-lg mx-auto">
            Welcome to your calm, joyful companion space.
          </p>
        </div>

        {/* Centered Streak Showcase Card */}
        <div className="w-full max-w-2xl mx-auto mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FFF8EC] via-[#FFF3D6] to-[#FDE6BA] dark:from-[#2B2314] dark:via-[#352814] dark:to-[#423114] border-2 border-[#F6CE85] dark:border-[#5C4518] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D9A441] text-[#FFFDF7] flex items-center justify-center text-4xl sm:text-5xl mb-3 shadow-md">
            🔥
          </div>

          <span className="text-xs sm:text-sm font-extrabold text-[#B88728] dark:text-[#E4B55C] uppercase tracking-widest mb-1">
            Current Daily Streak
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#29352F] dark:text-[#F7F4EC] mb-2 tracking-tight">
            {streakCount === 0 ? 'Ready to Start?' : `${streakCount} ${streakCount === 1 ? 'Day' : 'Days'} Active`}
          </h2>
          <p className="text-sm sm:text-base font-semibold text-[#664D14] dark:text-[#FDF4E2] max-w-md mb-6 leading-relaxed">
            {streakCount === 0 
              ? `Let's begin your inspiring daily cognitive wellness journey today! Complete an activity to start your streak.`
              : streakCount > 1 
                ? `Wonderful consistency! You are nurturing your brain and memory every day.` 
                : `Great start! Keep up the momentum on your cognitive wellness journey.`}
          </p>

          {/* 7-Day Visual Tracker Dots - Only show if streak > 0 */}
          {streakCount > 0 && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-sm pt-4 border-t border-[#F1C877] dark:border-[#5C4518]">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isDone = day <= activeDayClamped
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-2xs ${
                        isDone
                          ? 'bg-[#D9A441] text-[#FFFDF7] shadow-xs ring-2 ring-[#B88728]/30'
                          : 'bg-white/80 dark:bg-[#1E2922] text-[#8C733E] dark:text-[#E4B55C] border border-[#F1C877] dark:border-[#5C4518]'
                      }`}
                    >
                      {isDone ? '✓' : `D${day}`}
                    </div>
                    <span className="text-[10px] font-bold text-[#8C733E] dark:text-[#E4B55C]">
                      Day {day}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 2 Main Action Cards (Today's Journey & Mood Check-in) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-8">
          {/* Big Start Today's Journey Card */}
          {onActivity ? (
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
          ) : (
            <Link
              href="/app/patient/session"
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
            </Link>
          )}

          {/* Daily Check-in Card */}
          {onCheckIn ? (
            <button 
              type="button"
              onClick={onCheckIn}
              className="w-full bg-[#FFFDF7] dark:bg-[#232E28] border-2 border-[#EBE6D8] dark:border-[#2F3F36] hover:border-[#6F8F7A] dark:hover:border-[#8BAFA0] rounded-3xl p-6 sm:p-7 text-left shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-wider mb-2">
                  Daily Check-in
                </p>
                <h3 className="font-extrabold text-2xl text-[#29352F] dark:text-[#F7F4EC] mb-2">
                  {moodDisplay ? moodDisplay : 'How are you feeling?'}
                </h3>
                <p className="text-sm text-[#47554E] dark:text-[#A3B3AA] leading-relaxed">
                  {moodDisplay 
                    ? 'Check-in recorded for today. Tap anytime to update.' 
                    : 'A brief check-in helps personalize your daily experience.'}
                </p>
              </div>
              <span className="text-sm font-bold text-[#6F8F7A] dark:text-[#8BAFA0] mt-6 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>{moodDisplay ? 'Update feeling' : 'Record check-in'}</span>
                <ArrowRight size={18} />
              </span>
            </button>
          ) : (
            <Link 
              href="/app/patient/checkin"
              className="w-full bg-[#FFFDF7] dark:bg-[#232E28] border-2 border-[#EBE6D8] dark:border-[#2F3F36] hover:border-[#6F8F7A] dark:hover:border-[#8BAFA0] rounded-3xl p-6 sm:p-7 text-left shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-wider mb-2">
                  Daily Check-in
                </p>
                <h3 className="font-extrabold text-2xl text-[#29352F] dark:text-[#F7F4EC] mb-2">
                  {moodDisplay ? moodDisplay : 'How are you feeling?'}
                </h3>
                <p className="text-sm text-[#47554E] dark:text-[#A3B3AA] leading-relaxed">
                  {moodDisplay 
                    ? 'Check-in recorded for today. Tap anytime to update.' 
                    : 'A brief check-in helps personalize your daily experience.'}
                </p>
              </div>
              <span className="text-sm font-bold text-[#6F8F7A] dark:text-[#8BAFA0] mt-6 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>{moodDisplay ? 'Update feeling' : 'Record check-in'}</span>
                <ArrowRight size={18} />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Dynamic Progress Footer */}
      <div className="pt-6 border-t-2 border-[#EBE6D8] dark:border-[#28372E] max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm sm:text-base text-[#29352F] dark:text-[#F7F4EC] font-extrabold flex items-center gap-2">
            <span>🌿</span> Today’s gentle wellness progress
          </span>
          <span className="text-xs sm:text-sm text-[#6F8F7A] dark:text-[#8BAFA0] font-bold bg-[#E8EFEA] dark:bg-[#28372E] px-3.5 py-1 rounded-full">
            {completedMomentsCount > 0 ? `${completedMomentsCount} of ${totalWeight} moments complete` : 'Ready to begin'}
          </span>
        </div>
        <div className="w-full bg-[#EBE6D8] dark:bg-[#28372E] rounded-full h-4 overflow-hidden p-0.5">
          <div 
            className="bg-[#6F8F7A] h-full rounded-full transition-all duration-500 shadow-xs" 
            style={{ width: `${Math.max(progressPercent, completedMomentsCount > 0 ? 33 : 0)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
