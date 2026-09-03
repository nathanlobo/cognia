'use client'

import React, { useState } from 'react'
import { Heart, Sparkles, Check, ArrowRight } from 'lucide-react'

interface CheckInProps {
  initialMood?: string;
  onContinue: (mood: string) => void;
}

export default function PatientCheckInScreen({ initialMood = '', onContinue }: CheckInProps) {
  const [selectedMood, setSelectedMood] = useState<string>(initialMood || 'Joyful & Good')

  const moods = [
    {
      id: 'Joyful & Good',
      title: 'Joyful & Good',
      emoji: '🌟',
      color: '#D9A441',
      bgCard: '#FFF8EC',
      borderCard: '#FDE6BA',
      sub: 'Bright, energetic & cheerful',
    },
    {
      id: 'Peaceful & Calm',
      title: 'Peaceful & Calm',
      emoji: '🌿',
      color: '#6F8F7A',
      bgCard: '#F1F6F3',
      borderCard: '#D4E4DC',
      sub: 'Comfortable, steady & relaxed',
    },
    {
      id: 'Calm & Relaxed',
      title: 'Calm & Relaxed',
      emoji: '☕',
      color: '#5B7A8C',
      bgCard: '#EEF4F8',
      borderCard: '#D0E1EC',
      sub: 'Gentle, easygoing & serene',
    },
    {
      id: 'A Bit Tired',
      title: 'A Bit Tired',
      emoji: '🛋️',
      color: '#C96B5C',
      bgCard: '#FDF2F0',
      borderCard: '#F8D8D3',
      sub: 'Taking it extra slow & easy',
    },
  ]

  return (
    <div className="flex flex-col h-full justify-between animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
      <div>
        <p className="text-[#6F8F7A] text-xs sm:text-sm md:text-base font-bold tracking-wide mb-2 uppercase">
          Daily Check-in &bull; Step 1 of 6
        </p>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] mb-3">
          How are you feeling today?
        </h1>
        <p className="text-base sm:text-lg text-[#47554E] mb-8">
          Select the card that best matches your spirit right now.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
          {moods.map((m) => {
            const isSelected = selectedMood === m.id

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.id)}
                style={{
                  backgroundColor: m.bgCard,
                  borderColor: isSelected ? m.color : m.borderCard,
                }}
                className={`w-full p-6 sm:p-7 rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all shadow-xs hover:shadow-md cursor-pointer relative ${
                  isSelected ? 'scale-[1.03] ring-4' : 'hover:scale-[1.01]'
                }`}
                style-ring={isSelected ? m.color : undefined}
              >
                {isSelected && (
                  <span
                    style={{ backgroundColor: m.color }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full text-[#FFFDF7] flex items-center justify-center text-xs font-bold shadow-xs"
                  >
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}

                <span className="text-5xl mb-4">{m.emoji}</span>
                <h3 className="font-extrabold text-xl text-[#29352F] mb-1">
                  {m.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#47554E] leading-relaxed">
                  {m.sub}
                </p>
              </button>
            )
          })}
        </div>
      </div>
      
      <div className="mt-auto pt-6 flex justify-center w-full">
        <button 
          type="button"
          onClick={() => onContinue(selectedMood)}
          className="w-full max-w-md py-4 sm:py-5 px-8 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>Continue with {selectedMood.split(' ')[0]}</span>
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  )
}
