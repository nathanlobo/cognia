'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
}

interface EditProfileModalProps {
  profile: Profile
  onClose: () => void
  onSave: (updatedProfile: Profile) => void
}

export default function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [email, setEmail] = useState(profile.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim()
        })
        .eq('id', profile.id)
        .select('id, full_name, email, role')
        .single()

      if (updateError) throw updateError

      // If RLS returned 0 rows but no error (e.g., if there was no UPDATE policy for this row)
      if (!data) {
        throw new Error('Failed to update profile. Please verify database permissions.')
      }

      onSave(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        <div className="bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] text-white px-6 py-5">
          <h2 className="text-xl font-bold">Edit Profile</h2>
        </div>
        
        <div className="p-6 sm:p-8 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#6F8F7A] focus:ring-2 focus:ring-[#6F8F7A]/30 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#6F8F7A] via-[#5F7F6B] to-[#526F5D] hover:from-[#577361] hover:to-[#4A6855] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
