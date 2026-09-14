'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePatient } from '@/lib/PatientContext'
import PatientMemoriesScreen from '@/components/PatientMemoriesScreen'

export default function PatientMemoriesPage() {
  const router = useRouter()
  const { patient, preferences } = usePatient()

  if (!patient) return null

  return (
    <PatientMemoriesScreen 
      patientName={patient.full_name ? patient.full_name.split(' ')[0] : 'Friend'}
      preferences={preferences}
      onContinue={() => router.push('/app/patient/routine')} 
    />
  )
}
