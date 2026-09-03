'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Patient {
  id: string
  full_name: string
  email: string
}

interface DeletePatientModalProps {
  patient: Patient | null
  caregiverId: string
  onClose: () => void
  onDeleted: (deletedPatientId: string) => void
}

export default function DeletePatientModal({
  patient,
  caregiverId,
  onClose,
  onDeleted,
}: DeletePatientModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!patient) return null

  async function handleDelete() {
    if (!patient) return
    setLoading(true)
    setError('')

    try {
      // 1. Remove relationship from patient_caregiver_relations
      const { error: relError } = await supabase
        .from('patient_caregiver_relations')
        .delete()
        .eq('caregiver_id', caregiverId)
        .eq('patient_id', patient.id)

      if (relError) {
        console.error('Error removing relation:', relError)
        throw new Error(relError.message || 'Failed to remove patient relation from database.')
      }

      // 2. Delete patient profile (cascades to game_sessions & results)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', patient.id)

      if (profileError) {
        console.warn('Profile delete warning (patient may be linked to another caregiver):', profileError)
      }

      // 3. Clean up localStorage
      if (typeof window !== 'undefined') {
        const savedPatient = localStorage.getItem('care_companion_patient')
        if (savedPatient) {
          try {
            const parsed = JSON.parse(savedPatient)
            if (parsed.id === patient.id) {
              localStorage.removeItem('care_companion_patient')
            }
          } catch (e) {}
        }

        const recentLocalId = localStorage.getItem('care_companion_recent_patient_id')
        if (recentLocalId === patient.id) {
          localStorage.removeItem('care_companion_recent_patient_id')
        }
      }

      onDeleted(patient.id)
    } catch (err: any) {
      console.error('Failed to delete patient:', err)
      setError(err.message || 'Failed to delete patient. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden border-2 border-red-100 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 id="delete-modal-title" className="text-xl font-black text-red-900">
                Delete Patient
              </h2>
              <p className="text-xs font-semibold text-red-600">Action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-red-100/50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-4">
          <p className="text-base text-slate-700 font-medium leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900">{patient.full_name}</span> (<span className="text-slate-500 text-sm font-semibold">{patient.email}</span>)?
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-800 leading-relaxed">
            ⚠️ This will remove the patient from your caregiver dashboard along with their exercise records and session history.
          </div>

          {error && (
            <div className="text-red-600 text-sm font-bold bg-red-50 p-3.5 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-2xl font-bold transition-all text-base"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
