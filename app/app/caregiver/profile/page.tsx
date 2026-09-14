'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { 
  User, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Save, 
  Calendar,
  Sparkles
} from 'lucide-react'

export default function CaregiverProfilePage() {
  const router = useRouter()
  const [caregiver, setCaregiver] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [googleId, setGoogleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('care_companion_caregiver')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCaregiver(parsed)
        setFullName(parsed.full_name || '')
        setEmail(parsed.email || '')
        setAvatarUrl(parsed.avatar_url || parsed.preferences?.avatar_url || '')
        setGoogleId(parsed.google_id || parsed.preferences?.google_id || '')
      } catch (e) {
        console.error('Failed to parse caregiver profile:', e)
      }
    } else {
      router.replace('/app')
    }
  }, [router])

  async function saveProfile() {
    if (!caregiver?.id) return

    // Don't save if it hasn't changed
    if (fullName.trim() === (caregiver.full_name || '')) return;

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim()
        })
        .eq('id', caregiver.id)
        .select('id, full_name, email, role, preferences')
        .single()

      if (updateError) throw updateError

      const updatedProfile = {
        ...caregiver,
        full_name: data?.full_name || fullName.trim(),
        avatar_url: avatarUrl,
        preferences: data?.preferences || caregiver.preferences
      }

      setCaregiver(updatedProfile)
      localStorage.setItem('care_companion_caregiver', JSON.stringify(updatedProfile))
      setSuccessMessage('Profile auto-saved!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to update profile details.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('care_companion_caregiver')
    router.replace('/app')
  }

  if (!caregiver) {
    return (
      <div className="min-h-screen bg-[#F7F4EC] dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6F8F7A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const initials = (fullName || email || 'C')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#F4F8F5] to-[#ECF2EE] dark:from-[#131B17] dark:via-[#16201B] dark:to-[#0F1612] text-[#29352F] dark:text-[#F7F4EC] flex flex-col transition-colors">
      <Header 
        userName={caregiver.full_name}
        userEmail={caregiver.email}
        avatarUrl={avatarUrl}
        roleTitle="Caregiver"
        onLogout={handleLogout}
        showSwitchToCaregiver={false}
      />

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex-1">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/app/caregiver"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#6B7C73] dark:text-[#A3B3AA] hover:text-[#29352F] dark:hover:text-[#F7F4EC] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[#FFFDF7] via-[#FAFDFB] to-[#F5F8F5] dark:from-[#1E2922] dark:via-[#1A251F] dark:to-[#16201A] border-2 border-[#E8EFEA] dark:border-[#2F3F36] rounded-3xl p-6 sm:p-8 shadow-sm">
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E8EFEA] dark:border-[#28372E]">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={fullName || 'Caregiver Avatar'} 
                className="w-16 h-16 rounded-full object-cover border-3 border-[#6F8F7A] shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6F8F7A] to-[#526F5D] text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-[#29352F] dark:text-[#F7F4EC] m-0">
                {fullName || 'Caregiver User'}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8EFEA] dark:bg-[#28372E] text-[#577361] dark:text-[#A5C4B7] inline-block mt-1">
                Caregiver Account
              </span>
            </div>
          </div>

          {successMessage && (
            <div className="p-3.5 mb-5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 mb-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#577361] dark:text-[#8BAFA0] uppercase tracking-wider">
                  Full Name
                </label>
                {loading && <span className="text-xs text-[#6F8F7A] dark:text-[#8BAFA0] animate-pulse">Saving...</span>}
              </div>
              <div className="relative flex items-center">
                <User size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={saveProfile}
                  required
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] dark:border-[#33423A] bg-white dark:bg-[#1E2922] text-sm focus:outline-none focus:border-[#6F8F7A] text-[#29352F] dark:text-[#F7F4EC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#577361] dark:text-[#8BAFA0] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-3.5 text-[#8E9F95] pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C8] dark:border-[#33423A] bg-slate-100 dark:bg-[#16201B] text-sm text-[#8E9F95] dark:text-[#A3B3AA] cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[#8E9F95] dark:text-[#6B7C73] mt-1">
                Your primary registered email is used for authentication and patient reports.
              </p>
            </div>

            {googleId && (
              <div className="p-3 bg-[#E8EFEA]/50 dark:bg-[#16201B]/80 rounded-xl border border-[#6F8F7A]/25 dark:border-[#33423A] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#6F8F7A] dark:text-[#8BAFA0]" />
                  <span className="font-semibold text-[#29352F] dark:text-[#F7F4EC]">Connected with Google</span>
                </div>
                <span className="text-[11px] font-mono text-[#577361] dark:text-[#8BAFA0]">Linked</span>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  )
}
