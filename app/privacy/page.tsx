import Link from 'next/link'
import { 
  Shield, 
  Camera, 
  Lock, 
  Cpu, 
  Eye, 
  FileText, 
  HeartHandshake, 
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | Cognia',
  description: 'Privacy Policy and on-device data processing commitments for Cognia cognitive wellness platform.'
}

export default function PrivacyPage() {
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
              href="/terms" 
              className="inline-flex items-center text-xs sm:text-sm font-bold text-[#6B7C73] hover:text-[#29352F] transition-colors leading-none"
            >
              Terms of Service
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
            <Shield size={14} className="text-[#6F8F7A]" />
            <span>Privacy-First Digital Therapeutic</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#29352F] tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-[#6B7C73] max-w-2xl leading-relaxed">
            At Cognia, we believe that protecting the dignity, autonomy, and personal privacy of individuals experiencing cognitive decline is essential. This policy details how we handle data with uncompromising privacy safeguards.
          </p>
          <p className="text-xs text-[#8E9F95] mt-3 font-semibold">
            Last Updated: September 14, 2026
          </p>
        </div>

        {/* Core Pillar: 100% On-Device Pose Tracking */}
        <section className="bg-[#FFFDF7] border-2 border-[#DCE8DF] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#6F8F7A] flex items-center justify-center shrink-0">
              <Camera size={24} />
            </div>
            <div className="flex-1">
              <div className="inline-block bg-[#E8EFEA] text-[#425B4C] text-[11px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-2">
                Fundamental Guarantee
              </div>
              <h2 className="text-xl font-extrabold text-[#29352F] mb-3">
                100% On-Device Computer Vision & Video Processing
              </h2>
              <p className="text-sm text-[#5B6D63] leading-relaxed mb-4">
                Cognia utilizes real-time skeletal tracking (MediaPipe WebAssembly) to detect upper-body gestures and seated exercises. 
              </p>
              <div className="bg-[#F7F4EC] rounded-2xl p-4 border border-[#EBE6D8] space-y-2.5 text-xs sm:text-sm text-[#47554E] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#6F8F7A] shrink-0" />
                  <span><strong>Zero Video Upload:</strong> Video frames from your camera are processed entirely in browser RAM.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#6F8F7A] shrink-0" />
                  <span><strong>Immediate Frame Discard:</strong> Each video frame is discarded milliseconds after skeletal coordinate extraction.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#6F8F7A] shrink-0" />
                  <span><strong>No Facial Recognition:</strong> We do not store or scan facial geometry, biometrics, or photographic imagery.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Collect */}
        <section className="bg-[#FFFDF7] border border-[#EBE6D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#EAE5D9] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#EAE5D9] text-[#29352F] flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#29352F]">Information We Collect</h2>
              <p className="text-xs text-[#6B7C73]">Minimal data necessary to deliver personalized therapy and caregiver visibility</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F7F4EC] p-5 rounded-2xl border border-[#EBE6D8]">
              <h3 className="text-sm font-extrabold text-[#29352F] mb-2 flex items-center gap-2">
                <Lock size={15} className="text-[#6F8F7A]" />
                Account & Authentication
              </h3>
              <ul className="text-xs text-[#5B6D63] space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Full name and email address.</li>
                <li>Hashed passwords (for email sign-in) or Google account identifier (for Google Sign-In).</li>
                <li>Role designation (Caregiver or Patient).</li>
                <li>Patient-caregiver invite associations.</li>
              </ul>
            </div>

            <div className="bg-[#F7F4EC] p-5 rounded-2xl border border-[#EBE6D8]">
              <h3 className="text-sm font-extrabold text-[#29352F] mb-2 flex items-center gap-2">
                <Sparkles size={15} className="text-[#6F8F7A]" />
                Clinical Telemetry & Progress
              </h3>
              <ul className="text-xs text-[#5B6D63] space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Exercise accuracy, reaction times, and round scores.</li>
                <li>Daily session streak tracking and completion dates.</li>
                <li>Baseline affective mood ratings recorded during check-in.</li>
                <li>Algorithmic cognitive trend summaries for the caregiver.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Google User Data */}
        <section className="bg-[#FFFDF7] border border-[#EBE6D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAE5D9] text-[#29352F] flex items-center justify-center">
              <Eye size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#29352F]">Google OAuth & Third-Party Services</h2>
              <p className="text-xs text-[#6B7C73]">How Google user credentials and data are handled</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#5B6D63] leading-relaxed">
            When you authenticate using <strong>Continue with Google</strong>, Cognia requests read-only access to your basic Google profile identity (email address, full name, and avatar picture).
          </p>

          <div className="bg-[#F7F4EC] rounded-2xl p-4 border border-[#EBE6D8] space-y-2 text-xs text-[#47554E]">
            <p><strong>Limited Use Policy:</strong> Cognia strictly complies with the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-[#425B4C] font-bold underline">Google API Services User Data Policy</a>.</p>
            <p>• We do not sell your personal information or Google account data to third parties.</p>
            <p>• We do not use Google account data for targeted advertising or marketing purposes.</p>
            <p>• Google data is used exclusively to verify identity and maintain your unified Cognia profile.</p>
          </div>
        </section>

        {/* Caregiver Confidentiality & Reminiscence Scrapbook */}
        <section className="bg-[#FFFDF7] border border-[#EBE6D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-lg font-extrabold text-[#29352F] flex items-center gap-2">
            <HeartHandshake size={18} className="text-[#6F8F7A]" />
            Reminiscence Scrapbook & Personal Context
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6D63] leading-relaxed">
            In accordance with Tom Kitwood's Person-Centered Care framework, caregivers may provide biographical preferences (e.g. hometown memories, favorite dishes, past professions) to ground therapy exercises in familiar identity anchors. This contextual data is isolated to your patient profile and is never published or exposed across accounts.
          </p>
        </section>

        {/* User Rights & Deletion */}
        <section className="bg-[#FFFDF7] border border-[#EBE6D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-lg font-extrabold text-[#29352F] flex items-center gap-2">
            <FileText size={18} className="text-[#6F8F7A]" />
            Data Retention & Account Deletion
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6D63] leading-relaxed">
            Caregivers and patients retain full control over their records. Caregivers can delete patient profiles, reset telemetry history, or remove account links at any time directly through the Caregiver Dashboard. When an account is deleted, all associated telemetry and session records are permanently purged from the database.
          </p>
        </section>

        {/* Contact Us */}
        <div className="text-center py-6 border-t border-[#E8E2D2]">
          <p className="text-xs text-[#6B7C73] mb-2 font-medium">
            Have questions or privacy concerns regarding Cognia?
          </p>
          <a 
            href="mailto:privacy@codinx.app" 
            className="text-xs sm:text-sm font-bold text-[#425B4C] hover:underline"
          >
            privacy@codinx.app
          </a>
        </div>

      </main>
    </div>
  )
}
