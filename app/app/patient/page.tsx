'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePatient } from '@/lib/PatientContext'
import PatientHomeOverviewScreen from '@/components/PatientHomeOverviewScreen'

export default function PatientTodayPage() {
  const router = useRouter()
  const { patient, preferences, sessions, streak, todayIso } = usePatient()

  if (!patient) return null

  return (
    <PatientHomeOverviewScreen 
      patientName={patient.full_name ? patient.full_name.split(' ')[0] : 'Friend'}
      preferences={preferences}
      patientHistory={sessions}
      streak={streak}
      todayIso={todayIso}
      onCheckIn={() => router.push('/app/patient/checkin')}
      onActivity={() => router.push('/app/patient/session')}
      onDiary={() => router.push('/app/patient/routine')}
      onMemory={() => router.push('/app/patient/memories')}
      onPlanner={() => router.push('/app/patient/routine')}
    />
  )
}
