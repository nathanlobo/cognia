import Link from 'next/link'
import { Brain, HeartHandshake, Sparkles, Sun, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#29352F] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 select-none">
      <div className="w-full max-w-3xl text-center flex flex-col items-center animate-in fade-in duration-300">
        
        {/* Brand Logo & Pill */}
        <div className="flex items-center gap-2 bg-[#E8EFEA] text-[#6F8F7A] font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full border border-[#D4E4DC] mb-6 shadow-2xs">
          <Sparkles size={16} className="text-[#D9A441]" />
          <span>Warm Daily Cognitive Wellness Companion</span>
        </div>

        <img 
          src="/dementia-webapp-logo.png" 
          alt="Cognia Logo" 
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-4 drop-shadow-xs" 
        />

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#29352F] tracking-tight mb-3">
          Cognia
        </h1>

        <p className="text-lg sm:text-xl text-[#47554E] max-w-xl mx-auto mb-10 leading-relaxed font-medium">
          A gentle, joyful companion for memory, movement, and daily connection. Zero stress, zero test scores.
        </p>

        {/* 2 Main Entry Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
          {/* Patient Portal Card */}
          <Link href="/patient" className="no-underline group">
            <div className="h-full p-8 rounded-3xl bg-[#FFFDF7] border-2 border-[#EBE6D8] group-hover:border-[#6F8F7A] group-hover:shadow-md transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-xs">
              <div className="w-20 h-20 rounded-full bg-[#E8EFEA] text-[#6F8F7A] flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition-transform">
                🌿
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29352F] mb-1">
                Patient Portal
              </h2>
              <p className="text-sm sm:text-base text-[#6B7C73] font-medium leading-relaxed">
                Daily journey, memory lane, breathing & brain games.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-sm text-[#6F8F7A]">
                <span>Enter Companion</span>
                <span>&rarr;</span>
              </span>
            </div>
          </Link>

          {/* Caregiver Portal Card */}
          <Link href="/caregiver" className="no-underline group">
            <div className="h-full p-8 rounded-3xl bg-[#FFFDF7] border-2 border-[#EBE6D8] group-hover:border-[#D9A441] group-hover:shadow-md transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-xs">
              <div className="w-20 h-20 rounded-full bg-[#FFF8EC] text-[#D9A441] flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition-transform">
                💌
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29352F] mb-1">
                Caregiver Hub
              </h2>
              <p className="text-sm sm:text-base text-[#6B7C73] font-medium leading-relaxed">
                Assign daily love notes, add photos & view gentle insights.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-sm text-[#D9A441]">
                <span>Open Dashboard</span>
                <span>&rarr;</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Clinical & Compassionate Footer Badge */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6B7C73] font-semibold bg-[#FFFDF7] px-5 py-2.5 rounded-full border border-[#EBE6D8]">
          <ShieldCheck size={18} className="text-[#6F8F7A]" />
          <span>Designed with dementia therapists & cognitive care researchers</span>
        </div>
      </div>
    </div>
  )
}
