'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AutoLogin() {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Only execute if explicitly enabled via environment variable
    if (process.env.NEXT_PUBLIC_ENABLE_AUTO_LOGIN !== 'true') {
      return
    }

    async function performAutoLogin() {
      try {
        const hasCaregiver = localStorage.getItem('care_companion_caregiver')
        const hasPatient = localStorage.getItem('care_companion_patient')
        const isInitialized = localStorage.getItem('care_companion_auto_login_done')

        // Only run auto-seeding if neither is logged in and not previously initialized
        if (!hasCaregiver && !hasPatient && !isInitialized) {
          setLoading(true)

          // Fetch caregiver1
          let caregiverObj = null
          const { data: caregiver, error: cgError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('email', 'caregiver1@test.com')
            .eq('role', 'caregiver')
            .maybeSingle()

          if (cgError) console.warn('AutoLogin caregiver query:', cgError)

          if (caregiver) {
            caregiverObj = caregiver
          } else {
            // Create if missing
            const { data: newCaregiver } = await supabase
              .from('profiles')
              .upsert({
                email: 'caregiver1@test.com',
                full_name: 'Nathan CareGiver TestUser',
                role: 'caregiver'
              })
              .select('id, full_name, email')
              .single()
            caregiverObj = newCaregiver
          }

          // Fetch patient1
          let patientObj = null
          const { data: patient, error: ptError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('email', 'patient1@test.com')
            .eq('role', 'patient')
            .maybeSingle()

          if (ptError) console.warn('AutoLogin patient query:', ptError)

          if (patient) {
            patientObj = patient
          } else {
            // Create if missing
            const { data: newPatient } = await supabase
              .from('profiles')
              .upsert({
                email: 'patient1@test.com',
                full_name: 'NL Test Patient',
                role: 'patient'
              })
              .select('id, full_name, email')
              .single()
            patientObj = newPatient
          }

          if (caregiverObj) {
            localStorage.setItem('care_companion_caregiver', JSON.stringify(caregiverObj))
          }
          if (patientObj) {
            localStorage.setItem('care_companion_patient', JSON.stringify(patientObj))
            localStorage.setItem('care_companion_recent_patient_id', patientObj.id)
          }

          localStorage.setItem('care_companion_auto_login_done', 'true')

          // Link caregiver and patient if not already linked
          if (caregiverObj && patientObj) {
            await supabase
              .from('patient_caregiver_relations')
              .upsert({ caregiver_id: caregiverObj.id, patient_id: patientObj.id })
          }

          // Broadcast auth update so current pages update their state immediately
          window.dispatchEvent(new Event('care_companion_auth_change'))
        }
      } catch (err) {
        console.error('Auto-login failed:', err)
      } finally {
        setLoading(false)
      }
    }

    performAutoLogin()
  }, [])

  if (loading) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E40AF' }}>Setting up test environment...</p>
      </div>
    )
  }

  return null
}
