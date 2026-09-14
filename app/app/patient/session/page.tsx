'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePatient } from '@/lib/PatientContext'
import DailySessionScreen from '@/components/DailySessionScreen'

export default function PatientSessionPage() {
  const router = useRouter()
  const { patient, preferences, sessions, refreshData } = usePatient()

  if (!patient) return null

  return (
    <div className="relative animate-in fade-in duration-300 w-full h-full p-4 sm:p-8">
      <button 
        type="button"
        onClick={() => router.push('/app/patient')}
        className="mb-4 bg-[#F7F4EC] dark:bg-[#16201B] hover:bg-[#EBE6D8] dark:hover:bg-[#28372E] border border-[#E3DEC3] dark:border-[#33423A] px-4 py-2 rounded-full text-[#29352F] dark:text-[#F7F4EC] font-bold text-sm flex items-center gap-2 cursor-pointer shadow-xs"
      >
        &larr; Exit to Today Hub
      </button>

      <DailySessionScreen
        patientId={patient.id}
        patientName={patient.full_name}
        patientHistory={sessions}
        preferences={preferences}
        onSessionComplete={async () => {
          await refreshData()
          router.push('/app/patient/memories')
        }}
      />
    </div>
  )
}
