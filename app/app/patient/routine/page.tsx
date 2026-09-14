'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePatient } from '@/lib/PatientContext'
import PatientDiaryScreen from '@/components/PatientDiaryScreen'

export default function PatientRoutinePage() {
  const router = useRouter()
  const { preferences, sessions, todayIso, savePreferences } = usePatient()

  return (
    <PatientDiaryScreen 
      preferences={preferences}
      patientHistory={sessions}
      todayIso={todayIso}
      onSavePreferences={savePreferences}
      onContinue={() => router.push('/app/patient')} 
    />
  )
}
