'use client'

import { useRef } from 'react'
import { UserPlus, LogIn, X, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NoPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onAddPatient: () => void
}

export default function NoPatientModal({ isOpen, onClose, onAddPatient }: NoPatientModalProps) {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="w-full max-w-md bg-gradient-to-b from-[#FFFDF7] via-[#FAFDFB] to-[#F5F8F5] dark:from-[#1E2922] dark:via-[#1A251F] dark:to-[#16201A] border-2 border-[#E8EFEA] dark:border-[#2F3F36] rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D9A441]/15 text-[#D9A441] dark:text-[#E4B55C] flex items-center justify-center text-2xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6B7C73] hover:text-[#29352F] dark:hover:text-[#F7F4EC] rounded-full hover:bg-[#E8EFEA] dark:hover:bg-[#28372E] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#29352F] dark:text-[#F7F4EC] mb-2">
          No Linked Patient
        </h2>
        <p className="text-sm font-medium text-[#6B7C73] dark:text-[#A3B3AA] mb-6">
          You don't have any linked patient profiles yet. How would you like to proceed?
        </p>

        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              onClose()
              onAddPatient()
            }}
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#6F8F7A]/40 dark:border-[#3E5246] bg-gradient-to-r from-[#E8EFEA] via-[#E0EBE3] to-[#D5E3DA] dark:from-[#24332A] dark:via-[#28372E] dark:to-[#1E2922] hover:shadow-sm transition-all text-left group cursor-pointer shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6F8F7A] to-[#526F5D] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#29352F] dark:text-[#F7F4EC] text-sm sm:text-base">
                Add a New Patient
              </div>
              <div className="text-xs text-[#577361] dark:text-[#A5C4B7] mt-0.5">
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
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#E8EFEA] dark:border-[#33423A] bg-gradient-to-b from-[#FFFDF7] to-[#F5F8F5] dark:from-[#16201B] dark:to-[#121915] hover:border-[#6F8F7A]/40 transition-all text-left group cursor-pointer shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#29352F] dark:bg-[#28372E] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#29352F] dark:text-[#F7F4EC] text-sm sm:text-base">
                Log In as an Existing Patient
              </div>
              <div className="text-xs text-[#6B7C73] dark:text-[#A3B3AA] mt-0.5">
                Switch to the Patient Portal to log in directly with another account.
              </div>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl border-2 border-[#E8EFEA] dark:border-[#33423A] bg-gradient-to-b from-[#FFFDF7] to-[#F5F8F5] dark:from-[#1E2922] dark:to-[#17211B] text-[#29352F] dark:text-[#F7F4EC] font-bold text-sm hover:border-[#6F8F7A]/40 transition-all cursor-pointer shadow-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
