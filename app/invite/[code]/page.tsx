'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function InviteRedirect() {
  const router = useRouter()
  const params = useParams()
  const code = (params?.code as string) || ''

  useEffect(() => {
    if (code) {
      router.replace(`/app/invite/${code}`)
    } else {
      router.replace('/app')
    }
  }, [code, router])

  return (
    <div className="min-h-screen bg-[#F7F4EC] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#6F8F7A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#6B7C73]">Opening Invitation...</p>
      </div>
    </div>
  )
}
