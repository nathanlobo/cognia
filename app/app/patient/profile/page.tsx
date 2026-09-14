'use client'

import React from 'react'
import { usePatient } from '@/lib/PatientContext'
import PatientProfileScreen from '@/components/PatientProfileScreen'

export default function PatientProfilePage() {
  const { patient, preferences, sessions, streak, caregiver, savePreferences, handleLogout } = usePatient()

  if (!patient) return null

  return (
    <PatientProfileScreen 
      patientName={patient.full_name}
      patientEmail={patient.email}
      patientId={patient.id}
      preferences={preferences}
      patientHistory={sessions}
      streak={streak}
      caregiver={caregiver}
      onSavePreferences={savePreferences}
      onLogout={handleLogout}
    />
  )
}
