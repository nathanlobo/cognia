'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Brain, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  HeartHandshake, 
  Lock, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  Volume2, 
  Eye, 
  Compass, 
  Smile, 
  Wind, 
  Award, 
  FileText, 
  Users, 
  Cpu, 
  ExternalLink,
  Layers,
  Heart
} from 'lucide-react'

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'caregiver'>('patient')
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null)
  const [armAngle, setArmAngle] = useState(88)

  // Subtle interactive animation for the simulated pose tracking HUD
  useEffect(() => {
    const interval = setInterval(() => {
      setArmAngle((prev) => (prev >= 95 ? 82 : prev + 2))
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F4F8F5] to-[#EAEFEA] text-[#29352F] selection:bg-[#6F8F7A]/20 selection:text-[#29352F]">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. STICKY HEADER & NAVIGATION
      ───────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAF8F2]/90 backdrop-blur-md border-b border-[#E8E2D2] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 no-underline group">
            <div className="w-14 h-14 rounded-2xl bg-[#FFFDF7] border-2 border-[#E8E2D2] shadow-xs flex items-center justify-center group-hover:border-[#6F8F7A] transition-all overflow-hidden p-1.5">
              <img 
                src="/dementia-webapp-logo.png" 
                alt="Cognia Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-[#29352F] block leading-tight">
                Cognia
              </span>
              <span className="text-xs font-bold text-[#6F8F7A] tracking-wider uppercase block mt-0.5">
                Cognitive Therapeutic
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            <a 
              href="#science" 
              className="inline-flex items-center text-sm font-bold text-[#56675E] hover:text-[#29352F] transition-colors"
            >
              The Science
            </a>
            <a 
              href="#session-loop" 
              className="inline-flex items-center text-sm font-bold text-[#56675E] hover:text-[#29352F] transition-colors"
            >
              Daily Session
            </a>
            <a 
              href="#experience" 
              className="inline-flex items-center text-sm font-bold text-[#56675E] hover:text-[#29352F] transition-colors"
            >
              Patient & Caregiver
            </a>
            <a 
              href="#architecture" 
              className="inline-flex items-center text-sm font-bold text-[#56675E] hover:text-[#29352F] transition-colors"
            >
              Architecture
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="hidden sm:inline-flex items-center justify-center px-4 h-10 rounded-full text-sm font-bold text-[#47554E] hover:text-[#29352F] hover:bg-[#EAE5D9]/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-full bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold text-sm shadow-[0_4px_14px_rgba(111,143,122,0.35)] hover:shadow-[0_6px_20px_rgba(111,143,122,0.45)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Launch App</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        
        {/* Soft atmospheric gradient background blooms */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-radial from-[#E8EFEA]/80 via-[#FFFDF7]/40 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-5 w-96 h-96 bg-[#D9A441]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Clinical Hackathon Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF7] border border-[#DDD6C6] shadow-2xs mb-6">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs font-bold text-[#56675E]">
                  Smart India Hackathon 2026 &bull; Team Elite Control
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#29352F] tracking-tight leading-[1.12] mb-6">
                Dual-Task Exergaming for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#577361] to-[#D9A441]">
                  Cognitive Vitality & Dementia Care
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-[#6B7C73] leading-relaxed max-w-2xl mb-8 font-medium">
                Combining real-time seated physical tracking with dynamic personalized memory recall. Designed to stimulate hippocampal BDNF and neuroplasticity with <strong>100% on-device privacy</strong> and <strong>zero fall risk</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link
                  href="/app"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-[#FFFDF7] font-extrabold text-base shadow-[0_4px_16px_rgba(111,143,122,0.35)] hover:shadow-[0_6px_22px_rgba(111,143,122,0.45)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Start Free Session</span>
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#science"
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#FFFDF7] hover:bg-[#EAE5D9] text-[#29352F] font-bold text-base border-2 border-[#E3DEC3] hover:border-[#6F8F7A] shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Brain size={18} className="text-[#6F8F7A]" />
                  <span>The Science</span>
                </a>
              </div>

              {/* Value Highlights */}
              <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-[#E8E2D2] w-full max-w-xl">
                <div>
                  <div className="text-2xl font-extrabold text-[#29352F]">100%</div>
                  <div className="text-xs text-[#6B7C73] font-semibold mt-0.5">On-Device MediaPipe</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#29352F]">0 Fall</div>
                  <div className="text-xs text-[#6B7C73] font-semibold mt-0.5">Calibrated Seated Movement</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#29352F]">6-Step</div>
                  <div className="text-xs text-[#6B7C73] font-semibold mt-0.5">Deterministic Daily Flow</div>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Showcase: Interactive Live Dual-Task Simulator */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md bg-[#FFFDF7] rounded-3xl border-2 border-[#E3DEC3] shadow-[0_16px_40px_rgba(41,53,47,0.08)] p-6 overflow-hidden">
                
                {/* Simulator Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EAE5D9] mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-[#29352F] tracking-wide uppercase">
                      Live Dual-Task Exercise
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E8EFEA] text-[#577361] border border-[#D4E4DC]">
                    <ShieldCheck size={13} />
                    <span>WASM Private</span>
                  </div>
                </div>

                {/* Simulated Pose Landmark Canvas & Wireframe */}
                <div className="relative h-56 rounded-2xl bg-gradient-to-br from-[#1E2722] to-[#29352F] p-4 text-white overflow-hidden shadow-inner flex flex-col justify-between">
                  
                  {/* Real-time Telemetry HUD overlay */}
                  <div className="flex items-center justify-between text-[11px] font-mono z-10">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Activity size={12} /> 33 LANDMARKS
                    </span>
                    <span className="bg-white/10 px-2 py-0.5 rounded backdrop-blur-xs text-white/90">
                      Arm Elevation: {armAngle}&deg;
                    </span>
                  </div>

                  {/* Wireframe Silhouette Simulator */}
                  <div className="relative flex-1 flex items-center justify-center">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      {/* Head */}
                      <div className="absolute top-2 w-8 h-8 rounded-full border-2 border-emerald-400/80 bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                      {/* Torso */}
                      <div className="absolute top-10 w-0.5 h-14 bg-emerald-400/60" />
                      {/* Left Arm raised */}
                      <div 
                        className="absolute top-12 -left-3 w-16 h-0.5 bg-emerald-400 origin-right transition-transform duration-700 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        style={{ transform: `rotate(-${armAngle}deg)` }}
                      >
                        <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-white border border-emerald-500" />
                      </div>
                      {/* Right Arm raised */}
                      <div 
                        className="absolute top-12 -right-3 w-16 h-0.5 bg-emerald-400 origin-left transition-transform duration-700 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        style={{ transform: `rotate(${armAngle}deg)` }}
                      >
                        <div className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-white border border-emerald-500" />
                      </div>
                      {/* Center target guide circle */}
                      <div className="w-28 h-28 rounded-full border border-dashed border-emerald-400/30 animate-spin" style={{ animationDuration: '24s' }} />
                    </div>
                  </div>

                  {/* Pose target validation badge */}
                  <div className="flex items-center justify-between text-xs z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-white/80 font-sans font-medium">Physical Action:</span>
                    <span className="text-emerald-300 font-bold font-sans flex items-center gap-1">
                      <CheckCircle2 size={13} /> Seated Posture Aligned
                    </span>
                  </div>
                </div>

                {/* Simultaneous Cognitive Recall Challenge (Groq LLM Engine) */}
                <div className="mt-4 p-4 rounded-2xl bg-[#F7F4EC] border border-[#DDD6C6]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#6F8F7A] mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#D9A441]" />
                      Dynamic Memory Recall (Round 3 of 7)
                    </span>
                    <Volume2 size={15} className="text-[#6B7C73] animate-pulse" />
                  </div>
                  <p className="text-xs font-extrabold text-[#29352F] mb-3">
                    "Raise your arms and recall: What vegetable was simmered in Sunday's harvest soup?"
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 1, text: 'Winter Squash', correct: true },
                      { id: 2, text: 'Bell Pepper', correct: false },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedQuizOption(opt.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer border ${
                          selectedQuizOption === opt.id
                            ? opt.correct
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-2xs'
                              : 'bg-red-50 border-red-300 text-red-800'
                            : 'bg-white border-[#DCD6C8] text-[#47554E] hover:border-[#6F8F7A]'
                        }`}
                      >
                        <span>{opt.text}</span>
                        {selectedQuizOption === opt.id && opt.correct && (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Hint */}
                <div className="mt-3 text-center">
                  <span className="text-[11px] text-[#8E9F95] font-semibold">
                    &bull; Interactive simulation &bull; Try clicking an answer above!
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. CLINICAL SCIENCE & NEUROBIOLOGICAL FOUNDATION
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="science" className="py-20 lg:py-28 bg-[#FFFDF7] border-y border-[#E8E2D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8EFEA] text-[#577361] font-bold text-xs mb-3 border border-[#D4E4DC]">
              <Brain size={14} className="text-[#6F8F7A]" />
              <span>Neurobiological Mechanism</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#29352F] tracking-tight">
              The Science Behind Dual-Task Exergaming
            </h2>
            <p className="text-base sm:text-lg text-[#6B7C73] font-medium mt-3">
              Why combining motor movement and cognitive recall produces exponential neural benefits compared to passive screen games or simple seated exercise alone.
            </p>
          </div>

          {/* Biological Cascade Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative mb-16">
            
            <div className="bg-[#F7F4EC] p-6 rounded-2xl border-2 border-[#EBE6D8] relative">
              <div className="w-10 h-10 rounded-xl bg-[#6F8F7A] text-white flex items-center justify-center font-extrabold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-extrabold text-[#29352F] mb-1">
                Seated Physical Task
              </h3>
              <p className="text-xs text-[#6B7C73] leading-relaxed">
                Repetitive upper-body posture alignment and arm extensions contract skeletal muscle without fall risks.
              </p>
            </div>

            <div className="bg-[#F7F4EC] p-6 rounded-2xl border-2 border-[#EBE6D8] relative">
              <div className="w-10 h-10 rounded-xl bg-[#D9A441] text-white flex items-center justify-center font-extrabold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-extrabold text-[#29352F] mb-1">
                Irisin Hormone Release
              </h3>
              <p className="text-xs text-[#6B7C73] leading-relaxed">
                Contracting muscle releases the polypeptide hormone Irisin, which crosses the blood-brain barrier.
              </p>
            </div>

            <div className="bg-[#F7F4EC] p-6 rounded-2xl border-2 border-[#EBE6D8] relative">
              <div className="w-10 h-10 rounded-xl bg-[#C96B5C] text-white flex items-center justify-center font-extrabold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-extrabold text-[#29352F] mb-1">
                Hippocampal BDNF Surge
              </h3>
              <p className="text-xs text-[#6B7C73] leading-relaxed">
                Irisin triggers a sharp release of Brain-Derived Neurotrophic Factor (BDNF) in the memory-forming hippocampus.
              </p>
            </div>

            <div className="bg-[#F7F4EC] p-6 rounded-2xl border-2 border-[#577361] relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#29352F] text-white flex items-center justify-center font-extrabold text-sm mb-4">
                4
              </div>
              <h3 className="text-base font-extrabold text-[#29352F] mb-1">
                Synaptogenesis & Recall
              </h3>
              <p className="text-xs text-[#6B7C73] leading-relaxed">
                Concurrent cognitive retrieval locks newly generated neurons into functional, persistent neural pathways.
              </p>
            </div>

          </div>

          {/* Kitwood Framework Card */}
          <div className="p-8 rounded-3xl bg-[#E8EFEA]/70 border-2 border-[#C5D7CC] flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-extrabold text-[#577361] uppercase tracking-wider">
                Tom Kitwood’s Person-Centered Care
              </span>
              <h3 className="text-2xl font-extrabold text-[#29352F] mt-1 mb-3">
                Rebuilding Personhood, Eliminating Exam Anxiety
              </h3>
              <p className="text-sm text-[#4E6256] leading-relaxed font-medium">
                Standard clinical examinations (like the MMSE or MoCA) feel like sterile judgment tests, triggering cortisol spikes and patient withdrawal. Cognia wraps arithmetic, orientation, and memory challenges inside familiar family memories, regional foods, and personal folklore.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="p-4 rounded-2xl bg-white border border-[#D4E4DC] text-center min-w-[160px]">
                <div className="text-xl font-extrabold text-[#29352F]">Zero Fatigue</div>
                <div className="text-xs text-[#6B7C73] mt-0.5">Gentle 7-round pacing</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#D4E4DC] text-center min-w-[160px]">
                <div className="text-xl font-extrabold text-[#29352F]">No Clinical Fear</div>
                <div className="text-xs text-[#6B7C73] mt-0.5">Positive reinforcement</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. THE 6-STEP DETERMINISTIC DAILY SESSION LOOP
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="session-loop" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFDF7] text-[#6F8F7A] font-bold text-xs mb-3 border border-[#E3DEC3]">
              <Compass size={14} className="text-[#D9A441]" />
              <span>Structured Cognitive Routine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#29352F] tracking-tight">
              The 6-Step Daily Session Loop
            </h2>
            <p className="text-base sm:text-lg text-[#6B7C73] font-medium mt-3">
              A state machine calibrated to prevent confusion, soothe agitation, and reinforce daily temporal grounding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {[
              {
                step: '01',
                icon: Compass,
                title: 'Temporal Orientation & Greeting',
                desc: 'Gentle voice greeting anchoring today’s day of the week, season, weather, and time of day to combat sundowning disassociation.',
                color: 'text-[#6F8F7A]',
                bg: 'bg-[#E8EFEA]'
              },
              {
                step: '02',
                icon: Smile,
                title: 'Affective Mood Check-in',
                desc: 'Non-verbal emoji and voice affect telemetry logging daily emotional baseline before any cognitive tasks begin.',
                color: 'text-[#D9A441]',
                bg: 'bg-[#FDF4E2]'
              },
              {
                step: '03',
                icon: Wind,
                title: 'Guided Breathing Pacer',
                desc: 'Harmonious box-breathing animation reducing resting heart rate variability and lowering cortisol prior to motor tracking.',
                color: 'text-[#577361]',
                bg: 'bg-[#E8EFEA]'
              },
              {
                step: '04',
                icon: Activity,
                title: 'Dual-Task Exergaming',
                desc: 'Simultaneous 33-landmark pose detection and Groq-seeded dynamic quiz rounds ensuring physical & cognitive synchronization.',
                color: 'text-[#C96B5C]',
                bg: 'bg-[#F9ECE9]'
              },
              {
                step: '05',
                icon: CheckCircle2,
                title: 'Real-World Task Verification',
                desc: 'Confirmation of daily life milestones—water intake, medication, walking—bridging screen exercises into physical autonomy.',
                color: 'text-[#6F8F7A]',
                bg: 'bg-[#E8EFEA]'
              },
              {
                step: '06',
                icon: Award,
                title: 'Longitudinal Streaks & Rewards',
                desc: 'Dopaminergic positive feedback loops, memory gallery unlocks, and zero-shame consistency tracking over weeks.',
                color: 'text-[#D9A441]',
                bg: 'bg-[#FDF4E2]'
              }
            ].map((card) => {
              const Icon = card.icon
              return (
                <div 
                  key={card.step}
                  className="bg-[#FFFDF7] p-8 rounded-3xl border-2 border-[#EBE6D8] hover:border-[#6F8F7A] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center font-bold`}>
                        <Icon size={24} />
                      </div>
                      <span className="text-2xl font-black text-[#DDD6C6] group-hover:text-[#6F8F7A] transition-colors">
                        {card.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#29352F] mb-2.5">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#6B7C73] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              )
            })}

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. DUAL PERSPECTIVE INTERACTIVE SHOWCASE (PATIENT VS CAREGIVER)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="experience" className="py-20 lg:py-28 bg-[#FFFDF7] border-y border-[#E8E2D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8EFEA] text-[#577361] font-bold text-xs mb-3 border border-[#D4E4DC]">
              <Users size={14} className="text-[#6F8F7A]" />
              <span>Tailored Experiences</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#29352F] tracking-tight">
              Designed for Dignity, Built for Caregivers
            </h2>
            <p className="text-base sm:text-lg text-[#6B7C73] font-medium mt-3">
              Explore how Cognia creates a warm, frustration-free sanctuary for patients while giving family and therapists clinical precision.
            </p>

            {/* Interactive Toggle Switcher */}
            <div className="mt-8 inline-flex p-1.5 bg-[#EAE5D9] rounded-full border border-[#DDD6C6]">
              <button
                type="button"
                onClick={() => setActiveTab('patient')}
                className={`px-6 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
                  activeTab === 'patient'
                    ? 'bg-[#FFFDF7] text-[#29352F] shadow-xs'
                    : 'text-[#6B7C73] hover:text-[#29352F]'
                }`}
              >
                Patient Sanctuary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('caregiver')}
                className={`px-6 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
                  activeTab === 'caregiver'
                    ? 'bg-[#FFFDF7] text-[#29352F] shadow-xs'
                    : 'text-[#6B7C73] hover:text-[#29352F]'
                }`}
              >
                Caregiver Command Center
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="bg-[#F7F4EC] rounded-3xl border-2 border-[#EBE6D8] p-8 sm:p-12">
            {activeTab === 'patient' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center animate-in fade-in duration-300">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#6F8F7A] uppercase tracking-wider mb-2">
                    <Heart size={14} /> Senior-Friendly Ergonomics
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#29352F] mb-4">
                    High Contrast, Zero Navigation Clutter, Voice Paced
                  </h3>
                  <ul className="space-y-3.5 text-sm text-[#56675E]">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#6F8F7A] shrink-0 mt-0.5" />
                      <span><strong>Touch Targets &gt; 52px:</strong> Generously proportioned buttons specifically designed for tremors, arthritis, and low-dexterity taps.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#6F8F7A] shrink-0 mt-0.5" />
                      <span><strong>Ambient Audio Guidance:</strong> Streaming text-to-speech with browser voice dictation so typing is never mandatory.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#6F8F7A] shrink-0 mt-0.5" />
                      <span><strong>Personal Memory Vault:</strong> Cherished family photographs, favorite nostalgic melodies, and comforting reminiscence prompts.</span>
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link
                      href="/app"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6F8F7A] text-white font-extrabold text-sm shadow-xs hover:bg-[#577361] transition-colors"
                    >
                      <span>Try Patient Portal</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="bg-[#FFFDF7] p-6 rounded-2xl border-2 border-[#E3DEC3] shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-[#EAE5D9] mb-4">
                    <span className="text-xs font-bold text-[#6F8F7A]">Today’s Routine</span>
                    <span className="text-xs font-bold text-[#D9A441]">Day 14 Streak 🔥</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#E8EFEA] text-[#29352F] flex items-center justify-between font-bold text-sm">
                      <span>Morning Memory Recall</span>
                      <span className="text-xs text-[#577361] font-extrabold">Completed &check;</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FDF4E2] text-[#29352F] flex items-center justify-between font-bold text-sm">
                      <span>Seated Posture & Breathing</span>
                      <span className="text-xs text-[#D9A441] font-extrabold">Completed &check;</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FFFDF7] border border-[#DDD6C6] text-[#47554E] flex items-center justify-between font-bold text-sm">
                      <span>Afternoon Walk Verification</span>
                      <span className="text-xs text-[#8E9F95]">Up Next</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center animate-in fade-in duration-300">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#D9A441] uppercase tracking-wider mb-2">
                    <Activity size={14} /> Clinical Telemetry & Reporting
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#29352F] mb-4">
                    Longitudinal Telemetry Without Invasive Monitoring
                  </h3>
                  <ul className="space-y-3.5 text-sm text-[#56675E]">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#6F8F7A] shrink-0 mt-0.5" />
                      <span><strong>Cognitive Drift Detection:</strong> Monitor subtle shifts in reaction latency and accuracy trends over rolling 30-day windows.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#6F8F7A] shrink-0 mt-0.5" />
                      <span><strong>One-Click PDF Neurologist Export:</strong> Generate clinical trend reports summarizing motor compliance and affect to share with doctors.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#6F8F7A] shrink-0 mt-0.5" />
                      <span><strong>Instant Patient Invitation Codes:</strong> Easily generate secure single-use codes to register a parent or spouse in seconds.</span>
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link
                      href="/app"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D9A441] text-white font-extrabold text-sm shadow-xs hover:bg-[#C28F34] transition-colors"
                    >
                      <span>Open Caregiver Dashboard</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="bg-[#FFFDF7] p-6 rounded-2xl border-2 border-[#E3DEC3] shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9] mb-4">
                    <span className="text-xs font-bold text-[#29352F]">Session Metrics (Last 7 Days)</span>
                    <span className="text-xs font-bold text-[#6F8F7A]">94% Motor Compliance</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Mean Reaction Latency</span>
                        <span className="text-emerald-600">1.84s (Improved -12%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[78%]" />
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Seated Arm Elevation Consistency</span>
                        <span className="text-emerald-600">92%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[92%]" />
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Mood Tracking Baseline</span>
                        <span className="text-amber-600">Positive / Calm (85%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full w-[85%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. ARCHITECTURE & PRIVACY PILLARS
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="architecture" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFDF7] text-[#6F8F7A] font-bold text-xs mb-3 border border-[#E3DEC3]">
              <Cpu size={14} className="text-[#6F8F7A]" />
              <span>Engineered for Trust</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#29352F] tracking-tight">
              Privacy-First Technical Architecture
            </h2>
            <p className="text-base sm:text-lg text-[#6B7C73] font-medium mt-3">
              We believe cognitive care must respect patient dignity and domestic privacy above all else.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#FFFDF7] p-8 rounded-3xl border-2 border-[#EBE6D8] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#6F8F7A] flex items-center justify-center font-bold mb-6">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-lg font-extrabold text-[#29352F] mb-2">
                100% Client-Side Vision
              </h3>
              <p className="text-sm text-[#6B7C73] leading-relaxed">
                Google MediaPipe WASM runs locally in the browser RAM. Camera frames never leave the device, are never stored, and are discarded after landmark derivation.
              </p>
            </div>

            <div className="bg-[#FFFDF7] p-8 rounded-3xl border-2 border-[#EBE6D8] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF4E2] text-[#D9A441] flex items-center justify-center font-bold mb-6">
                <Sparkles size={26} />
              </div>
              <h3 className="text-lg font-extrabold text-[#29352F] mb-2">
                Anti-Repetition AI Engine
              </h3>
              <p className="text-sm text-[#6B7C73] leading-relaxed">
                Groq LLMs inject dynamic contextual seeds and recent question history so patients are never frustrated by stale, repeated prompts.
              </p>
            </div>

            <div className="bg-[#FFFDF7] p-8 rounded-3xl border-2 border-[#EBE6D8] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#F9ECE9] text-[#C96B5C] flex items-center justify-center font-bold mb-6">
                <Lock size={26} />
              </div>
              <h3 className="text-lg font-extrabold text-[#29352F] mb-2">
                Row-Level Cryptographic Security
              </h3>
              <p className="text-sm text-[#6B7C73] leading-relaxed">
                PostgreSQL database powered by Supabase with granular cryptographic policies ensuring strict multi-tenant isolation between families.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. CALL TO ACTION BANNER
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#29352F] to-[#1A231F] text-white p-8 sm:p-16 overflow-hidden shadow-2xl">
            
            {/* Ambient background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#6F8F7A]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D9A441]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 font-bold text-xs mb-4 backdrop-blur-xs">
                <Sparkles size={13} />
                <span>Smart India Hackathon 2026</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#FFFDF7] mb-6">
                Reactivate Memory & Movement Today
              </h2>
              <p className="text-base sm:text-lg text-white/80 font-medium leading-relaxed mb-8">
                Join families, caregivers, and therapists using Cognia to slow cognitive drift, enhance emotional connection, and preserve personhood.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/app"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] text-white font-extrabold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch Application</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/app/login"
                  className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-[#FFFDF7] font-bold text-base border border-white/20 backdrop-blur-xs transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. FOOTER
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#FFFDF7] border-t border-[#E8E2D2] pt-14 pb-10 text-xs text-[#6B7C73]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#EAE5D9]">
            
            {/* Brand column */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src="/dementia-webapp-logo.png" 
                  alt="Cognia Logo" 
                  className="w-8 h-8 object-contain" 
                />
                <span className="text-lg font-extrabold text-[#29352F] tracking-tight">Cognia</span>
              </div>
              <p className="text-xs text-[#829188] max-w-sm leading-relaxed mb-4">
                Privacy-first dual-task exergaming & person-centered cognitive therapeutic companion for Mild Cognitive Impairment (MCI) and Dementia care.
              </p>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#56675E] bg-[#F7F4EC] px-3 py-1 rounded-md border border-[#E3DEC3]">
                Developed for Smart India Hackathon 2026 &bull; Team Elite Control
              </div>
            </div>

            {/* Navigation Column */}
            <div className="md:col-span-3">
              <div className="font-extrabold text-[#29352F] uppercase tracking-wider mb-3">
                Platform
              </div>
              <ul className="space-y-2 font-medium">
                <li><Link href="/app" className="hover:text-[#29352F] transition-colors">Launch Cognia App</Link></li>
                <li><Link href="/app/login" className="hover:text-[#29352F] transition-colors">Caregiver Sign In</Link></li>
                <li><a href="#science" className="hover:text-[#29352F] transition-colors">Neurobiological Science</a></li>
                <li><a href="#session-loop" className="hover:text-[#29352F] transition-colors">6-Step Session Loop</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="md:col-span-4">
              <div className="font-extrabold text-[#29352F] uppercase tracking-wider mb-3">
                Compliance & Legal
              </div>
              <ul className="space-y-2 font-medium">
                <li><Link href="/terms" className="hover:text-[#29352F] transition-colors">Terms of Service & Medical Disclaimer</Link></li>
                <li><Link href="/privacy" className="hover:text-[#29352F] transition-colors">Privacy Policy & MediaPipe Guarantees</Link></li>
              </ul>
              <p className="text-[11px] text-[#8E9F95] mt-4 leading-relaxed">
                Notice: Cognia is an adjunctive digital cognitive wellness companion and is not an FDA/CE cleared medical diagnostic device. Always consult licensed healthcare professionals.
              </p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E9F95]">
            <p>&copy; 2026 Cognia Platform. Team Elite Control. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-[#29352F]">Terms</Link>
              <span>&bull;</span>
              <Link href="/privacy" className="hover:text-[#29352F]">Privacy</Link>
              <span>&bull;</span>
              <Link href="/app" className="hover:text-[#29352F]">App Portal</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}
