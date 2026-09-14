import Link from 'next/link'
import { 
  FileText, 
  ShieldAlert, 
  Armchair, 
  Bot, 
  UserCheck, 
  ArrowLeft, 
  Scale, 
  HeartHandshake 
} from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | Cognia',
  description: 'Terms of Service, non-diagnostic medical disclaimer, and usage rules for Cognia.'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#29352F] flex flex-col selection:bg-[#E2ECE5]">
      {/* Header */}
      <header className="w-full bg-[#FFFDF7] border-b border-[#EBE6D8] px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <img 
              src="/dementia-webapp-logo.png" 
              alt="Cognia Logo" 
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl font-extrabold text-[#29352F] tracking-tight">Cognia</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/privacy" 
              className="inline-flex items-center text-xs sm:text-sm font-bold text-[#6B7C73] hover:text-[#29352F] transition-colors leading-none"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E8EFEA] hover:bg-[#D8E6DC] text-[#425B4C] text-xs sm:text-sm font-bold transition-colors leading-none"
            >
              <ArrowLeft size={14} />
              <span>Back to App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-14 flex flex-col gap-8">
        
        {/* Page Hero */}
        <div className="border-b border-[#E8E2D2] pb-8">
          <div className="inline-flex items-center gap-2 bg-[#E8EFEA] text-[#425B4C] font-bold text-xs px-3.5 py-1.5 rounded-full border border-[#D4E4DC] mb-3">
            <Scale size={14} className="text-[#6F8F7A]" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#29352F] tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-[#6B7C73] max-w-2xl leading-relaxed">
            Please read these terms carefully before accessing or using the Cognia platform. By signing in, creating an account, or participating in cognitive exercises, you agree to these Terms.
          </p>
          <p className="text-xs text-[#8E9F95] mt-3 font-semibold">
            Last Updated: September 14, 2026
          </p>
        </div>

        {/* 1. Medical & Non-Diagnostic Disclaimer */}
        <section className="bg-[#FFFDF7] border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
              <div className="inline-block bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-2">
                Important Clinical Notice
              </div>
              <h2 className="text-xl font-extrabold text-[#29352F] mb-3">
                Non-Diagnostic Wellness Tool (Not Medical Care)
              </h2>
              <p className="text-sm text-[#5B6D63] leading-relaxed mb-3">
                <strong>Cognia is a digital therapeutic companion engineered for cognitive stimulation, reminiscence, and motor-cognitive engagement. It is not an FDA/CE cleared diagnostic medical device.</strong>
              </p>
              <div className="bg-[#F7F4EC] rounded-2xl p-4 border border-[#EBE6D8] space-y-2 text-xs sm:text-sm text-[#47554E]">
                <p>• The metrics, accuracy ratings, reaction times, and AI-generated insights provided by Cognia are intended solely for personal wellness tracking and caregiver support.</p>
                <p>• Cognia does not diagnose, treat, prevent, or cure any neurological disorder, including Mild Cognitive Impairment (MCI), Alzheimer's Disease, or Dementia.</p>
                <p>• Always consult a licensed neurologist, geriatrician, or primary care physician for diagnostic evaluations and medical advice.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Seated Physical Movement & Zero Fall-Risk Requirement */}
        <section className="bg-[#FFFDF7] border border-[#EBE6D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] text-[#6F8F7A] flex items-center justify-center">
              <Armchair size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#29352F]">Physical Exercise & Safety Guidelines</h2>
              <p className="text-xs text-[#6B7C73]">Designed strictly for seated execution</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#5B6D63] leading-relaxed">
            All exergaming gestures (such as upper-body arm raises, lateral touches, and head turns) are calibrated specifically for **seated performance in a stable, stationary chair**.
          </p>
          <ul className="text-xs sm:text-sm text-[#47554E] space-y-1.5 list-disc pl-5 leading-relaxed">
            <li>Users and caregivers must ensure the participant is securely seated before beginning any active exercise session.</li>
            <li>Do not attempt exercises while standing, walking, or in an unstable seating environment.</li>
            <li>Stop immediately if the participant experiences dizziness, discomfort, fatigue, or pain.</li>
          </ul>
        </section>

        {/* 3. Caregiver & Patient Accounts */}
        <section className="bg-[#FFFDF7] border border-[#EBE6D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAE5D9] text-[#29352F] flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#29352F]">Accounts & Access Permissions</h2>
              <p className="text-xs text-[#6B7C73]">Roles, invitations, and identity verification</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#5B6D63] leading-relaxed">
            <p>
              <strong>Caregiver Accounts:</strong> Caregivers may register directly via email verification or Google Sign-In. Caregivers are responsible for managing patient profiles, configuring biographical preferences, and supervising exercise participation.
            </p>
            <p>
              <strong>Patient Accounts:</strong> Patient participation is by invitation only. Caregivers generate secure, cryptographic invite links to onboard participants. Patients may sign in via single-click Google Sign-In or verified email credentials.
            </p>
          </div>
        </section>

        {/* 4. Dynamic AI-Generated Content */}
        <section className="bg-[#FFFDF7] border border-[#EBE6D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAE5D9] text-[#29352F] flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#29352F]">AI Content Generation</h2>
              <p className="text-xs text-[#6B7C73]">Dynamic prompt construction & adaptation</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#5B6D63] leading-relaxed">
            Cognia utilizes hosted Large Language Model (LLM) APIs to generate non-repetitive cognitive questions tailored to regional context and personal preferences. While questions undergo automated schema validation, generative outputs are inherently dynamic. Caregivers have the ability to review generated themes and adjust difficulty profiles.
          </p>
        </section>

        {/* 5. Limitation of Liability */}
        <section className="bg-[#FFFDF7] border border-[#EBE6D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-lg font-extrabold text-[#29352F] flex items-center gap-2">
            <FileText size={18} className="text-[#6F8F7A]" />
            Limitation of Liability
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6D63] leading-relaxed">
            To the fullest extent permitted by applicable law, the developers of Cognia shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this platform, including but not limited to reliance on generated cognitive summaries or physical injuries sustained during non-seated execution.
          </p>
        </section>

        {/* Footer Navigation */}
        <div className="text-center py-6 border-t border-[#E8E2D2] flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-[#6B7C73]">
          <Link href="/privacy" className="font-bold text-[#425B4C] hover:underline">
            Read our Privacy Policy &rarr;
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link href="/" className="font-bold text-[#425B4C] hover:underline">
            Back to Cognia Companion &rarr;
          </Link>
        </div>

      </main>
    </div>
  )
}
