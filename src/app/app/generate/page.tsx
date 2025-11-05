'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import web and mobile versions
const WebGeneratePage = dynamic(() => import('./web.page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
})

const MobileGeneratePage = dynamic(() => import('./mobile.page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0c1018] to-[#0a0e1a]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#4B8EFF] to-[#8F82FF] flex items-center justify-center animate-pulse">
          <div className="text-2xl">📝</div>
        </div>
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  ),
  ssr: false
})

export default function GeneratePageWrapper() {
  const [isNative, setIsNative] = useState<boolean | null>(null)

  useEffect(() => {
    // Detect Capacitor native at runtime
    if (typeof window !== 'undefined') {
      import('@capacitor/core').then(({ Capacitor }) => {
        setIsNative(Capacitor.isNativePlatform())
      }).catch(() => {
        setIsNative(false)
      })
    }
  }, [])

  // Show loading while detecting platform
  if (isNative === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0c1018] to-[#0a0e1a]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#4B8EFF] to-[#8F82FF] flex items-center justify-center animate-pulse">
            <div className="text-2xl">📝</div>
          </div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Use mobile version for native platforms, web version for web
  return isNative ? <MobileGeneratePage /> : <WebGeneratePage />
}
