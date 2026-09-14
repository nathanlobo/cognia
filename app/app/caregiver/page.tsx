'use client'

import { useState, useEffect, useCallback } from 'react'
import CaregiverDashboard from '@/components/CaregiverDashboard'
import ConsentModal from '@/components/ConsentModal'
import PatientProfileForm from '@/components/PatientProfileForm'
import EditProfileModal from '@/components/EditProfileModal'
import DeletePatientModal from '@/components/DeletePatientModal'
import { supabase } from '@/lib/supabase'
import { fetchPatientHistory } from '@/lib/db'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Trash2, Ticket, Copy, Check } from 'lucide-react'

export default function CaregiverPage() {
  const router = useRouter()
  const [caregiver, setCaregiver] = useState<{ id: string; full_name: string; email: string; role?: string; avatar_url?: string } | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  const [patients, setPatients] = useState<any[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'stats'>('info')

  // Add Patient Form State
  const [isAdding, setIsAdding] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addName, setAddName] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [isSelfPatient, setIsSelfPatient] = useState(false)
  const [addSuccessMessage, setAddSuccessMessage] = useState('')
  const [addError, setAddError] = useState('')
  const [isAddingLoading, setIsAddingLoading] = useState(false)
  
  // Profile Editing State
  const [editingProfile, setEditingProfile] = useState<{ id: string; full_name: string; email: string; role: string } | null>(null)
  
  // Patient Deletion State
  const [deletingPatient, setDeletingPatient] = useState<{ id: string; full_name: string; email: string } | null>(null)

  // Patient Invite State
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null)
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false)
  const [hasCopiedInvite, setHasCopiedInvite] = useState(false)
  const [inviteError, setInviteError] = useState('')

  // Caregiver Active Invites State
  const [caregiverInvites, setCaregiverInvites] = useState<any[]>([])
  const [isLoadingInvites, setIsLoadingInvites] = useState(false)
  const [deletingInviteCode, setDeletingInviteCode] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const fetchCaregiverInvites = useCallback(async () => {
    if (!caregiver?.id) return
    setIsLoadingInvites(true)
    try {
      const res = await fetch(`/api/invites?caregiverId=${caregiver.id}`)
      const data = await res.json()
      if (data.invites) {
        setCaregiverInvites(data.invites)
      }
    } catch (e) {
      console.error('Error fetching caregiver invites:', e)
    } finally {
      setIsLoadingInvites(false)
    }
  }, [caregiver])

  async function handleDeleteInvite(code: string) {
    if (!caregiver?.id) return
    setDeletingInviteCode(code)
    try {
      const res = await fetch(`/api/invites?code=${encodeURIComponent(code)}&caregiverId=${caregiver.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setCaregiverInvites(prev => prev.filter(inv => inv.code.toUpperCase() !== code.toUpperCase()))
      }
    } catch (e) {
      console.error('Error deleting invite code:', e)
    } finally {
      setDeletingInviteCode(null)
    }
  }

  async function handleGeneratePatientInvite() {
    if (!caregiver) return
    setIsGeneratingInvite(true)
    setInviteError('')
    setHasCopiedInvite(false)
    try {
      const res = await fetch('/api/invites/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId: caregiver.id,
          targetRole: 'patient',
          maxUses: 1
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error || 'Failed to generate invite code.')
      } else {
        setGeneratedInvite(data.invite?.code || data.code)
        fetchCaregiverInvites()
      }
    } catch (err: any) {
      console.error(err)
      setInviteError('Connection error while generating invite code.')
    } finally {
      setIsGeneratingInvite(false)
    }
  }

  function handlePatientDeleted(deletedId: string) {
    setPatients(prev => prev.filter(p => p.id !== deletedId))
    if (selectedPatientId === deletedId) {
      setSelectedPatientId(null)
    }
    setDeletingPatient(null)
  }
  
  function handleProfileSave(updated: any) {
    if (updated.id === caregiver?.id) {
      setCaregiver(updated)
      localStorage.setItem('care_companion_caregiver', JSON.stringify(updated))
    } else {
      // Update patient list
      setPatients(prev => prev.map(p => p.id === updated.id ? updated : p))
      // Also update localStorage if this is the currently active patient
      const savedPatient = localStorage.getItem('care_companion_patient')
      if (savedPatient) {
        try {
          const parsed = JSON.parse(savedPatient)
          if (parsed.id === updated.id) {
            localStorage.setItem('care_companion_patient', JSON.stringify(updated))
          }
        } catch (e) {}
      }
    }
    setEditingProfile(null)
  }

  // Consent State
  const [consentSigned, setConsentSigned] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)

  useEffect(() => {
    function loadCaregiver() {
      const saved = localStorage.getItem('care_companion_caregiver')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed && parsed.id) {
            setCaregiver(parsed)
            setIsCheckingAuth(false)
            return
          }
        } catch (e) {}
      }
      setIsCheckingAuth(false)
      router.replace('/app')
    }
    loadCaregiver()
    window.addEventListener('care_companion_auth_change', loadCaregiver)

    const consent = localStorage.getItem('care_companion_consent')
    if (consent === 'true') {
      setConsentSigned(true)
    }

    return () => window.removeEventListener('care_companion_auth_change', loadCaregiver)
  }, [router])

  const fetchPatients = useCallback(async () => {
    if (!caregiver) return
    setIsLoadingPatients(true)
    try {
      const { data, error } = await supabase
        .from('patient_caregiver_relations')
        .select('last_switched_at, patient:profiles!patient_caregiver_relations_patient_id_fkey(id, full_name, email)')
        .eq('caregiver_id', caregiver.id)
        .order('last_switched_at', { ascending: false, nullsFirst: false })

      if (error) {
        console.error(error)
        setPatients([])
        return
      }

      if (data) {
        let recentLocalId = null;
        if (typeof window !== 'undefined') {
          recentLocalId = localStorage.getItem('care_companion_recent_patient_id');
        }

        const mapped = data.map((d: any) => d.patient).filter(Boolean)
        
        mapped.sort((a: any, b: any) => {
          if (a.id === recentLocalId) return -1;
          if (b.id === recentLocalId) return 1;
          return 0; // Keep the DB sorting order (last_switched_at desc) for the rest
        })

        setPatients(mapped)
      } else {
        setPatients([])
      }
    } catch (e) {
      console.error(e)
      setPatients([])
    } finally {
      setIsLoadingPatients(false)
    }
  }, [caregiver])

  useEffect(() => {
    if (caregiver && !selectedPatientId) {
      fetchPatients()
      fetchCaregiverInvites()
    }
  }, [caregiver, selectedPatientId, fetchPatients, fetchCaregiverInvites])

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientHistory(selectedPatientId).then((history) => {
        setSessions(history as any)
      })
    }
  }, [selectedPatientId])

  function handleLogout() {
    setCaregiver(null)
    setSelectedPatientId(null)
    localStorage.removeItem('care_companion_caregiver')
    router.replace('/app')
  }

  async function handleSwitchToPatient(patient: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('care_companion_recent_patient_id', patient.id)
      localStorage.setItem('care_companion_patient', JSON.stringify(patient))
    }

    if (caregiver) {
      await supabase
        .from('patient_caregiver_relations')
        .update({ last_switched_at: new Date().toISOString() })
        .eq('caregiver_id', caregiver.id)
        .eq('patient_id', patient.id)
    }

    router.push('/app/patient')
  }

  function handleAddPatientClick() {
    setSelectedPatientId(null)
    if (!consentSigned) {
      setShowConsentModal(true)
    } else {
      setIsAdding(true)
    }
  }

  function handleConsentAccept() {
    localStorage.setItem('care_companion_consent', 'true')
    setConsentSigned(true)
    setShowConsentModal(false)
    setIsAdding(true)
  }

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAddSuccessMessage('')
    if (!caregiver) return

    const targetEmail = isSelfPatient ? caregiver.email : addEmail.trim()
    const targetName = isSelfPatient ? caregiver.full_name : addName.trim()

    if (!targetEmail) {
      setAddError('Please provide an email.')
      return
    }
    if (!targetName && !isSelfPatient) {
      setAddError('Please provide the patient\'s full name.')
      return
    }

    if (!isSelfPatient) {
      if (!addPassword) {
        setAddError('Please provide a password for the patient.')
        return
      }
      if (addPassword.length < 8) {
        setAddError('Password must be at least 8 characters long.')
        return
      }
    }

    setIsAddingLoading(true)
    const cleanEmail = targetEmail.toLowerCase()

    const isSelf = isSelfPatient || cleanEmail === caregiver.email.toLowerCase()

    try {
      if (isSelf) {
        // Link self without creating a duplicate row
        const currentRole = caregiver.role || 'caregiver'
        const combinedRole = currentRole.includes('patient') ? currentRole : 'caregiver, patient'

        // Update caregiver's own profile role to indicate both caregiver & patient
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: combinedRole })
          .eq('id', caregiver.id)

        if (updateError) {
          console.warn('Combined role update:', updateError.message)
        } else {
          const updatedCaregiver = { ...caregiver, role: combinedRole }
          setCaregiver(updatedCaregiver)
          localStorage.setItem('care_companion_caregiver', JSON.stringify(updatedCaregiver))
        }

        // Link caregiver's ID as patient_id in patient_caregiver_relations
        const { error: linkError } = await supabase
          .from('patient_caregiver_relations')
          .upsert({ patient_id: caregiver.id, caregiver_id: caregiver.id })

        if (linkError) throw linkError

        setIsAdding(false)
        setAddEmail('')
        setAddName('')
        setAddPassword('')
        setIsSelfPatient(false)
        fetchPatients()
      } else {
        // Create patient via API with password
        const res = await fetch('/api/caregiver/create-patient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caregiverId: caregiver.id,
            patientName: targetName,
            patientEmail: cleanEmail,
            password: addPassword
          })
        })

        const data = await res.json()
        if (!res.ok) {
          setAddError(data.error || 'Failed to create patient account.')
        } else {
          setAddSuccessMessage(`Patient account created! They can now log in using ${cleanEmail}.`)
          setTimeout(() => {
            setIsAdding(false)
            setAddEmail('')
            setAddName('')
            setAddPassword('')
            setAddSuccessMessage('')
            fetchPatients()
          }, 1500)
        }
      }
    } catch (err: any) {
      console.error(err)
      setAddError(err.message || 'Failed to add patient.')
    } finally {
      setIsAddingLoading(false)
    }
  }

  if (isCheckingAuth || !caregiver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F3F7F4] to-[#EAEFEA] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-[#6F8F7A]/20 dark:border-[#384E3F] border-t-[#6F8F7A] dark:border-t-[#8BAFA0] rounded-full animate-spin mb-4" />
        <p className="text-[#577361] dark:text-[#8BAFA0] font-medium text-sm">Redirecting to sign in...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FAF8F2] via-[#F4F8F5] to-[#ECF2EE] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] text-[#29352F] dark:text-[#F7F4EC] transition-colors">
      {showConsentModal && (
        <ConsentModal 
          onAccept={handleConsentAccept} 
          onDecline={() => setShowConsentModal(false)} 
        />
      )}
      {editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
          onSave={handleProfileSave}
        />
      )}
      {deletingPatient && (
        <DeletePatientModal
          patient={deletingPatient}
          caregiverId={caregiver.id}
          onClose={() => setDeletingPatient(null)}
          onDeleted={handlePatientDeleted}
        />
      )}

      {/* Generated Patient Invite Modal */}
      {generatedInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#FFFDF7] via-[#FAFDFB] to-[#F5F8F5] dark:from-[#1E2922] dark:via-[#1A251F] dark:to-[#16201A] border-2 border-[#E8EFEA] dark:border-[#2F3F36] rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6F8F7A]/20 to-[#526F5D]/20 text-[#526F5D] dark:text-[#8BAFA0] flex items-center justify-center mx-auto mb-5">
              <Ticket size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-2 text-[#29352F] dark:text-[#F7F4EC]">
              Patient Invitation Link
            </h3>
            <p className="text-[#6B7C73] dark:text-[#A3B3AA] text-sm mb-6 leading-relaxed">
              Share this dedicated link with your patient. When they open it, they can register with their email and password, and they will automatically connect to your dashboard.
            </p>

            {/* Direct Link Copy Card */}
            <div className="bg-[#E8EFEA]/40 dark:bg-[#16201B]/80 border border-[#6F8F7A]/25 dark:border-[#33423A] rounded-2xl p-4 mb-4 text-left">
              <span className="text-xs font-bold text-[#577361] dark:text-[#8BAFA0] block mb-2 tracking-wide uppercase">
                Direct Registration Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/app/invite/${generatedInvite}` : `/app/invite/${generatedInvite}`}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] dark:border-[#33423A] text-xs font-mono text-[#29352F] dark:text-[#F7F4EC] bg-white dark:bg-[#1E2922]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/app/invite/${generatedInvite}`
                    navigator.clipboard.writeText(url)
                    setHasCopiedInvite(true)
                    setTimeout(() => setHasCopiedInvite(false), 2500)
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    hasCopiedInvite
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                      : 'bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855]'
                  }`}
                >
                  {hasCopiedInvite ? <Check size={14} /> : <Copy size={14} />}
                  {hasCopiedInvite ? 'Copied Link!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="bg-[#E8EFEA]/60 dark:bg-[#1A251F] rounded-xl px-4 py-3 flex items-center justify-between mb-6 text-sm text-[#42594B] dark:text-[#A5C4B7] border border-[#6F8F7A]/20 dark:border-[#2F3F36]">
              <span>Invite Code: <strong className="font-mono text-[#29352F] dark:text-[#F7F4EC] text-base ml-1">{generatedInvite}</strong></span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedInvite)
                  setHasCopiedInvite(true)
                  setTimeout(() => setHasCopiedInvite(false), 2000)
                }}
                className="text-xs font-bold text-[#577361] dark:text-[#8BAFA0] hover:underline cursor-pointer bg-transparent border-0"
              >
                Copy Code Only
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setGeneratedInvite(null)
                setInviteError('')
              }}
              className="w-full py-3 bg-gradient-to-b from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#17211B] text-[#29352F] dark:text-[#F7F4EC] border-2 border-[#E8EFEA] dark:border-[#33423A] hover:border-[#6F8F7A]/40 rounded-xl font-bold text-sm cursor-pointer transition-all shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <Header 
        userName={caregiver.full_name}
        userEmail={caregiver.email}
        avatarUrl={caregiver.avatar_url}
        roleTitle="Caregiver Portal"
        onLogout={handleLogout}
        showSwitchToPatient={true}
        patients={patients}
        isLoadingPatients={isLoadingPatients}
        onSwitchToPatient={handleSwitchToPatient}
        onOpenAddPatient={handleAddPatientClick}
      />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex-1 flex flex-col">
      {!selectedPatientId ? (
        <div className="p-4 w-full">
          <div className="flex justify-between items-center mb-6 w-full flex-wrap gap-3">
            <h1 className="text-2xl font-extrabold m-0 text-[#29352F] dark:text-[#F7F4EC]">Your Patients</h1>
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={handleGeneratePatientInvite}
                disabled={isGeneratingInvite}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#E8EFEA] via-[#E2ECE5] to-[#D8E5DC] dark:from-[#1E2922] dark:via-[#24332A] dark:to-[#1E2922] text-[#42594B] dark:text-[#A5C4B7] border border-[#6F8F7A]/30 dark:border-[#33423A] hover:border-[#6F8F7A]/50 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-60 shadow-xs"
              >
                <Ticket size={16} />
                <span>{isGeneratingInvite ? 'Generating...' : 'Invite Patient Code'}</span>
              </button>
              <button 
                onClick={handleAddPatientClick}
                className="px-4 py-2 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-xs"
              >
                {isAdding ? 'Cancel' : '+ Add Patient'}
              </button>
            </div>
          </div>

          {inviteError && (
            <div className="p-3.5 mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 font-semibold m-0 text-sm">{inviteError}</p>
            </div>
          )}

          {isAdding && (
            <div className="bg-gradient-to-br from-[#FFFDF7] via-[#FAFDFB] to-[#F5F8F5] dark:from-[#1E2922] dark:via-[#1A251F] dark:to-[#16201A] border-2 border-[#E8EFEA] dark:border-[#2F3F36] rounded-2xl p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-[#29352F] dark:text-[#F7F4EC]">Add or Link Patient</h2>
              <form onSubmit={handleAddPatient} className="flex flex-col gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-[#47554E] dark:text-[#D5DED8]">
                  <input 
                    type="checkbox" 
                    checked={isSelfPatient} 
                    onChange={(e) => setIsSelfPatient(e.target.checked)} 
                    className="w-5 h-5 rounded border-slate-300 text-[#6F8F7A] focus:ring-[#6F8F7A]"
                  />
                  <span>I am the patient (create a patient profile under my current email)</span>
                </label>
                
                {!isSelfPatient && (
                  <>
                    <input
                      type="text"
                      placeholder="Patient Full Name"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#CBD5E1] dark:border-[#33423A] bg-white dark:bg-[#1E2922] text-[#29352F] dark:text-[#F7F4EC] text-sm focus:outline-none focus:border-[#6F8F7A]"
                    />
                    <input
                      type="email"
                      placeholder="Patient Email Address"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#CBD5E1] dark:border-[#33423A] bg-white dark:bg-[#1E2922] text-[#29352F] dark:text-[#F7F4EC] text-sm focus:outline-none focus:border-[#6F8F7A]"
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="Create Patient Password (min 8 chars)"
                        value={addPassword}
                        onChange={(e) => setAddPassword(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#CBD5E1] dark:border-[#33423A] bg-white dark:bg-[#1E2922] text-[#29352F] dark:text-[#F7F4EC] text-sm focus:outline-none focus:border-[#6F8F7A] pr-28"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const rand = 'Pt' + Math.random().toString(36).substring(2, 8) + '!' + Math.floor(Math.random() * 90 + 10)
                          setAddPassword(rand)
                        }}
                        className="absolute right-2 text-xs py-1.5 px-2.5 bg-[#E8EFEA] dark:bg-[#28372E] border border-[#CBD5E1] dark:border-[#33423A] text-[#42594B] dark:text-[#A5C4B7] rounded-lg cursor-pointer font-semibold hover:bg-[#D5E3DA] dark:hover:bg-[#334539]"
                      >
                        Auto-Generate
                      </button>
                    </div>
                  </>
                )}
                
                {addSuccessMessage && (
                  <p className="text-green-600 dark:text-green-400 font-semibold m-0 text-sm">{addSuccessMessage}</p>
                )}
                {addError && <p className="text-red-600 dark:text-red-400 font-semibold m-0 text-sm">{addError}</p>}
                
                <button 
                  type="submit" 
                  disabled={isAddingLoading}
                  className="p-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white rounded-xl font-bold cursor-pointer transition-all disabled:opacity-70 shadow-sm"
                >
                  {isAddingLoading ? 'Creating Patient Account...' : 'Create Patient Account'}
                </button>
              </form>
            </div>
          )}

          {/* Patients List Grid */}
          {patients.length === 0 ? (
            <div className="p-8 bg-gradient-to-br from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#16201B] border border-[#E8EFEA] dark:border-[#2F3F36] rounded-2xl text-center">
              <p className="text-[#6B7C73] dark:text-[#A3B3AA]">You have no linked patients yet. Click "+ Add Patient" or "Invite Patient Code" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {patients.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className="relative group transition-all hover:border-[#6F8F7A] dark:hover:border-[#8BAFA0] hover:shadow-md bg-gradient-to-br from-[#FFFDF7] via-[#FCFDFB] to-[#F4F8F5] dark:from-[#1E2922] dark:via-[#1A251F] dark:to-[#151F19] border-2 border-[#E8EFEA] dark:border-[#2F3F36] text-[#29352F] dark:text-[#F7F4EC] rounded-2xl p-5 text-left cursor-pointer shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-3xl mb-2">👤</div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingPatient(p)
                      }}
                      className="p-2 text-[#6B7C73] hover:text-[#C96B5C] hover:bg-[#C96B5C]/10 dark:hover:bg-[#DB8072]/15 rounded-xl transition-all cursor-pointer"
                      title="Delete Patient"
                      aria-label={`Delete ${p.full_name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-bold text-lg text-[#29352F] dark:text-[#F7F4EC]">{p.full_name}</div>
                  <div className="text-sm text-[#6B7C73] dark:text-[#A3B3AA] truncate">{p.email}</div>
                </div>
              ))}
            </div>
          )}

          {/* Active Patient Invites Section (Invalidation & Sharing) */}
          <div className="mt-10 pt-8 border-t border-[#E8EFEA] dark:border-[#28372E]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#29352F] dark:text-[#F7F4EC] flex items-center gap-2">
                  <Ticket size={20} className="text-[#6F8F7A]" />
                  <span>Patient Invite Links & Codes</span>
                </h2>
                <p className="text-xs text-[#6B7C73] dark:text-[#A3B3AA] mt-0.5">
                  Patients can click these links to sign up and instantly connect to your care portal. You can invalidate unused invites at any time.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGeneratePatientInvite}
                disabled={isGeneratingInvite}
                className="px-3 py-1.5 bg-gradient-to-r from-[#E8EFEA] via-[#E2ECE5] to-[#D8E5DC] hover:from-[#DFEBE2] hover:to-[#CEE0D4] dark:from-[#1E2922] dark:via-[#24332A] dark:to-[#1E2922] dark:hover:from-[#24332A] dark:hover:to-[#2A3B30] text-[#42594B] dark:text-[#A5C4B7] border border-[#6F8F7A]/30 dark:border-[#33423A] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Ticket size={14} />
                <span>+ Generate New Invite</span>
              </button>
            </div>

            {isLoadingInvites ? (
              <div className="p-4 text-xs text-[#6B7C73] dark:text-[#A3B3AA] text-center">Loading invites...</div>
            ) : caregiverInvites.length === 0 ? (
              <div className="p-5 bg-gradient-to-br from-[#E8EFEA]/40 to-[#E8EFEA]/20 dark:from-[#1E2922]/50 dark:to-[#16201B]/50 border border-dashed border-[#6F8F7A]/30 dark:border-[#33423A] rounded-2xl text-center">
                <p className="text-xs text-[#6B7C73] dark:text-[#A3B3AA] m-0">
                  No active invite codes. Click "Invite Patient Code" above to generate a shareable registration link.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {caregiverInvites.map((inv) => {
                  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/app/invite/${inv.code}` : `/app/invite/${inv.code}`
                  const isCopied = copiedCode === inv.code
                  const isDeleting = deletingInviteCode === inv.code

                  return (
                    <div
                      key={inv.code}
                      className="p-4 bg-gradient-to-br from-[#FFFDF7] via-[#FAFDFB] to-[#F5F8F5] dark:from-[#1E2922] dark:via-[#1A251F] dark:to-[#16201A] border border-[#E8EFEA] dark:border-[#33423A] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg bg-[#E8EFEA] dark:bg-[#28372E] text-[#42594B] dark:text-[#A5C4B7] border border-[#6F8F7A]/30 dark:border-[#3E5246]">
                            {inv.code}
                          </span>
                          <span className="text-[11px] text-[#6B7C73] dark:text-[#A3B3AA] font-medium">
                            Uses: {inv.uses || 0} / {inv.max_uses || 1}
                          </span>
                        </div>
                        <div className="text-xs text-[#6B7C73] dark:text-[#A3B3AA] truncate font-mono select-all">
                          {inviteUrl}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(inviteUrl)
                            setCopiedCode(inv.code)
                            setTimeout(() => setCopiedCode(null), 2500)
                          }}
                          className="px-3 py-1.5 bg-[#E8EFEA] dark:bg-[#28372E] hover:bg-[#D5E3DA] dark:hover:bg-[#334539] text-[#42594B] dark:text-[#A5C4B7] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {isCopied ? <Check size={14} className="text-green-600 dark:text-green-400" /> : <Copy size={14} />}
                          <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteInvite(inv.code)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                          title="Delete this invite link"
                        >
                          <Trash2 size={14} />
                          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="px-4 sm:px-6 mb-4 flex gap-4 items-center justify-between flex-wrap">
            <button
              onClick={() => setSelectedPatientId(null)}
              className="px-4 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#33423A] bg-gradient-to-b from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#17211B] text-[#29352F] dark:text-[#F7F4EC] hover:border-[#6F8F7A]/40 font-bold text-sm cursor-pointer transition-all shadow-xs"
            >
              ← Back to Patient List
            </button>
            
            {selectedPatientId && (
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => {
                    const p = patients.find(p => p.id === selectedPatientId)
                    if (p) setEditingProfile({ ...p, role: 'patient' })
                  }}
                  className="px-4 py-2 bg-gradient-to-b from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#17211B] text-[#29352F] dark:text-[#F7F4EC] border border-[#E8EFEA] dark:border-[#33423A] hover:border-[#6F8F7A]/40 rounded-xl font-bold text-sm cursor-pointer transition-all shadow-xs"
                >
                  Edit Patient
                </button>
                <button
                  onClick={() => {
                    const p = patients.find(p => p.id === selectedPatientId)
                    if (p) setDeletingPatient(p)
                  }}
                  className="px-4 py-2 bg-[#C96B5C]/15 dark:bg-[#DB8072]/20 text-[#C96B5C] dark:text-[#DB8072] border border-[#C96B5C]/30 dark:border-[#DB8072]/30 hover:bg-[#C96B5C]/25 dark:hover:bg-[#DB8072]/30 rounded-xl font-bold text-sm cursor-pointer transition-colors flex items-center gap-1.5"
                  title="Delete Patient"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Patient</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="px-4 sm:px-6 mb-6">
            <div className="flex bg-[#E8EFEA]/70 dark:bg-[#151E19] border border-[#6F8F7A]/25 dark:border-[#2F3F36] p-1 rounded-xl w-full max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'info' 
                    ? 'bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] text-white shadow-sm' 
                    : 'text-[#6B7C73] dark:text-[#A3B3AA] hover:bg-[#E8EFEA]/80 dark:hover:bg-[#28372E]/50'
                }`}
              >
                Patient Info
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'stats' 
                    ? 'bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] text-white shadow-sm' 
                    : 'text-[#6B7C73] dark:text-[#A3B3AA] hover:bg-[#E8EFEA]/80 dark:hover:bg-[#28372E]/50'
                }`}
              >
                Statistics
              </button>
            </div>
          </div>
          
          {activeTab === 'info' ? (
            <div className="mb-8 mx-4 sm:mx-6 animate-in fade-in duration-300">
              <PatientProfileForm patientId={selectedPatientId} />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {sessions.length === 0 ? (
                <div className="p-12 text-center text-[#6B7C73] dark:text-[#A3B3AA] bg-gradient-to-br from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#16201B] border border-[#E8EFEA] dark:border-[#2F3F36] rounded-3xl mx-4 sm:mx-6">
                  <div className="text-4xl mb-3">📋</div>
                  <h2 className="text-xl font-bold mb-2 text-[#29352F] dark:text-[#F7F4EC]">No sessions yet</h2>
                  <p className="text-sm">This patient has not completed any cognitive dual-task exercises yet.</p>
                </div>
              ) : (
                <CaregiverDashboard liveSessions={sessions} />
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
