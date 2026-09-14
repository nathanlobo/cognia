'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Brain, Eye, MessageSquare, Compass, Puzzle, EyeOff, Play, ShieldCheck, Heart } from 'lucide-react'

interface ActivitiesProps {
  patientHistory?: any[];
  onStartActivity?: (domain?: string) => void;
  onBack?: () => void;
}

const DOMAINS = [
  {
    id: 'Memory',
    title: 'Memory & Recall',
    description: 'Patterns & Recall',
    icon: Brain,
    color: '#D9A441',
    cardClass: 'bg-[#FFF8EC] dark:bg-[#2A2318] border-[#FDE6BA] dark:border-[#4D3B18]',
  },
  {
    id: 'Attention',
    title: 'Focus & Attention',
    description: 'Visual Attention & Focus',
    icon: Eye,
    color: '#6F8F7A',
    cardClass: 'bg-[#F1F6F3] dark:bg-[#1E2922] border-[#D4E4DC] dark:border-[#2F3F36]',
  },
  {
    id: 'Language',
    title: 'Words & Language',
    description: 'Words & Opposites',
    icon: MessageSquare,
    color: '#5B7A8C',
    cardClass: 'bg-[#EEF4F8] dark:bg-[#1C262C] border-[#D0E1EC] dark:border-[#2A3B45]',
  },
  {
    id: 'Recognition',
    title: 'Object Recognition',
    description: 'Shapes & Objects',
    icon: EyeOff,
    color: '#C96B5C',
    cardClass: 'bg-[#FDF2F0] dark:bg-[#2C1E1B] border-[#F8D8D3] dark:border-[#4A2B25]',
  },
  {
    id: 'Orientation',
    title: 'Daily Orientation',
    description: 'Time & Seasons',
    icon: Compass,
    color: '#8B6FA8',
    cardClass: 'bg-[#F6F2FA] dark:bg-[#251E2D] border-[#E6DCF2] dark:border-[#402F4F]',
  },
  {
    id: 'Problem Solving',
    title: 'Logic & Puzzles',
    description: 'Logic & Deduction',
    icon: Puzzle,
    color: '#5C8A74',
    cardClass: 'bg-[#EDF5F1] dark:bg-[#1A2620] border-[#CFE5DA] dark:border-[#273E32]',
  },
]

export default function PatientActivitiesScreen({ patientHistory = [], onStartActivity }: ActivitiesProps) {
  const router = useRouter()

  const handleStart = (domain?: string) => {
    if (onStartActivity) {
      onStartActivity(domain)
    } else {
      router.push('/app/patient/session')
    }
  }

  const totalCompleted = patientHistory.length

  return (
    <div className="w-full flex flex-col h-full animate-in fade-in duration-300 pb-8">
      {/* Header Banner */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-wider mb-1">
          <Sparkles size={18} />
          <span>Cognitive Wellness Activities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] tracking-tight mb-2">
          Mind Games & Play
        </h1>
        <p className="text-base sm:text-lg text-[#47554E] dark:text-[#A3B3AA] max-w-xl">
          Zero stress, zero countdowns. Tap any focus area to start playing.
        </p>
      </div>

      {/* Quick Play Daily Mix Banner */}
      <div className="w-full mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#6F8F7A] to-[#577361] text-[#FFFDF7] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-2 border-[#577361]">
        <div className="flex-1">
          <div className="flex items-center gap-2 bg-[#FFFDF7]/20 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-bold w-fit mb-3">
            <Heart size={14} className="fill-current text-[#D9A441]" />
            <span>Recommended for Today</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">Daily Balanced Mix</h2>
          <p className="text-sm sm:text-base text-[#FFFDF7]/90 font-medium">
            {totalCompleted > 0 
              ? `You have completed ${totalCompleted} session${totalCompleted === 1 ? '' : 's'} so far. Continue your brain training!` 
              : 'A balanced mix of all 6 cognitive focus areas tailored for you.'}
          </p>
        </div>
        <button
          onClick={() => handleStart()}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FFFDF7] dark:bg-[#1E2922] hover:bg-[#F7F4EC] dark:hover:bg-[#28372E] text-[#29352F] dark:text-[#F7F4EC] font-extrabold text-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 cursor-pointer shrink-0"
        >
          <Play size={20} className="fill-current text-[#6F8F7A] dark:text-[#8BAFA0]" />
          <span>Start Full Session</span>
        </button>
      </div>

      {/* Focus Area Grid */}
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] mb-4">
          Focus Areas
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon

          return (
            <div
              key={domain.id}
              className={`rounded-3xl p-6 sm:p-7 border-2 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:scale-[1.01] ${domain.cardClass}`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div
                    style={{ backgroundColor: domain.color, color: '#FFFDF7' }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs"
                  >
                    <Icon size={28} />
                  </div>
                  <span
                    style={{ backgroundColor: domain.color, color: '#FFFDF7' }}
                    className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs"
                  >
                    {domain.id}
                  </span>
                </div>

                <h4 
                  className="text-2xl sm:text-3xl font-black text-[#29352F] dark:text-[#F7F4EC] mb-1.5 tracking-tight leading-snug"
                >
                  {domain.title}
                </h4>

                <p 
                  style={{ color: domain.color }}
                  className="text-sm sm:text-base font-extrabold mb-6 tracking-wide"
                >
                  {domain.description}
                </p>
              </div>

              <button
                onClick={() => handleStart(domain.id)}
                style={{ backgroundColor: domain.color }}
                className="w-full py-4 px-4 rounded-2xl text-[#FFFDF7] font-extrabold text-base transition-all shadow-xs hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer mt-auto"
              >
                <Play size={18} className="fill-current" />
                <span>Play Game</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Compassionate Assurance */}
      <div className="mt-8 p-5 rounded-2xl bg-[#FFFDF7] dark:bg-[#232E28] border-2 border-[#EBE6D8] dark:border-[#2F3F36] flex items-center gap-4 text-xs sm:text-sm text-[#47554E] dark:text-[#A3B3AA]">
        <ShieldCheck size={26} className="text-[#6F8F7A] dark:text-[#8BAFA0] shrink-0" />
        <p className="leading-relaxed font-medium">
          Zero countdown timers or failure scores. Take as much time as you like on every question.
        </p>
      </div>
    </div>
  )
}
