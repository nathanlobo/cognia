'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, ArrowLeft } from 'lucide-react'

interface CheckInProps {
  initialMood?: string;
  onContinue: (mood: string) => void;
  onBack?: () => void;
}

const MOODS = [
  {
    id: 'Joyful & Good',
    title: 'Joyful & Good',
    emoji: '🌟',
    color: '#D9A441',
    cardClass: 'bg-[#FFF8EC] dark:bg-[#2A2318] border-[#FDE6BA] dark:border-[#4D3B18]',
    sub: 'Bright, energetic & cheerful',
  },
  {
    id: 'Peaceful & Calm',
    title: 'Peaceful & Calm',
    emoji: '🌿',
    color: '#6F8F7A',
    cardClass: 'bg-[#F1F6F3] dark:bg-[#1E2922] border-[#D4E4DC] dark:border-[#2F3F36]',
    sub: 'Comfortable, steady & relaxed',
  },
  {
    id: 'Calm & Relaxed',
    title: 'Calm & Relaxed',
    emoji: '☕',
    color: '#5B7A8C',
    cardClass: 'bg-[#EEF4F8] dark:bg-[#1C262C] border-[#D0E1EC] dark:border-[#2A3B45]',
    sub: 'Gentle, easygoing & serene',
  },
  {
    id: 'A Bit Tired',
    title: 'A Bit Tired',
    emoji: '🛋️',
    color: '#C96B5C',
    cardClass: 'bg-[#FDF2F0] dark:bg-[#2C1E1B] border-[#F8D8D3] dark:border-[#4A2B25]',
    sub: 'Taking it extra slow & easy',
  },
]

export default function PatientCheckInScreen({ initialMood = '', onContinue, onBack }: CheckInProps) {
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState<string>(initialMood || '')

  const handleBack = () => {
    if (onBack) onBack()
    else router.push('/app/patient')
  }

  return (
    <div className="flex flex-col h-full justify-between animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6F8F7A] dark:text-[#8BAFA0] hover:text-[#526F5D] dark:hover:text-[#FFFDF7] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Today Hub</span>
          </button>
          <span className="text-xs sm:text-sm font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-wider">
            Daily Check-in
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] mb-3">
          How are you feeling today?
        </h1>
        <p className="text-base sm:text-lg text-[#47554E] dark:text-[#A3B3AA] mb-8">
          Select the card that best matches your spirit right now.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.id

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.id)}
                className={`w-full p-6 sm:p-7 rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all shadow-xs hover:shadow-md cursor-pointer relative ${m.cardClass} ${
                  isSelected ? 'scale-[1.03] ring-4' : 'hover:scale-[1.01]'
                }`}
                style={{
                  borderColor: isSelected ? m.color : undefined,
                }}
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
                <h3 className="font-extrabold text-xl text-[#29352F] dark:text-[#F7F4EC] mb-1">
                  {m.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#47554E] dark:text-[#A3B3AA] leading-relaxed">
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
          disabled={!selectedMood}
          onClick={() => {
            if (selectedMood) onContinue(selectedMood)
          }}
          className={`w-full max-w-md py-4 sm:py-5 px-8 rounded-2xl font-extrabold text-xl transition-all shadow-md flex items-center justify-center gap-3 ${
            selectedMood
              ? 'bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] hover:shadow-lg cursor-pointer'
              : 'bg-[#EBE6D8] dark:bg-[#28372E] text-[#A3B3AA] cursor-not-allowed opacity-60'
          }`}
        >
          <span>{selectedMood ? `Continue with ${selectedMood.split(' ')[0]}` : 'Select a feeling to continue'}</span>
          {selectedMood && <ArrowRight size={22} />}
        </button>
      </div>
    </div>
  )
}
