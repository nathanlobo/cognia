'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ConsentModalProps {
  onAccept: () => void
  onDecline: () => void
}

export default function ConsentModal({ onAccept, onDecline }: ConsentModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [agreed, setAgreed] = useState(false)

  // In a real app we might force them to scroll to the bottom of the terms container
  // For simplicity, we just ask them to click the checkbox.

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#FFFDF7] dark:bg-[#1E2922] border-2 border-[#E8EFEA] dark:border-[#2F3F36] rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="bg-[#6F8F7A] text-white px-6 py-5">
          <h2 className="text-2xl font-bold">Terms & Informed Consent</h2>
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-[#29352F] dark:text-[#D5DED8] font-medium">
          <div className="bg-[#D9A441]/15 border border-[#D9A441]/30 rounded-2xl p-4 text-[#D9A441] dark:text-[#E4B55C] flex gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-sm">
              Before creating a patient profile and utilizing the AI personalization features, 
              you must review and accept the terms of use.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[#29352F] dark:text-[#F7F4EC]">1. Medical Disclaimer</h3>
            <p className="text-sm text-[#47554E] dark:text-[#A3B3AA]">
              Cognia is a supportive tool designed for cognitive engagement. It is <strong>not a diagnostic medical device</strong> and should not replace professional medical advice, diagnosis, or treatment.
            </p>
            
            <h3 className="font-bold text-lg text-[#29352F] dark:text-[#F7F4EC] mt-6">2. Privacy & Video Processing</h3>
            <p className="text-sm text-[#47554E] dark:text-[#A3B3AA]">
              All camera-based physical gesture tracking is processed <strong>locally on this device</strong>. No video or photographic data is ever transmitted to our servers, recorded, or shared.
            </p>

            <h3 className="font-bold text-lg text-[#29352F] dark:text-[#F7F4EC] mt-6">3. Telemetry & AI Generation</h3>
            <p className="text-sm text-[#47554E] dark:text-[#A3B3AA]">
              Personalized data you enter (such as hobbies or routines) and session performance metrics will be transmitted securely to generative AI models to create dynamically tailored exercise content.
            </p>

            <div className="pt-2">
              <Link href="/terms" target="_blank" className="text-[#6F8F7A] hover:text-[#577361] dark:text-[#8BAFA0] dark:hover:text-[#A5C4B7] font-bold text-sm underline underline-offset-4">
                Read the full Terms & Conditions
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#E8EFEA]/40 dark:bg-[#16201B] border-t border-[#E8EFEA] dark:border-[#28372E] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <div className="w-6 h-6 border-2 border-[#6F8F7A]/40 dark:border-[#33423A] rounded-lg bg-white dark:bg-[#1E2922] peer-checked:bg-[#6F8F7A] peer-checked:border-[#6F8F7A] transition-colors"></div>
              <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#29352F] dark:text-[#F7F4EC] group-hover:text-[#577361] dark:group-hover:text-[#8BAFA0] select-none">
              I have read and agree to the Terms of Use
            </span>
          </label>
          
          <div className="flex items-center w-full sm:w-auto gap-3">
            <button
              onClick={onDecline}
              className="px-6 py-3 bg-[#FFFDF7] dark:bg-[#1E2922] border-2 border-[#E8EFEA] dark:border-[#33423A] hover:bg-[#E8EFEA]/60 dark:hover:bg-[#28372E] text-[#29352F] dark:text-[#F7F4EC] rounded-xl font-bold transition-colors w-full sm:w-auto whitespace-nowrap cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!agreed}
              className="px-6 py-3 bg-[#6F8F7A] hover:bg-[#577361] disabled:opacity-50 disabled:bg-[#8E9F95] disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-xs w-full sm:w-auto whitespace-nowrap cursor-pointer"
            >
              Accept & Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
