'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePatient } from '@/lib/PatientContext'
import PatientActivitiesScreen from '@/components/PatientActivitiesScreen'

export default function PatientActivitiesPage() {
  const router = useRouter()
  const { sessions } = usePatient()

  return (
    <PatientActivitiesScreen 
      patientHistory={sessions}
      onStartActivity={(domain) => {
        if (domain) {
          router.push(`/app/patient/session?domain=${encodeURIComponent(domain)}`)
        } else {
          router.push('/app/patient/session')
        }
      }}
    />
  )
}
