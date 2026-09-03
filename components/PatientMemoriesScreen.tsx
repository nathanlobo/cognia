'use client'

import React, { useState } from 'react'
import { speak, stopSpeech } from '@/lib/tts'
import { Volume2, VolumeX, Heart, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react'

interface MemoriesProps {
  patientName: string;
  preferences: any;
  onContinue: () => void;
}

type MemoryCategory = 'family' | 'hobby' | 'regional'

export default function PatientMemoriesScreen({ patientName, preferences, onContinue }: MemoriesProps) {
  const [activeCategory, setActiveCategory] = useState<MemoryCategory>('family')
  const [isSpeaking, setIsSpeaking] = useState(false)

  // 1. Family Memories
  const famName = preferences?.family_members?.[0]?.name || ''
  const famRel = preferences?.family_members?.[0]?.relation || 'family'
  const familyTitle = preferences?.family_memory_title || (famName ? `Time with ${famName}` : 'Sunday Family Moments')
  const familyDesc = preferences?.family_memory_desc || preferences?.memories?.[0]?.description || 
    (famName 
      ? `Cherishing sweet conversations, laughter, and fond moments shared together with your loving ${famRel}, ${famName}.` 
      : 'Sitting together at the table, sharing warm home-cooked meals, and feeling the warmth of family love.')
  const familyReminder = preferences?.family_memory_reminder || 
    (famName 
      ? `Your ${famRel}, ${famName}, and loved ones hold you close in their hearts every single day.` 
      : 'Your loving family is always cheering for you and surrounding you with love.')
  const familyTag = preferences?.family_memory_members ? 'Family Circle' : (famName ? `${famRel}: ${famName}` : 'Family Hearth')

  // 2. Hobby Memories
  const hobbyItem = preferences?.hobbies?.[0] || 'Gardening'
  const hobbyTitle = preferences?.hobby_memory_title || `Joy of ${hobbyItem}`
  const hobbyDesc = preferences?.hobby_memory_desc || 
    `Enjoying peaceful hours practicing ${hobbyItem.toLowerCase()}, working with your hands, and finding calm in creative crafts.`
  const hobbyReminder = preferences?.hobby_memory_reminder || 
    `Engaging in ${hobbyItem.toLowerCase()} and pastimes has always brought peace, focus, and joyful contentment.`
  const hobbyTag = preferences?.hobby_memory_hobbies || `${hobbyItem} & Crafts`

  // 3. Regional / Cultural Memories
  const regionName = preferences?.cultural_region || preferences?.regional_memory_region || 'Your Homeland'
  const regionalTitle = preferences?.regional_memory_title || `Memories of ${regionName}`
  const regionalDesc = preferences?.regional_memory_desc || 
    `The gentle morning air, the aroma of fresh regional tea, and the cherished songs and festive traditions of ${regionName}.`
  const regionalReminder = preferences?.regional_memory_reminder || 
    `The timeless culture, beloved flavors, and golden memories of ${regionName} remain alive in your heart.`
  const regionalTag = preferences?.regional_memory_region || `${regionName} Heritage`

  const memorySections = {
    family: {
      id: 'family',
      label: 'Family Memories',
      shortLabel: 'Family & Loved Ones',
      icon: '👨‍👩‍👧‍👦',
      coverImage: preferences?.family_memory_image || '/images/memories/family_cover.jpg',
      title: familyTitle,
      description: familyDesc,
      tag: familyTag,
      reminder: familyReminder,
      accentColor: '#D9A441',
      bgCard: '#FFF8EC',
      borderCard: '#FDE6BA',
    },
    hobby: {
      id: 'hobby',
      label: 'Hobbies & Crafts',
      shortLabel: 'Hobbies & Art',
      icon: '🎨',
      coverImage: preferences?.hobby_memory_image || '/images/memories/hobby_cover.jpg',
      title: hobbyTitle,
      description: hobbyDesc,
      tag: hobbyTag,
      reminder: hobbyReminder,
      accentColor: '#6F8F7A',
      bgCard: '#F1F6F3',
      borderCard: '#D4E4DC',
    },
    regional: {
      id: 'regional',
      label: 'Hometown & Heritage',
      shortLabel: 'Hometown Roots',
      icon: '🏞️',
      coverImage: preferences?.regional_memory_image || '/images/memories/regional_cover.jpg',
      title: regionalTitle,
      description: regionalDesc,
      tag: regionalTag,
      reminder: regionalReminder,
      accentColor: '#5B7A8C',
      bgCard: '#EEF4F8',
      borderCard: '#D0E1EC',
    },
  }

  const current = memorySections[activeCategory]

  const handleSpeakMemory = () => {
    if (isSpeaking) {
      stopSpeech()
      setIsSpeaking(false)
      return
    }
    const textToRead = `${current.title}. ${current.description}. Reminder: ${current.reminder}`
    setIsSpeaking(true)
    speak(textToRead, () => setIsSpeaking(false))
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#29352F] tracking-tight">
            Memory Lane
          </h1>
          <p className="text-base sm:text-lg text-[#47554E] mt-1">
            Cherished stories, photos, and golden memories from your life.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSpeakMemory}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition cursor-pointer border-2 shadow-xs shrink-0 ${
            isSpeaking
              ? 'bg-[#FFF8EC] border-[#D9A441] text-[#D9A441] animate-pulse'
              : 'bg-[#FFFDF7] border-[#EBE6D8] text-[#29352F] hover:border-[#6F8F7A]'
          }`}
        >
          {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} className="text-[#6F8F7A]" />}
          <span>{isSpeaking ? 'Stop Reading' : 'Read Story Aloud 🔊'}</span>
        </button>
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
              className={`py-3.5 px-3 rounded-2xl font-bold text-xs sm:text-sm md:text-base transition-all flex items-center justify-center gap-2 border-2 cursor-pointer shadow-xs ${
                isActive
                  ? 'bg-[#FFFDF7] text-[#29352F] border-[#6F8F7A] shadow-md ring-2 ring-[#6F8F7A]/20'
                  : 'bg-[#F7F4EC] text-[#6B7C73] border-transparent hover:bg-white'
              }`}
            >
              <span className="text-xl sm:text-2xl">{sec.icon}</span>
              <span className="truncate">{sec.shortLabel}</span>
            </button>
          )
        })}
      </div>

      {/* Main Memory Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" key={activeCategory}>
        {/* Main Photo Story Card */}
        <div className="lg:col-span-2 bg-[#FFFDF7] border-2 border-[#EBE6D8] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            {/* Photo Cover */}
            <div className="h-56 sm:h-64 md:h-72 relative overflow-hidden flex items-end justify-between p-6 bg-[#29352F]">
              <img 
                src={current.coverImage} 
                alt={current.title} 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex items-center gap-2">
                <span className="text-3xl">{current.icon}</span>
                <span className="bg-[#FFFDF7] text-[#29352F] font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-md">
                  {current.label}
                </span>
              </div>
              <span className="relative z-10 bg-black/60 backdrop-blur-md text-[#FFFDF7] text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
                {current.tag}
              </span>
            </div>

            <div className="p-6 md:p-8">
              <h3 className="font-extrabold text-2xl md:text-3xl text-[#29352F] mb-3">
                {current.title}
              </h3>
              <p className="text-base sm:text-lg text-[#47554E] leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-6 text-xs font-semibold text-[#6B7C73]">
            Memory Collection &bull; {current.label}
          </div>
        </div>

        {/* Gentle Heartfelt Reminder Card */}
        <div 
          style={{ backgroundColor: current.bgCard, borderColor: current.borderCard }}
          className="rounded-3xl p-6 md:p-8 border-2 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌟</span>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: current.accentColor }}>
                Heartfelt Reminder
              </p>
            </div>
            <h4 className="font-extrabold text-xl sm:text-2xl text-[#29352F] leading-snug mb-3">
              Surrounded by Love
            </h4>
            <p className="text-base sm:text-lg font-medium text-[#47554E] leading-relaxed">
              {current.reminder}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-black/10 text-xs font-medium text-[#6B7C73]">
            💌 Personalized memory scrapbook curated with your family.
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-auto pt-4 flex justify-center">
        <button
          onClick={() => {
            if (isSpeaking) stopSpeech()
            onContinue()
          }}
          className="w-full max-w-md py-4 rounded-2xl bg-[#6F8F7A] hover:bg-[#577361] text-[#FFFDF7] font-extrabold text-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Routine</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}
