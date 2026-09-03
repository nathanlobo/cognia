'use client'

import { UserPlus, LogIn, X, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NoPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onAddPatient: () => void
}

export default function NoPatientModal({ isOpen, onClose, onAddPatient }: NoPatientModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200 text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
          No Linked Patient
        </h2>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
          You don't have any linked patient profiles yet. How would you like to proceed?
        </p>

        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              onClose()
              onAddPatient()
            }}
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-blue-950 dark:text-blue-100 text-sm sm:text-base">
                Add a New Patient
              </div>
              <div className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                Create or link a patient profile to this caregiver account.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              router.push('/patient')
            }}
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-700 dark:bg-slate-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Log In as an Existing Patient
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switch to the Patient Portal to log in directly with another account.
              </div>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
