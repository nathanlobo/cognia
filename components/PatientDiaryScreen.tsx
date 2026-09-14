'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Mic, CheckCircle2, Heart, Sparkles, MessageSquare, ArrowRight, Save, ShieldAlert } from 'lucide-react'
import { startSTT, stopSTT } from '@/lib/stt'

interface DiaryProps {
  preferences: any;
  patientHistory?: any[];
  todayIso?: string;
  onSavePreferences?: (partial: any) => Promise<any>;
  onContinue?: () => void;
}

export interface RoutineItem {
  id: string;
  time: string;
  title: string;
  desc: string;
  icon: string;
  completed: boolean;
}

function getRoutineIcon(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('morning') || lower.includes('sun') || lower.includes('wake')) return '☀️'
  if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrate')) return '💧'
  if (lower.includes('walk') || lower.includes('step') || lower.includes('garden') || lower.includes('stretch')) return '🚶'
  if (lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('eat') || lower.includes('food') || lower.includes('meal')) return '🍲'
  if (lower.includes('puzzle') || lower.includes('brain') || lower.includes('game') || lower.includes('flow')) return '🧠'
  if (lower.includes('photo') || lower.includes('memory') || lower.includes('album')) return '📸'
  if (lower.includes('medicine') || lower.includes('pill')) return '💊'
  if (lower.includes('read') || lower.includes('book')) return '📖'
  if (lower.includes('sleep') || lower.includes('night') || lower.includes('bed')) return '🌙'
  return '🌿'
}

export function parseDailyRoutine(rawRoutine: any, todayCompletions: Record<string, boolean> = {}): RoutineItem[] {
  if (!rawRoutine) return []

  const items: RoutineItem[] = []

  if (typeof rawRoutine === 'string') {
    const lines = rawRoutine.split('\n').map(l => l.trim()).filter(Boolean)
    lines.forEach((line, index) => {
      let time = ''
      let title = line
      let desc = ''

      if (line.includes(':')) {
        const parts = line.split(':')
        // Check if first part looks like a time (e.g. "8", "8:00 AM", "10am")
        const first = parts[0].trim()
        if (first.match(/\d/) || first.toLowerCase().includes('am') || first.toLowerCase().includes('pm')) {
          time = first
          title = parts.slice(1).join(':').trim()
        }
      }

      if (line.includes(' - ')) {
        const split = title.split(' - ')
        title = split[0].trim()
        desc = split.slice(1).join(' - ').trim()
      }

      const id = `item-${index}`
      items.push({
        id,
        time: time || 'Scheduled',
        title: title || line,
        desc: desc || 'Daily wellness activity',
        icon: getRoutineIcon(line),
        completed: Boolean(todayCompletions[id])
      })
    })
  } else if (typeof rawRoutine === 'object' && !Array.isArray(rawRoutine)) {
    let index = 0
    Object.entries(rawRoutine).forEach(([timeKey, val]) => {
      const id = `item-${index++}`
      const valStr = String(val)
      items.push({
        id,
        time: timeKey,
        title: valStr,
        desc: 'Daily routine item',
        icon: getRoutineIcon(valStr),
        completed: Boolean(todayCompletions[id])
      })
    })
  } else if (Array.isArray(rawRoutine)) {
    rawRoutine.forEach((entry, index) => {
      const id = `item-${index}`
      if (typeof entry === 'string') {
        items.push({
          id,
          time: 'Scheduled',
          title: entry,
          desc: 'Daily routine item',
          icon: getRoutineIcon(entry),
          completed: Boolean(todayCompletions[id])
        })
      } else if (typeof entry === 'object' && entry !== null) {
        items.push({
          id: entry.id || id,
          time: entry.time || 'Scheduled',
          title: entry.title || entry.name || 'Routine Item',
          desc: entry.desc || entry.description || '',
          icon: entry.icon || getRoutineIcon(entry.title || ''),
          completed: Boolean(todayCompletions[entry.id || id])
        })
      }
    })
  }

  return items
}

export default function PatientDiaryScreen({
  preferences,
  patientHistory = [],
  todayIso,
  onSavePreferences,
  onContinue
}: DiaryProps) {
  const router = useRouter()
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  
  const actualDate = todayIso || new Date().toISOString().split('T')[0]
  
  // Local optimistic overrides for immediate checkbox UI response
  const [localCompletions, setLocalCompletions] = useState<Record<string, boolean>>({})

  const rawCompletions = preferences?.routine_completions?.[actualDate]
  const completionsJson = JSON.stringify(rawCompletions || {})

  const routineItems = useMemo(() => {
    const dbCompletions: Record<string, boolean> = rawCompletions || {}
    const merged = { ...dbCompletions, ...localCompletions }
    return parseDailyRoutine(preferences?.daily_routine, merged)
  }, [preferences?.daily_routine, completionsJson, localCompletions])

  // Voice & Written Journal state
  const savedNote = preferences?.daily_notes?.[actualDate] || ''
  const [diaryNote, setDiaryNote] = useState(savedNote)
  const [isListening, setIsListening] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [saveNoteSuccess, setSaveNoteSuccess] = useState(false)

  useEffect(() => {
    if (preferences?.daily_notes?.[actualDate] !== undefined) {
      setDiaryNote(preferences.daily_notes[actualDate])
    }
  }, [preferences?.daily_notes, actualDate])

  const toggleItem = async (id: string) => {
    const target = routineItems.find(i => i.id === id)
    if (!target) return

    const nextCompleted = !target.completed
    setLocalCompletions(prev => ({ ...prev, [id]: nextCompleted }))

    if (onSavePreferences) {
      const dbCompletions = preferences?.routine_completions?.[actualDate] || {}
      const updatedCompletions = {
        ...(preferences?.routine_completions || {}),
        [actualDate]: {
          ...dbCompletions,
          [id]: nextCompleted
        }
      }
      try {
        await onSavePreferences({ routine_completions: updatedCompletions })
      } catch (err) {
        console.error('Failed to persist routine checkbox:', err)
      }
    }
  }

  const handleSaveNote = async (textToSave: string) => {
    if (!onSavePreferences) return
    setIsSavingNote(true)
    try {
      const updatedNotes = {
        ...(preferences?.daily_notes || {}),
        [actualDate]: textToSave
      }
      await onSavePreferences({ daily_notes: updatedNotes })
      setSaveNoteSuccess(true)
      setTimeout(() => setSaveNoteSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save journal note:', err)
    } finally {
      setIsSavingNote(false)
    }
  }

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
        const next = diaryNote ? `${diaryNote} ${text}` : text
        setDiaryNote(next)
        setIsListening(false)
        handleSaveNote(next)
      },
      onError: () => setIsListening(false)
    })
  }

  const caregiverPrompt = preferences?.caregiver_daily_task || ''
  const completedCount = routineItems.filter(i => i.completed).length

  return (
    <div className="w-full flex flex-col h-full animate-in fade-in duration-300 pb-8">
      {/* Header Banner */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-wider mb-1">
          <Calendar size={18} />
          <span>Daily Routine & Reflections</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] tracking-tight mb-2">
          Today's Rhythm
        </h1>
        <p className="text-base sm:text-lg text-[#47554E] dark:text-[#A3B3AA]">
          {todayFormatted} &bull; Sourced live from your personalized care plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Routine Schedule Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF7] dark:bg-[#1E2922] border-2 border-[#EBE6D8] dark:border-[#28372E] shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-[#29352F] dark:text-[#F7F4EC] mb-6 flex items-center justify-between">
              <span>Daily Wellness Schedule</span>
              {routineItems.length > 0 ? (
                <span className="text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] bg-[#E8EFEA] dark:bg-[#28372E] px-3 py-1 rounded-full">
                  {completedCount} of {routineItems.length} Done
                </span>
              ) : (
                <span className="text-xs font-bold text-[#6B7C73] dark:text-[#A3B3AA] bg-[#F7F4EC] dark:bg-[#16201B] px-3 py-1 rounded-full">
                  0 Scheduled
                </span>
              )}
            </h3>

            {routineItems.length > 0 ? (
              <div className="space-y-3">
                {routineItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 text-left cursor-pointer ${
                      item.completed
                        ? 'bg-[#F1F6F3] dark:bg-[#202E26] border-[#6F8F7A]/40 dark:border-[#3E5246]'
                        : 'bg-[#F7F4EC] dark:bg-[#16201B] border-[#E3DEC3] dark:border-[#2F3F36] hover:border-[#6F8F7A] dark:hover:border-[#8BAFA0]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          {item.time && (
                            <span className="text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] bg-white dark:bg-[#1E2922] px-2 py-0.5 rounded-md shadow-2xs">
                              {item.time}
                            </span>
                          )}
                          <h4 className={`font-bold text-base sm:text-lg ${item.completed ? 'text-[#29352F] dark:text-[#F7F4EC] line-through opacity-80' : 'text-[#29352F] dark:text-[#F7F4EC]'}`}>
                            {item.title}
                          </h4>
                        </div>
                        {item.desc && (
                          <p className="text-xs sm:text-sm text-[#47554E] dark:text-[#A3B3AA]">{item.desc}</p>
                        )}
                      </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      item.completed ? 'bg-[#6F8F7A] border-[#6F8F7A] text-[#FFFDF7]' : 'border-[#CBD5E1] dark:border-[#33423A] bg-white dark:bg-[#16201B]'
                    }`}>
                      {item.completed && <CheckCircle2 size={20} />}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#F7F4EC] dark:bg-[#16201B] border-2 border-dashed border-[#E3DEC3] dark:border-[#2F3F36] text-center flex flex-col items-center">
                <Clock size={36} className="text-[#6B7C73] dark:text-[#A3B3AA] mb-2 opacity-60" />
                <h4 className="font-extrabold text-base sm:text-lg text-[#29352F] dark:text-[#F7F4EC] mb-1">
                  No Daily Routine Scheduled Yet
                </h4>
                <p className="text-xs sm:text-sm text-[#6B7C73] dark:text-[#A3B3AA] max-w-sm">
                  Your connected caregiver can schedule your personalized morning, mealtime, and evening routine in the Caregiver Portal.
                </p>
              </div>
            )}
          </div>

          {/* Voice Diary & Personal Note */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF7] dark:bg-[#1E2922] border-2 border-[#EBE6D8] dark:border-[#28372E] shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-[#29352F] dark:text-[#F7F4EC] mb-2 flex items-center gap-2">
              <MessageSquare size={22} className="text-[#6F8F7A] dark:text-[#8BAFA0]" />
              <span>Voice Journal & Reflections</span>
            </h3>
            <p className="text-sm text-[#47554E] dark:text-[#A3B3AA] mb-4">
              Speak or write any peaceful thought from your day. It will be safely saved in your Supabase profile.
            </p>

            <textarea
              value={diaryNote}
              onChange={(e) => setDiaryNote(e.target.value)}
              onBlur={() => handleSaveNote(diaryNote)}
              placeholder="Tap to type your thoughts or speak below..."
              rows={3}
              className="w-full p-4 rounded-2xl bg-[#F7F4EC] dark:bg-[#16201B] border-2 border-[#E3DEC3] dark:border-[#2F3F36] text-[#29352F] dark:text-[#F7F4EC] placeholder-[#6B7C73] dark:placeholder-[#A3B3AA] focus:outline-none focus:border-[#6F8F7A] resize-none mb-4 text-base"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition cursor-pointer border shadow-xs ${
                    isListening
                      ? 'bg-[#F9ECE9] dark:bg-[#2C1E1B] text-[#C96B5C] dark:text-[#DB8072] border-[#C96B5C] animate-pulse'
                      : 'bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] border-[#577361]'
                  }`}
                >
                  <Mic size={18} />
                  <span>{isListening ? 'Listening to your voice...' : '🎙️ Speak Thought'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveNote(diaryNote)}
                  disabled={isSavingNote}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm transition cursor-pointer border border-[#E3DEC3] dark:border-[#2F3F36] bg-[#F7F4EC] dark:bg-[#16201B] text-[#29352F] dark:text-[#F7F4EC] hover:bg-[#EBE6D8] dark:hover:bg-[#28372E] shadow-2xs"
                >
                  <Save size={16} />
                  <span>{isSavingNote ? 'Saving...' : 'Save Note'}</span>
                </button>
              </div>

              {saveNoteSuccess && (
                <span className="text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] bg-[#E8EFEA] dark:bg-[#28372E] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Saved to database</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Caregiver Task & Living Affirmation */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#FFF8EC] dark:bg-[#2A2318] border-2 border-[#FDE6BA] dark:border-[#4D3B18] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D9A441] uppercase tracking-wider mb-2">
              <Heart size={16} className="fill-current" />
              <span>Caregiver Note</span>
            </div>
            <h4 className="text-lg font-bold text-[#29352F] dark:text-[#F7F4EC] mb-2">Message from Care Circle</h4>
            
            {caregiverPrompt ? (
              <>
                <p className="text-base text-[#29352F] dark:text-[#F7F4EC] italic font-medium leading-relaxed mb-4">
                  "{caregiverPrompt}"
                </p>
                <p className="text-xs text-[#6B7C73] dark:text-[#A3B3AA]">
                  Updated by your caregiver in your personalized plan.
                </p>
              </>
            ) : (
              <p className="text-sm text-[#6B7C73] dark:text-[#A3B3AA] leading-relaxed">
                No specific note has been left for today. You are surrounded with care and peace.
              </p>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-[#F1F6F3] dark:bg-[#1E2922] border-2 border-[#D4E4DC] dark:border-[#2F3F36] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6F8F7A] dark:text-[#8BAFA0] uppercase tracking-wider mb-2">
              <Sparkles size={16} />
              <span>Wellness Reminder</span>
            </div>
            <p className="text-base text-[#29352F] dark:text-[#F7F4EC] font-semibold leading-relaxed">
              Take each moment at your own peaceful pace. Every gentle activity supports comfort, memory, and joy.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 flex justify-center">
        <button
          onClick={() => {
            if (onContinue) onContinue()
            else router.push('/app/patient')
          }}
          className="w-full max-w-md py-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Return to Today Hub</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}
