'use client'

import React, { useState, useEffect } from 'react'
import { fetchPatientStreak } from '@/lib/db'
import { Sparkles, Sun, ArrowRight, ShieldCheck, Heart } from 'lucide-react'

interface WelcomeProps {
  patientName: string;
  patientId?: string;
  onStart: () => void;
}

export default function PatientWelcomeScreen({ patientName, patientId, onStart }: WelcomeProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const [streak, setStreak] = useState<number>(1)

  useEffect(() => {
    if (patientId) {
      fetchPatientStreak(patientId).then((data) => {
        if (data && typeof data.current_streak === 'number') {
          setStreak(Math.max(1, data.current_streak))
        }
      })
    }
  }, [patientId])

  const nodes = [
    { day: 1, x: 75,  y: 155, label: 'Day 1' },
    { day: 2, x: 140, y: 140, label: 'Day 2' },
    { day: 3, x: 215, y: 105, label: 'Day 3' },
    { day: 4, x: 295, y: 135, label: 'Day 4' },
    { day: 5, x: 370, y: 155, label: 'Day 5' },
    { day: 6, x: 425, y: 95,  label: 'Day 6' },
    { day: 7, x: 355, y: 40,  label: 'Day 7' },
  ]

  const currentActiveDay = Math.min(Math.max(streak, 1), 7)

  return (
    <div className="relative w-full h-full min-h-[75vh] rounded-3xl bg-gradient-to-b from-[#FFFDF7] via-[#F7F4EC] to-[#E8EFEA] border-2 border-[#EBE6D8] p-6 sm:p-10 lg:p-12 shadow-xs overflow-hidden flex flex-col justify-between animate-in fade-in duration-300 select-none">
      {/* Top Badges & Greeting Area */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs sm:text-sm font-extrabold text-[#6F8F7A] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#D9A441]" />
            <span>Gentle Daily Journey</span>
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#29352F] bg-[#FFF8EC] px-4 py-1.5 rounded-full border border-[#FDE6BA] shadow-2xs">
            🔥 Day {currentActiveDay} of 7 Active
          </span>
        </div>

        <p className="text-[#6F8F7A] text-xs sm:text-sm md:text-base font-bold tracking-wide mb-1">
          {today}
        </p>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#29352F] mb-2 leading-tight">
          Good day, {patientName}
        </h1>
        
        <p className="text-base sm:text-lg text-[#47554E] max-w-xl">
          Welcome to your comforting space for memory, movement, and daily wellness.
        </p>
      </div>

      {/* Middle: Winding Serpentine Roadmap Track */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center my-auto py-4 sm:py-6">
        <div className="w-full max-w-2xl lg:max-w-3xl">
          <svg 
            viewBox="0 0 500 200" 
            className="w-full h-auto drop-shadow-xs"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Serpentine track base */}
            <path
              d="M 50 160 C 130 160, 160 125, 215 105 C 270 85, 270 150, 360 160 C 430 168, 470 120, 425 80 C 395 50, 365 40, 290 35"
              stroke="#FFFDF7"
              strokeWidth="32"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-95"
            />
            <path
              d="M 50 160 C 130 160, 160 125, 215 105 C 270 85, 270 150, 360 160 C 430 168, 470 120, 425 80 C 395 50, 365 40, 290 35"
              stroke="#E8EFEA"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Progress active line */}
            <path
              d="M 50 160 C 130 160, 160 125, 215 105 C 270 85, 270 150, 360 160"
              stroke="#6F8F7A"
              strokeWidth="6"
              strokeDasharray="8 8"
              strokeLinecap="round"
              className="opacity-80"
            />

            {/* End Milestone Gift Box */}
            <g transform="translate(255, 10)">
              <circle cx="24" cy="24" r="24" fill="#FFF8EC" stroke="#FDE6BA" strokeWidth="2.5" />
              <text x="24" y="32" fontSize="24" textAnchor="middle">🎁</text>
            </g>

            {/* Numbered Day Nodes */}
            {nodes.map((node) => {
              const isCompleted = node.day < currentActiveDay
              const isCurrent = node.day === currentActiveDay

              return (
                <g key={node.day} className="transition-all duration-300">
                  <g transform={`translate(${node.x}, ${node.y - 25})`}>
                    <text x="0" y="0" textAnchor="middle" fontSize="11" fill={isCompleted ? '#D9A441' : isCurrent ? '#6F8F7A' : '#A3B3AA'}>
                      {isCompleted ? '★★★' : isCurrent ? '★★☆' : '☆☆☆'}
                    </text>
                  </g>

                  {/* Outer glow ping for current active day */}
                  {isCurrent && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="26"
                      fill="#6F8F7A"
                      className="animate-ping opacity-25"
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={
                      isCompleted 
                        ? '#6F8F7A' 
                        : isCurrent 
                          ? '#577361' 
                          : '#E8EFEA'
                    }
                    stroke={isCurrent ? '#FFFDF7' : '#D4E4DC'}
                    strokeWidth={isCurrent ? '3.5' : '2'}
                    className="shadow-xs"
                  />

                  {/* Node text / icon */}
                  {isCompleted ? (
                    <text
                      x={node.x}
                      y={node.y + 6}
                      fontSize="15"
                      fontWeight="bold"
                      fill="#FFFDF7"
                      textAnchor="middle"
                    >
                      ✓
                    </text>
                  ) : (
                    <text
                      x={node.x}
                      y={node.y + 6}
                      fontSize="14"
                      fontWeight="800"
                      fill={isCurrent ? '#FFFDF7' : '#29352F'}
                      textAnchor="middle"
                    >
                      {node.day}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <p className="text-xs sm:text-sm text-[#47554E] font-medium text-center mt-3">
          Nurture your daily streak with today’s moments 🌿
        </p>
      </div>
      
      {/* Bottom Start Button */}
      <div className="relative z-10 pt-2 flex justify-center w-full">
        <button 
          onClick={onStart}
          className="w-full max-w-md py-4 sm:py-5 px-8 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-xl sm:text-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>Start Today’s Journey</span>
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  )
}
