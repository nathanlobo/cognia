'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePatient } from '@/lib/PatientContext'
import PatientCheckInScreen from '@/components/PatientCheckInScreen'

export default function PatientCheckInPage() {
  const router = useRouter()
  const { preferences, todayIso, savePreferences } = usePatient()

  const savedMood = preferences?.today_mood?.[todayIso] || ''

  const handleContinue = async (selectedMood: string) => {
    try {
      const updatedMoodMap = {
        ...(preferences?.today_mood || {}),
        [todayIso]: selectedMood
      }
      await savePreferences({ today_mood: updatedMoodMap })
    } catch (e) {
      console.error('Failed to save mood check-in:', e)
    }
    router.push('/app/patient/session')
  }

  return (
    <PatientCheckInScreen
      initialMood={savedMood}
      onContinue={handleContinue}
      onBack={() => router.push('/app/patient')}
    />
  )
}
