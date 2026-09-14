'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button 
        className="w-10 h-10 !min-h-0 !min-w-0 rounded-full p-2 text-slate-500 flex items-center justify-center opacity-50 cursor-not-allowed"
        style={{ minHeight: 'unset', width: '40px', height: '40px' }}
      >
        <Sun size={20} />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 !min-h-0 !min-w-0 rounded-full p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#E8EFEA]/60 dark:hover:bg-[#1E2922] flex items-center justify-center transition-colors cursor-pointer"
      style={{ minHeight: 'unset', width: '40px', height: '40px' }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
