'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchPatientHistory } from '@/lib/db'
import { getTTSEnabled, setTTSEnabled } from '@/lib/tts'

export interface PatientUser {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role?: string
}

export interface CaregiverInfo {
  id: string
  full_name: string
  email: string
  phone?: string
}

interface PatientContextType {
  patient: PatientUser | null
  profile: any | null
  preferences: any
  sessions: any[]
  streak: number
  longestStreak: number
  ttsOn: boolean
  setTtsOn: (val: boolean) => void
  caregiver: CaregiverInfo | null
  todayIso: string
  isLoading: boolean
  refreshData: () => Promise<void>
  savePreferences: (partialPrefs: any) => Promise<any>
  handleLogout: () => void
}

const PatientContext = createContext<PatientContextType | null>(null)

export function usePatient() {
  const context = useContext(PatientContext)
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider')
  }
  return context
}

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [patient, setPatient] = useState<PatientUser | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [preferences, setPreferences] = useState<any>({})
  const [sessions, setSessions] = useState<any[]>([])
  const [streak, setStreak] = useState<number>(0)
  const [longestStreak, setLongestStreak] = useState<number>(0)
  const [caregiver, setCaregiver] = useState<CaregiverInfo | null>(null)
  const [ttsOn, setTtsOnState] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Local date in YYYY-MM-DD
  const now = new Date()
  const todayIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0]

  useEffect(() => {
    setTtsOnState(getTTSEnabled())
    const handleTtsChange = () => setTtsOnState(getTTSEnabled())
    window.addEventListener('tts_toggle_changed', handleTtsChange)
    return () => window.removeEventListener('tts_toggle_changed', handleTtsChange)
  }, [])

  const handleSetTtsOn = useCallback((val: boolean) => {
    setTtsOnState(val)
    setTTSEnabled(val)
  }, [])

  const refreshData = useCallback(async () => {
    if (!patient?.id) return

    try {
      // 1. Fetch full live profile from Supabase
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patient.id)
        .single()

      if (!profErr && prof) {
        setProfile(prof)
        setPreferences(prof.preferences || {})
        setStreak(typeof prof.current_streak === 'number' ? prof.current_streak : 0)
        setLongestStreak(typeof prof.longest_streak === 'number' ? prof.longest_streak : 0)
        
        // Update local storage patient cache if name changed
        if (prof.full_name !== patient.full_name || prof.avatar_url !== patient.avatar_url) {
          const updatedPatient = { ...patient, full_name: prof.full_name, avatar_url: prof.avatar_url }
          setPatient(updatedPatient)
          localStorage.setItem('care_companion_patient', JSON.stringify(updatedPatient))
        }
      }

      // 2. Fetch history of game sessions
      const history = await fetchPatientHistory(patient.id)
      setSessions(history || [])

      // 3. Fetch linked caregiver
      const { data: relData, error: relErr } = await supabase
        .from('patient_caregiver_relations')
        .select('caregiver:profiles!patient_caregiver_relations_caregiver_id_fkey(id, full_name, email, preferences)')
        .eq('patient_id', patient.id)
        .order('last_switched_at', { ascending: false, nullsFirst: false })
        .limit(1)

      if (!relErr && relData && relData.length > 0 && relData[0].caregiver) {
        const cg: any = relData[0].caregiver
        setCaregiver({
          id: cg.id,
          full_name: cg.full_name || 'Care Partner',
          email: cg.email || '',
          phone: cg.preferences?.phone_number || cg.preferences?.phone || ''
        })
      } else {
        setCaregiver(null)
      }
    } catch (err) {
      console.error('[PatientContext] Error refreshing data:', err)
    }
  }, [patient])

  // Initial authentication & patient loading
  useEffect(() => {
    function loadPatient() {
      const saved = localStorage.getItem('care_companion_patient')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed && parsed.id) {
            setPatient(parsed)
            setIsLoading(false)
            return
          }
        } catch (e) {}
      }
      setIsLoading(false)
      router.replace('/app')
    }

    loadPatient()
    window.addEventListener('care_companion_auth_change', loadPatient)
    return () => window.removeEventListener('care_companion_auth_change', loadPatient)
  }, [router])

  // Trigger data load when patient is ready
  useEffect(() => {
    if (patient?.id) {
      refreshData()
    }
  }, [patient?.id, refreshData])

  // Listen to preference update events
  useEffect(() => {
    const handlePrefUpdate = () => {
      refreshData()
    }
    window.addEventListener('patient_preferences_updated', handlePrefUpdate)
    return () => window.removeEventListener('patient_preferences_updated', handlePrefUpdate)
  }, [refreshData])

  const savePreferences = useCallback(async (partialPrefs: any) => {
    if (!patient?.id) return null

    const updated = {
      ...(preferences || {}),
      ...partialPrefs,
    }

    setPreferences(updated)

    const { data, error } = await supabase
      .from('profiles')
      .update({ preferences: updated })
      .eq('id', patient.id)
      .select('preferences')
      .single()

    if (error) {
      console.error('[PatientContext] Failed to save preferences:', error)
      throw error
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('patient_preferences_updated'))
    }

    return data?.preferences || updated
  }, [patient?.id, preferences])

  const handleLogout = useCallback(() => {
    setPatient(null)
    setProfile(null)
    setPreferences({})
    setSessions([])
    setStreak(0)
    localStorage.removeItem('care_companion_patient')
    router.replace('/app')
  }, [router])

  return (
    <PatientContext.Provider
      value={{
        patient,
        profile,
        preferences,
        sessions,
        streak,
        longestStreak,
        ttsOn,
        setTtsOn: handleSetTtsOn,
        caregiver,
        todayIso,
        isLoading,
        refreshData,
        savePreferences,
        handleLogout,
      }}
    >
      {children}
    </PatientContext.Provider>
  )
}
