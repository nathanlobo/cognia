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
  const [caregiver, setCaregiver] = useState<{ id: string; full_name: string; email: string } | null>(null)
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
      router.replace('/')
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
    }
  }, [caregiver, selectedPatientId, fetchPatients])

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
    router.replace('/')
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

    router.push('/patient')
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

    try {
      if (isSelfPatient) {
        // Link self
        let patientId: string | null = null
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'patient')
          .eq('email', cleanEmail)
          .maybeSingle()

        if (existing) {
          patientId = existing.id
        } else {
          const { data: created, error: createError } = await supabase
            .from('profiles')
            .insert({
              email: cleanEmail,
              full_name: targetName,
              role: 'patient'
            })
            .select('id')
            .single()

          if (createError) throw createError
          if (created) patientId = created.id
        }

        if (patientId) {
          const { error: linkError } = await supabase
            .from('patient_caregiver_relations')
            .upsert({ patient_id: patientId, caregiver_id: caregiver.id })
          
          if (linkError) throw linkError

          setIsAdding(false)
          setAddEmail('')
          setAddName('')
          setAddPassword('')
          setIsSelfPatient(false)
          fetchPatients()
        }
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
      <div className="min-h-screen bg-[#F7F4EC] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-600 dark:text-slate-400 font-medium text-sm">Redirecting to sign in...</p>
      </div>
    )
  }

  return (
    <>
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1.25rem',
            padding: '2rem',
            maxWidth: '30rem',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              backgroundColor: '#EDE9FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <Ticket size={32} className="text-purple-600" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1E293B' }}>
              Patient Invitation Link
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Share this dedicated link with your patient. When they open it, they can register with their email and password, and they will automatically connect to your dashboard.
            </p>

            {/* Direct Link Copy Card */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '0.35rem' }}>
                DIRECT REGISTRATION LINK
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/invite/${generatedInvite}` : `/invite/${generatedInvite}`}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/invite/${generatedInvite}`
                    navigator.clipboard.writeText(url)
                    setHasCopiedInvite(true)
                    setTimeout(() => setHasCopiedInvite(false), 2500)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    backgroundColor: hasCopiedInvite ? '#10B981' : '#6F8F7A',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {hasCopiedInvite ? <Check size={15} /> : <Copy size={15} />}
                  {hasCopiedInvite ? 'Copied Link!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div style={{
              backgroundColor: '#F1F5F9',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              color: '#475569'
            }}>
              <span>Invite Code: <strong style={{ color: '#1E40AF', fontFamily: 'monospace' }}>{generatedInvite}</strong></span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedInvite)
                  setHasCopiedInvite(true)
                  setTimeout(() => setHasCopiedInvite(false), 2000)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1E40AF',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textDecoration: 'underline'
                }}
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
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '0.5rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <Header 
        userName={caregiver.full_name}
        userEmail={caregiver.email}
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
        <div style={{ padding: '1rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Your Patients</h1>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handleGeneratePatientInvite}
                disabled={isGeneratingInvite}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#EDE9FE',
                  color: '#6D28D9',
                  borderRadius: '0.5rem',
                  border: '1px solid #DDD6FE',
                  fontWeight: 700,
                  cursor: isGeneratingInvite ? 'not-allowed' : 'pointer'
                }}
              >
                <Ticket size={16} />
                {isGeneratingInvite ? 'Generating...' : 'Invite Patient Code'}
              </button>
              <button 
                onClick={() => setEditingProfile({ ...caregiver, role: 'caregiver' } as any)}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#F1F5F9', color: '#475569', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontWeight: 700, cursor: 'pointer' }}
              >
                Edit My Profile
              </button>
              <button 
                onClick={handleAddPatientClick}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '0.5rem', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                {isAdding ? 'Cancel' : '+ Add Patient'}
              </button>
            </div>
          </div>

          {inviteError && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem'
            }}>
              <p style={{ color: '#DC2626', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{inviteError}</p>
            </div>
          )}

          {isAdding && (
            <div className="card-accessible" style={{ backgroundColor: '#F8FAFC', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Add or Link Patient</h2>
              <form onSubmit={handleAddPatient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={isSelfPatient} 
                    onChange={(e) => setIsSelfPatient(e.target.checked)} 
                    style={{ width: '1.25rem', height: '1.25rem' }}
                  />
                  I am the patient (create a patient profile under my current email)
                </label>
                
                {!isSelfPatient && (
                  <>
                    <input
                      type="text"
                      placeholder="Patient Full Name"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}
                    />
                    <input
                      type="email"
                      placeholder="Patient Email Address"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}
                    />
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Create Patient Password (min 8 chars)"
                        value={addPassword}
                        onChange={(e) => setAddPassword(e.target.value)}
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', width: '100%', paddingRight: '7rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const rand = 'Pt' + Math.random().toString(36).substring(2, 8) + '!' + Math.floor(Math.random() * 90 + 10)
                          setAddPassword(rand)
                        }}
                        style={{
                          position: 'absolute',
                          right: '0.5rem',
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.6rem',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: '0.35rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          color: '#334155'
                        }}
                      >
                        Auto-Generate
                      </button>
                    </div>
                  </>
                )}
                
                {addSuccessMessage && (
                  <p style={{ color: '#16A34A', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{addSuccessMessage}</p>
                )}
                {addError && <p style={{ color: 'var(--color-accessible-red)', fontWeight: 600, margin: 0 }}>{addError}</p>}
                
                <button 
                  type="submit" 
                  disabled={isAddingLoading}
                  style={{ padding: '0.75rem', backgroundColor: 'var(--color-accessible-blue)', color: '#fff', borderRadius: '0.5rem', border: 'none', fontWeight: 700, cursor: isAddingLoading ? 'not-allowed' : 'pointer', opacity: isAddingLoading ? 0.7 : 1 }}
                >
                  {isAddingLoading ? 'Creating Patient Account...' : 'Create Patient Account'}
                </button>
              </form>
            </div>
          )}

          {patients.length === 0 ? (
            <p style={{ color: 'var(--color-content-muted)' }}>You have no linked patients yet. Click "+ Add Patient" to get started.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {patients.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className="card-accessible relative group transition-all hover:border-blue-400"
                  style={{ textAlign: 'left', cursor: 'pointer', border: '3px solid #E2E8F0', backgroundColor: '#fff', padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingPatient(p)
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Patient"
                      aria-label={`Delete ${p.full_name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{p.full_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-content-muted)' }}>{p.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ padding: '0 1.5rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => setSelectedPatientId(null)}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', cursor: 'pointer', fontWeight: 600, backgroundColor: '#fff' }}
            >
              ← Back to Patient List
            </button>
            
            {selectedPatientId && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    const p = patients.find(p => p.id === selectedPatientId)
                    if (p) setEditingProfile({ ...p, role: 'patient' })
                  }}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#F1F5F9', color: '#475569', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontWeight: 700, cursor: 'pointer' }}
                >
                  Edit Patient
                </button>
                <button
                  onClick={() => {
                    const p = patients.find(p => p.id === selectedPatientId)
                    if (p) setDeletingPatient(p)
                  }}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '0.5rem', border: '1px solid #FECACA', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Delete Patient"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Patient
                </button>
              </div>
            )}
          </div>
          
          <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
            <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${activeTab === 'info' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                Patient Info
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${activeTab === 'stats' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                Statistics
              </button>
            </div>
          </div>
          
          {activeTab === 'info' ? (
            <div className="mb-8 mx-6 animate-in fade-in duration-300">
              <PatientProfileForm patientId={selectedPatientId} />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {sessions.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0F172A' }}>No sessions yet</h2>
                  <p>This patient has not completed any cognitive dual-task exercises yet.</p>
                </div>
              ) : (
                <CaregiverDashboard liveSessions={sessions} />
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </>
  )
}
