'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { speak, stopSpeech } from '@/lib/tts'
import { Volume2, VolumeX, Heart, Sparkles, Image as ImageIcon, ArrowRight, FolderHeart } from 'lucide-react'

interface MemoriesProps {
  patientName: string;
  preferences: any;
  onContinue?: () => void;
}

type MemoryCategory = 'family' | 'hobby' | 'regional'

export default function PatientMemoriesScreen({ patientName, preferences, onContinue }: MemoriesProps) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<MemoryCategory>('family')
  const [isSpeaking, setIsSpeaking] = useState(false)

  // 1. Family Memories (Live from Supabase preferences)
  const famName = preferences?.family_members?.[0]?.name || ''
  const famRel = preferences?.family_members?.[0]?.relation || 'family'
  const hasFamilyMemory = Boolean(
    preferences?.family_memory_title ||
    preferences?.family_memory_desc ||
    preferences?.family_memory_reminder ||
    preferences?.family_memory_members ||
    (preferences?.family_members && preferences.family_members.length > 0)
  )
  const familyTitle = preferences?.family_memory_title || (famName ? `Time with ${famName}` : '')
  const familyDesc = preferences?.family_memory_desc || ''
  const familyReminder = preferences?.family_memory_reminder || ''
  const familyTag = preferences?.family_memory_members ? 'Family Circle' : (famName ? `${famRel}: ${famName}` : 'Family')

  // 2. Hobby Memories (Live from Supabase preferences)
  const hobbyItem = preferences?.hobbies?.[0] || ''
  const hasHobbyMemory = Boolean(
    preferences?.hobby_memory_title ||
    preferences?.hobby_memory_desc ||
    preferences?.hobby_memory_reminder ||
    preferences?.hobby_memory_hobbies ||
    (preferences?.hobbies && preferences.hobbies.length > 0)
  )
  const hobbyTitle = preferences?.hobby_memory_title || (hobbyItem ? `Joy of ${hobbyItem}` : '')
  const hobbyDesc = preferences?.hobby_memory_desc || ''
  const hobbyReminder = preferences?.hobby_memory_reminder || ''
  const hobbyTag = preferences?.hobby_memory_hobbies || (hobbyItem ? `${hobbyItem}` : 'Hobbies')

  // 3. Regional / Cultural Memories (Live from Supabase preferences)
  const regionName = preferences?.cultural_region || preferences?.regional_memory_region || ''
  const hasRegionalMemory = Boolean(
    preferences?.regional_memory_title ||
    preferences?.regional_memory_desc ||
    preferences?.regional_memory_reminder ||
    preferences?.cultural_region ||
    preferences?.regional_memory_region
  )
  const regionalTitle = preferences?.regional_memory_title || (regionName ? `Memories of ${regionName}` : '')
  const regionalDesc = preferences?.regional_memory_desc || ''
  const regionalReminder = preferences?.regional_memory_reminder || ''
  const regionalTag = preferences?.regional_memory_region || (regionName ? `${regionName}` : 'Heritage')

  const memorySections = {
    family: {
      id: 'family',
      label: 'Family Memories',
      shortLabel: 'Family & Loved Ones',
      icon: '👨‍👩‍👧‍👦',
      hasData: hasFamilyMemory,
      emptyMessage: 'No family memories or stories added yet. Your caregiver can add cherished family moments in the Caregiver Portal.',
      coverImage: preferences?.family_memory_image || null,
      title: familyTitle,
      description: familyDesc,
      tag: familyTag,
      reminder: familyReminder,
      accentColor: '#D9A441',
      cardClass: 'bg-[#FFF8EC] dark:bg-[#2A2318] border-[#FDE6BA] dark:border-[#4D3B18]',
    },
    hobby: {
      id: 'hobby',
      label: 'Hobbies & Pastimes',
      shortLabel: 'Hobbies & Art',
      icon: '🎨',
      hasData: hasHobbyMemory,
      emptyMessage: 'No hobby memories added yet. Pastimes and creative crafts added by your caregiver will appear here.',
      coverImage: preferences?.hobby_memory_image || null,
      title: hobbyTitle,
      description: hobbyDesc,
      tag: hobbyTag,
      reminder: hobbyReminder,
      accentColor: '#6F8F7A',
      cardClass: 'bg-[#F1F6F3] dark:bg-[#1E2922] border-[#D4E4DC] dark:border-[#2F3F36]',
    },
    regional: {
      id: 'regional',
      label: 'Hometown & Heritage',
      shortLabel: 'Hometown Roots',
      icon: '🏞️',
      hasData: hasRegionalMemory,
      emptyMessage: 'No hometown or cultural memories configured yet. Your caregiver can personalize your cultural background in their portal.',
      coverImage: preferences?.regional_memory_image || null,
      title: regionalTitle,
      description: regionalDesc,
      tag: regionalTag,
      reminder: regionalReminder,
      accentColor: '#5B7A8C',
      cardClass: 'bg-[#EEF4F8] dark:bg-[#1C262C] border-[#D0E1EC] dark:border-[#2A3B45]',
    },
  }

  const current = memorySections[activeCategory]

  const handleSpeakMemory = () => {
    if (isSpeaking) {
      stopSpeech()
      setIsSpeaking(false)
      return
    }

    if (!current.hasData) return

    const parts = [current.title, current.description, current.reminder ? `Reminder: ${current.reminder}` : ''].filter(Boolean)
    const textToRead = parts.join('. ')
    if (!textToRead) return

    setIsSpeaking(true)
    speak(textToRead, () => setIsSpeaking(false))
  }

  const handleContinue = () => {
    if (onContinue) onContinue()
    else router.push('/app/patient/routine')
  }

  return (
    <div className="w-full flex flex-col h-full animate-in fade-in duration-300 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D9A441] uppercase tracking-wider mb-1">
            <Heart size={18} className="fill-current" />
            <span>Digital Scrapbook</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] dark:text-[#F7F4EC] tracking-tight">
            Memory Lane
          </h1>
          <p className="text-base sm:text-lg text-[#47554E] dark:text-[#A3B3AA] mt-1">
            Cherished stories, photos, and golden memories from your life.
          </p>
        </div>

        {current.hasData && (
          <button
            type="button"
            onClick={handleSpeakMemory}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition cursor-pointer border-2 shadow-xs shrink-0 ${
              isSpeaking
                ? 'bg-[#FFF8EC] dark:bg-[#2A2318] border-[#D9A441] text-[#D9A441] animate-pulse'
                : 'bg-[#FFFDF7] dark:bg-[#1E2922] border-[#EBE6D8] dark:border-[#28372E] text-[#29352F] dark:text-[#F7F4EC] hover:border-[#6F8F7A] dark:hover:border-[#8BAFA0]'
            }`}
          >
            {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} className="text-[#6F8F7A] dark:text-[#8BAFA0]" />}
            <span>{isSpeaking ? 'Stop Reading' : 'Read Story Aloud 🔊'}</span>
          </button>
        )}
      </div>

      {/* 3 Category Selector Tabs */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {(Object.keys(memorySections) as MemoryCategory[]).map((catKey) => {
          const sec = memorySections[catKey]
          const isActive = activeCategory === catKey
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => {
                stopSpeech()
                setIsSpeaking(false)
                setActiveCategory(catKey)
              }}
              className={`p-3 sm:p-4 rounded-2xl border-2 font-extrabold text-xs sm:text-sm md:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#6F8F7A] text-[#FFFDF7] border-[#577361] shadow-xs'
                  : 'bg-[#FFFDF7] dark:bg-[#1E2922] text-[#47554E] dark:text-[#D5DED8] border-[#EBE6D8] dark:border-[#28372E] hover:border-[#6F8F7A]'
              }`}
            >
              <span className="text-xl sm:text-2xl">{sec.icon}</span>
              <span className="hidden sm:inline">{sec.label}</span>
              <span className="sm:hidden">{sec.shortLabel.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>

      {/* Memory Content Display Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-xs mb-8 transition-all ${current.cardClass}`}>
        {current.hasData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <span
                style={{ backgroundColor: current.accentColor, color: '#FFFDF7' }}
                className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs"
              >
                {current.tag}
              </span>
            </div>

            {current.coverImage && (
              <div className="w-full max-h-72 rounded-2xl overflow-hidden border-2 border-white/60 dark:border-[#1E2922] shadow-sm">
                <img
                  src={current.coverImage}
                  alt={current.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#29352F] dark:text-[#F7F4EC] mb-3 tracking-tight">
                {current.title}
              </h2>
              {current.description && (
                <p className="text-base sm:text-lg text-[#29352F] dark:text-[#F7F4EC] leading-relaxed font-medium">
                  {current.description}
                </p>
              )}
            </div>

            {current.reminder && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#16201B]/70 border border-current/20 flex items-start gap-3">
                <Sparkles size={20} className="shrink-0 mt-0.5" style={{ color: current.accentColor }} />
                <div>
                  <h4 className="font-extrabold text-sm mb-0.5 text-[#29352F] dark:text-[#F7F4EC]">
                    A Loving Reminder
                  </h4>
                  <p className="text-xs sm:text-sm text-[#47554E] dark:text-[#A3B3AA]">
                    {current.reminder}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 rounded-2xl text-center flex flex-col items-center justify-center">
            <FolderHeart size={48} className="text-[#6B7C73] dark:text-[#A3B3AA] opacity-50 mb-3" />
            <h3 className="text-xl font-bold text-[#29352F] dark:text-[#F7F4EC] mb-2">
              {current.label} Not Set
            </h3>
            <p className="text-sm text-[#47554E] dark:text-[#A3B3AA] max-w-md mb-6 leading-relaxed">
              {current.emptyMessage}
            </p>
          </div>
        )}
      </div>

      {/* Navigation button */}
      <div className="mt-auto pt-4 flex justify-center">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full max-w-md py-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Daily Routine</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}
