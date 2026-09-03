'use client'

import React, { useState, useEffect } from 'react'
import LoginScreen from '@/components/LoginScreen'
import DailySessionScreen from '@/components/DailySessionScreen'
import { fetchPatientHistory, fetchPatientPreferences } from '@/lib/db'
import Header from '@/components/Header'
import { getTTSEnabled, setTTSEnabled } from '@/lib/tts'

import PatientWelcomeScreen from '@/components/PatientWelcomeScreen'
import PatientHomeOverviewScreen from '@/components/PatientHomeOverviewScreen'
import PatientCheckInScreen from '@/components/PatientCheckInScreen'
import PatientDiaryScreen from '@/components/PatientDiaryScreen'
import PatientMemoriesScreen from '@/components/PatientMemoriesScreen'
import PatientActivitiesScreen from '@/components/PatientActivitiesScreen'
import PatientProfileScreen from '@/components/PatientProfileScreen'

import { Sun, Heart, Sparkles, Calendar, User, Play, BookOpen, Volume2, VolumeX } from 'lucide-react'

type TabType = 'today' | 'memories' | 'activities' | 'routine' | 'profile'
type FlowScreen = TabType | 'session' | 'checkin' | 'welcome'

const tabConfig: { id: TabType; label: string; icon: any; emoji: string }[] = [
  { id: 'today', label: 'Today', icon: Sun, emoji: '☀️' },
  { id: 'memories', label: 'Memories', icon: Heart, emoji: '❤️' },
  { id: 'activities', label: 'Activities', icon: Sparkles, emoji: '🧠' },
  { id: 'routine', label: 'Routine', icon: Calendar, emoji: '📅' },
  { id: 'profile', label: 'Profile', icon: User, emoji: '👤' },
]

export default function PatientPage() {
  const [patient, setPatient] = useState<{ id: string; full_name: string; email: string } | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [preferences, setPreferences] = useState<any>(null)
  const [ttsOn, setTtsOn] = useState(true)
  
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [currentFlow, setCurrentFlow] = useState<FlowScreen>('today')
  const [currentMood, setCurrentMood] = useState<string>('')

  useEffect(() => {
    setTtsOn(getTTSEnabled())
    const handleTtsChange = () => setTtsOn(getTTSEnabled())
    window.addEventListener('tts_toggle_changed', handleTtsChange)
    return () => window.removeEventListener('tts_toggle_changed', handleTtsChange)
  }, [])

  useEffect(() => {
    function loadPatient() {
      const saved = localStorage.getItem('care_companion_patient')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPatient(parsed)
        } catch (e) {}
      }
    }
    loadPatient()
    window.addEventListener('care_companion_auth_change', loadPatient)
    return () => window.removeEventListener('care_companion_auth_change', loadPatient)
  }, [])

  useEffect(() => {
    function refreshData() {
      if (patient) {
        fetchPatientHistory(patient.id).then((history) => {
          setSessions(history as any)
        })
        fetchPatientPreferences(patient.id).then((prefs) => {
          setPreferences(prefs)
        })
      }
    }
    refreshData()
    window.addEventListener('patient_preferences_updated', refreshData)
    return () => window.removeEventListener('patient_preferences_updated', refreshData)
  }, [patient])

  function handleLogin(profile: { id: string; full_name: string; email: string }) {
    setPatient(profile)
    localStorage.setItem('care_companion_patient', JSON.stringify(profile))
  }

  function handleLogout() {
    setPatient(null)
    setSessions([])
    setCurrentFlow('today')
    setActiveTab('today')
    setCurrentMood('')
    localStorage.removeItem('care_companion_patient')
  }

  function handleTabSelect(tab: TabType) {
    setActiveTab(tab)
    setCurrentFlow(tab)
  }

  if (!patient) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex-1 flex flex-col">
        <LoginScreen role="patient" onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#29352F] flex flex-col transition-colors duration-300 pb-20 md:pb-0">
      <Header 
        userName={patient.full_name}
        userEmail={patient.email}
        roleTitle="Patient Companion"
        onLogout={handleLogout}
        showSwitchToCaregiver={true}
      />
      
      <main className="w-full max-w-7xl mx-auto flex-1 flex justify-center py-4 md:py-6 px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl bg-[#FFFDF7] rounded-[2.5rem] shadow-xs border-2 border-[#EBE6D8] overflow-hidden flex flex-col" style={{ minHeight: '82vh' }}>
          
          {/* Top Desktop Navigation Tabs Bar with Voice Dictation */}
          {currentFlow !== 'session' && (
            <nav aria-label="Main Navigation" className="hidden md:flex items-center justify-between px-6 lg:px-10 py-4 border-b-2 border-[#EBE6D8] bg-[#FFFDF7]/95 backdrop-blur-md sticky top-0 z-20 gap-4">
              <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto no-scrollbar">
                {tabConfig.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id && currentFlow === tab.id
                  return (
                    <button 
                      key={tab.id}
                      onClick={() => handleTabSelect(tab.id)} 
                      className={`flex items-center gap-2.5 py-2.5 px-5 rounded-full transition-all text-base font-extrabold cursor-pointer shrink-0 ${
                        isActive 
                          ? 'text-[#FFFDF7] bg-[#6F8F7A] shadow-xs border-2 border-[#577361]' 
                          : 'text-[#47554E] hover:text-[#29352F] hover:bg-[#F7F4EC] border-2 border-transparent'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* TTS Dictation Quick Toggle */}
              <button
                type="button"
                onClick={() => setTTSEnabled(!ttsOn)}
                title={ttsOn ? "Voice Dictation is ON — Click to Mute" : "Voice Dictation is MUTED — Click to Unmute"}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer border shadow-xs shrink-0 ${
                  ttsOn 
                    ? 'bg-[#E8EFEA] text-[#6F8F7A] border-[#6F8F7A]/40 hover:bg-[#D4E4DC]' 
                    : 'bg-[#F7F4EC] text-[#6B7C73] border-[#E3DEC3] hover:bg-[#EBE6D8]'
                }`}
              >
                {ttsOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{ttsOn ? 'Voice: ON' : 'Voice: Muted'}</span>
              </button>
            </nav>
          )}

          {/* Main Content Area */}
          <div className={`flex-1 overflow-y-auto scroll-smooth flex flex-col p-6 sm:p-8 md:p-10 lg:p-12 ${currentFlow === 'session' ? 'p-0 sm:p-0 md:p-0 lg:p-0' : ''}`}>
            
            {/* 1. Today Tab: Overview / Daily Hub */}
            {currentFlow === 'today' && (
              <PatientHomeOverviewScreen 
                patientName={patient.full_name.split(' ')[0]}
                preferences={preferences}
                patientHistory={sessions}
                selectedMood={currentMood}
                onCheckIn={() => setCurrentFlow('checkin')}
                onDiary={() => handleTabSelect('routine')}
                onMemory={() => handleTabSelect('memories')}
                onActivity={() => setCurrentFlow('session')}
                onPlanner={() => handleTabSelect('routine')}
              />
            )}

            {/* 2. Check-In Sub-flow */}
            {currentFlow === 'checkin' && (
              <PatientCheckInScreen 
                initialMood={currentMood}
                onContinue={(mood) => {
                  setCurrentMood(mood)
                  setCurrentFlow('session')
                }} 
              />
            )}

            {/* 3. Interactive 6-Step Daily Flow Session */}
            {currentFlow === 'session' && preferences !== null && (
              <div className="relative animate-in fade-in duration-300 w-full h-full p-4 sm:p-8">
                <button 
                  onClick={() => setCurrentFlow('today')}
                  className="mb-4 bg-[#F7F4EC] hover:bg-[#EBE6D8] border border-[#E3DEC3] px-4 py-2 rounded-full text-[#29352F] font-bold text-sm flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  &larr; Exit to Home Hub
                </button>
                <DailySessionScreen
                  patientId={patient.id}
                  patientName={patient.full_name}
                  patientHistory={sessions}
                  preferences={preferences}
                  onSessionComplete={() => {
                    setCurrentFlow('memories')
                    setActiveTab('memories')
                  }}
                />
              </div>
            )}

            {/* 4. Memories Tab */}
            {currentFlow === 'memories' && (
              <PatientMemoriesScreen 
                patientName={patient.full_name.split(' ')[0]}
                preferences={preferences}
                onContinue={() => handleTabSelect('routine')} 
              />
            )}

            {/* 5. Activities Tab */}
            {currentFlow === 'activities' && (
              <PatientActivitiesScreen 
                onStartActivity={() => setCurrentFlow('session')}
              />
            )}

            {/* 6. Routine & Daily Diary Tab */}
            {currentFlow === 'routine' && (
              <PatientDiaryScreen 
                preferences={preferences}
                patientHistory={sessions}
                onContinue={() => handleTabSelect('today')} 
              />
            )}

            {/* 7. Profile Tab */}
            {currentFlow === 'profile' && (
              <PatientProfileScreen 
                patientName={patient.full_name}
                patientEmail={patient.email}
                patientId={patient.id}
                preferences={preferences}
                patientHistory={sessions}
                onLogout={handleLogout}
              />
            )}
          </div>

        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom on small screens) */}
      <nav 
        aria-label="Mobile Bottom Navigation" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-t-2 border-[#EBE6D8] px-3 py-2 flex items-center justify-around shadow-lg"
      >
        {tabConfig.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id && currentFlow === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSelect(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[52px] px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#6F8F7A] font-extrabold bg-[#E8EFEA]'
                  : 'text-[#6B7C73] font-bold hover:text-[#29352F]'
              }`}
            >
              <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
              <span className="text-[11px] mt-0.5">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
