'use client'

import React from 'react'
import { Sparkles, Brain, Eye, MessageSquare, Compass, Puzzle, EyeOff, Play, ShieldCheck, Heart } from 'lucide-react'

interface ActivitiesProps {
  onStartActivity: (domain?: string) => void;
  onBack?: () => void;
}

const DOMAINS = [
  {
    id: 'Memory',
    title: 'Memory & Recall',
    description: 'Patterns & Recall',
    icon: Brain,
    color: '#D9A441', // Warm Amber
    bgColor: '#FFF8EC',
    borderColor: '#FDE6BA',
  },
  {
    id: 'Attention',
    title: 'Focus & Attention',
    description: 'Visual Attention & Focus',
    icon: Eye,
    color: '#6F8F7A', // Sage Green
    bgColor: '#F1F6F3',
    borderColor: '#D4E4DC',
  },
  {
    id: 'Language',
    title: 'Words & Language',
    description: 'Words & Opposites',
    icon: MessageSquare,
    color: '#5B7A8C', // Slate Blue
    bgColor: '#EEF4F8',
    borderColor: '#D0E1EC',
  },
  {
    id: 'Recognition',
    title: 'Object Recognition',
    description: 'Shapes & Objects',
    icon: EyeOff,
    color: '#C96B5C', // Muted Terracotta
    bgColor: '#FDF2F0',
    borderColor: '#F8D8D3',
  },
  {
    id: 'Orientation',
    title: 'Daily Orientation',
    description: 'Time & Seasons',
    icon: Compass,
    color: '#8B6FA8', // Lavender
    bgColor: '#F6F2FA',
    borderColor: '#E6DCF2',
  },
  {
    id: 'Problem Solving',
    title: 'Logic & Puzzles',
    description: 'Logic & Deduction',
    icon: Puzzle,
    color: '#5C8A74', // Forest Green
    bgColor: '#EDF5F1',
    borderColor: '#CFE5DA',
  },
]

export default function PatientActivitiesScreen({ onStartActivity }: ActivitiesProps) {
  return (
    <div className="w-full flex flex-col h-full animate-in fade-in duration-300 pb-8">
      {/* Header Banner */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6F8F7A] uppercase tracking-wider mb-1">
          <Sparkles size={18} />
          <span>Cognitive Wellness Activities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] tracking-tight mb-2">
          Mind Games & Play
        </h1>
        <p className="text-base sm:text-lg text-[#47554E] max-w-xl">
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
            A balanced mix of all 6 cognitive focus areas.
          </p>
        </div>
        <button
          onClick={() => onStartActivity()}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FFFDF7] hover:bg-[#F7F4EC] text-[#29352F] font-extrabold text-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 cursor-pointer shrink-0"
        >
          <Play size={20} className="fill-current text-[#6F8F7A]" />
          <span>Start Full Session</span>
        </button>
      </div>

      {/* Focus Area Grid with Highlighted Titles and Minimal 2-3 Word Descriptions */}
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#29352F] mb-4">
          Focus Areas
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon

          return (
            <div
              key={domain.id}
              style={{ backgroundColor: domain.bgColor, borderColor: domain.borderColor }}
              className="rounded-3xl p-6 sm:p-7 border-2 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:scale-[1.01]"
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

                {/* Highlighted Title */}
                <h4 
                  className="text-2xl sm:text-3xl font-black text-[#29352F] mb-1.5 tracking-tight leading-snug"
                >
                  {domain.title}
                </h4>

                {/* Minimal 2-3 Word Description */}
                <p 
                  style={{ color: domain.color }}
                  className="text-sm sm:text-base font-extrabold mb-6 tracking-wide"
                >
                  {domain.description}
                </p>
              </div>

              <button
                onClick={() => onStartActivity(domain.id)}
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
      <div className="mt-8 p-5 rounded-2xl bg-[#FFFDF7] border-2 border-[#EBE6D8] flex items-center gap-4 text-xs sm:text-sm text-[#47554E]">
        <ShieldCheck size={26} className="text-[#6F8F7A] shrink-0" />
        <p className="leading-relaxed font-medium">
          Zero countdown timers or failure scores. Take as much time as you like on every question.
        </p>
      </div>
    </div>
  )
}
