'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Mic, CheckCircle2, Heart, Sparkles, MessageSquare, Sun, Droplets, Smile, ArrowRight } from 'lucide-react'
import { startSTT, stopSTT } from '@/lib/stt'

interface DiaryProps {
  preferences: any;
  patientHistory: any[];
  onContinue: () => void;
}

interface RoutineItem {
  id: string;
  time: string;
  title: string;
  desc: string;
  icon: string;
  completed: boolean;
}

export default function PatientDiaryScreen({ preferences, patientHistory = [], onContinue }: DiaryProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const [diaryNote, setDiaryNote] = useState('')
  const [isListening, setIsListening] = useState(false)

  // Daily Routine checklist state
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([
    { id: '1', time: '8:00 AM', title: 'Morning Sunshine & Hydration', desc: 'Drink a glass of warm water & look out the window', icon: '☀️', completed: true },
    { id: '2', time: '10:30 AM', title: 'Cognia Wellness Flow', desc: 'Orientation, breathing & gentle brain puzzles', icon: '🌿', completed: true },
    { id: '3', time: '1:00 PM', title: 'Nourishing Lunch', desc: 'Healthy meal & pleasant calm music', icon: '🍲', completed: false },
    { id: '4', time: '3:30 PM', title: 'Memory Lane & Scrapbook', desc: 'Browse cherished family photos & stories', icon: '📸', completed: false },
    { id: '5', time: '5:00 PM', title: 'Gentle Walk / Stretch', desc: 'Light movement around the garden or living room', icon: '🚶', completed: false },
  ])

  const toggleItem = (id: string) => {
    setRoutineItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item))
  }

  const caregiverPrompt = preferences?.caregiver_daily_task || 'Take a moment to enjoy the sunshine and smile today!'

  const handleVoiceInput = async () => {
    if (isListening) {
      stopSTT()
      setIsListening(false)
      return
    }

    setIsListening(true)
    startSTT({
      continuous: true,
      onTranscript: (text) => {
        setDiaryNote(prev => prev ? `${prev} ${text}` : text)
        setIsListening(false)
      },
      onError: () => setIsListening(false)
    })
  }

  return (
    <div className="w-full flex flex-col h-full animate-in fade-in duration-300 pb-8">
      {/* Header Banner */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6F8F7A] uppercase tracking-wider mb-1">
          <Calendar size={18} />
          <span>Daily Routine & Peaceful Thoughts</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] tracking-tight mb-2">
          Today's Rhythm
        </h1>
        <p className="text-base sm:text-lg text-[#47554E]">
          {today} &bull; A gentle guide to support your day with comfort and joy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Routine Schedule Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF7] border-2 border-[#EBE6D8] shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-[#29352F] mb-6 flex items-center justify-between">
              <span>Daily Wellness Schedule</span>
              <span className="text-xs font-bold text-[#6F8F7A] bg-[#E8EFEA] px-3 py-1 rounded-full">
                {routineItems.filter(i => i.completed).length} of {routineItems.length} Done
              </span>
            </h3>

            <div className="space-y-3">
              {routineItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 text-left cursor-pointer ${
                    item.completed
                      ? 'bg-[#F1F6F3] border-[#6F8F7A]/40'
                      : 'bg-[#F7F4EC] border-[#E3DEC3] hover:border-[#6F8F7A]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-[#6F8F7A] bg-white px-2 py-0.5 rounded-md shadow-2xs">
                          {item.time}
                        </span>
                        <h4 className={`font-bold text-base sm:text-lg ${item.completed ? 'text-[#29352F] line-through opacity-80' : 'text-[#29352F]'}`}>
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-[#47554E]">{item.desc}</p>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    item.completed ? 'bg-[#6F8F7A] border-[#6F8F7A] text-[#FFFDF7]' : 'border-[#CBD5E1] bg-white'
                  }`}>
                    {item.completed && <CheckCircle2 size={20} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Diary & Personal Note */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF7] border-2 border-[#EBE6D8] shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-[#29352F] mb-2 flex items-center gap-2">
              <MessageSquare size={22} className="text-[#6F8F7A]" />
              <span>Voice Journal & Reflections</span>
            </h3>
            <p className="text-sm text-[#47554E] mb-4">
              Speak or type any peaceful thought from your day. It will be saved into your private memory diary.
            </p>

            <textarea
              value={diaryNote}
              onChange={(e) => setDiaryNote(e.target.value)}
              placeholder="Tap to type your thoughts or use the Voice button below..."
              rows={3}
              className="w-full p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#E3DEC3] text-[#29352F] placeholder-[#6B7C73] focus:outline-none focus:border-[#6F8F7A] resize-none mb-4 text-base"
            />

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition cursor-pointer border shadow-xs ${
                  isListening
                    ? 'bg-[#F9ECE9] text-[#C96B5C] border-[#C96B5C] animate-pulse'
                    : 'bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] border-[#577361]'
                }`}
              >
                <Mic size={18} />
                <span>{isListening ? 'Listening to your voice...' : '🎙️ Speak Thought'}</span>
              </button>
              {diaryNote && (
                <span className="text-xs font-bold text-[#6F8F7A] bg-[#E8EFEA] px-3 py-1 rounded-full">
                  ✓ Note saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Family Prompt & Gentle Affirmation */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#FFF8EC] border-2 border-[#FDE6BA] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D9A441] uppercase tracking-wider mb-2">
              <Heart size={16} className="fill-current" />
              <span>Caregiver Note</span>
            </div>
            <h4 className="text-lg font-bold text-[#29352F] mb-2">Message for You</h4>
            <p className="text-base text-[#29352F] italic font-medium leading-relaxed mb-4">
              "{caregiverPrompt}"
            </p>
            <p className="text-xs text-[#6B7C73]">
              Sent with love from your family care circle.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#F1F6F3] border-2 border-[#D4E4DC] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6F8F7A] uppercase tracking-wider mb-2">
              <Sparkles size={16} />
              <span>Daily Thought</span>
            </div>
            <p className="text-base text-[#29352F] font-semibold leading-relaxed">
              "Every smile, every deep breath, and every gentle conversation nurtures a calm and peaceful heart."
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 flex justify-center">
        <button
          onClick={onContinue}
          className="w-full max-w-md py-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Save & Return to Home</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}
