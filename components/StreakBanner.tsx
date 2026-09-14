'use client'

import { useEffect, useState } from 'react'
import { Sun } from 'lucide-react'
import { fetchPatientStreak } from '@/lib/db'

interface StreakBannerProps {
  patientId: string
}

export default function StreakBanner({ patientId }: StreakBannerProps) {
  const [streak, setStreak] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [lastSessionDate, setLastSessionDate] = useState<string | null>(null)

  useEffect(() => {
    async function loadStreak() {
      const data = await fetchPatientStreak(patientId)
      if (data) {
        setStreak(data.current_streak || 0)
        setLastSessionDate(data.last_session_date || null)
      }
      setLoading(false)
    }
    loadStreak()
  }, [patientId])

  if (loading) return null
  if (streak === 0) return null

  // Determine which days of the past week they were active (mock representation based on streak)
  // For a true 7-day tracker, we'd need a table of daily session logs, but we can approximate it:
  // If streak >= 7, all 7 checkmarks. If streak is 3, the last 3 checkmarks.
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const todayIndex = new Date().getDay()
  
  // Create an array of 7 days ending in today
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.getDay()
  })

  // How many contiguous days in the past 7 they played
  // We approximate: if their streak is N, the last min(N, 7) days are checked, EXCEPT if they haven't played today, we shift back by 1.
  const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  const playedToday = lastSessionDate === todayStr
  const activeDaysCount = Math.min(streak, 7)
  
  return (
    <div className="w-full bg-gradient-to-r from-[#E8EFEA] via-[#DFEAE2] to-[#E8EFEA] dark:from-[#141D18] dark:via-[#19241E] dark:to-[#141D18] border-b-2 border-[#6F8F7A]/30 dark:border-[#28372E] py-3 px-4 sm:px-6 shadow-xs">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Streak Pill */}
        <div className="flex items-center gap-3 bg-gradient-to-b from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#17211B] px-5 py-2 rounded-full shadow-xs border border-[#6F8F7A]/30 dark:border-[#33423A]">
          <Sun className="text-[#D9A441]" size={24} />
          <div>
            <span className="font-extrabold text-[#29352F] dark:text-[#F7F4EC] text-lg block leading-tight">{streak} Days Active</span>
            <span className="text-xs text-[#577361] dark:text-[#8BAFA0] font-semibold uppercase tracking-wider block">Current Streak</span>
          </div>
        </div>

        {/* 7-Day Visual Tracker */}
        <div className="flex items-center gap-2">
          {last7Days.map((dayIndex, index) => {
            // Logic to determine if this bubble should be "checked"
            // If they played today, the last `activeDaysCount` bubbles are checked.
            // If they didn't play today, the last bubble is unchecked, and the `activeDaysCount` bubbles before it are checked.
            const fromEnd = 6 - index;
            const isChecked = playedToday 
              ? fromEnd < activeDaysCount 
              : (fromEnd > 0 && fromEnd <= activeDaysCount);

            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-[#6B7C73] dark:text-[#A3B3AA]">{days[dayIndex]}</span>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-inner transition-all ${
                    isChecked 
                      ? 'bg-gradient-to-br from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] text-white border-2 border-[#526F5D] shadow-xs' 
                      : 'bg-gradient-to-b from-[#FFFDF7] to-[#F5F8F5] dark:bg-gradient-to-b dark:from-[#1E2922] dark:to-[#17211B] text-[#8E9F95] dark:text-[#577361] border-2 border-[#E8EFEA] dark:border-[#33423A]'
                  }`}
                  title={isChecked ? 'Completed' : 'Missed'}
                >
                  {isChecked ? '✓' : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
