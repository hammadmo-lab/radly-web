'use client'

import { useState, useEffect, Suspense, lazy } from 'react'

// Lazy load mobile and web versions
const MobileTemplatesPage = lazy(() => import('./mobile.page'))
const WebTemplatesPage = lazy(() => import('./web.page'))

// Loading fallback
function TemplatesLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

export default function TemplatesPageWrapper() {
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
    return <TemplatesLoadingFallback />
  }

  return (
    <Suspense fallback={<TemplatesLoadingFallback />}>
      {isNative ? <MobileTemplatesPage /> : <WebTemplatesPage />}
    </Suspense>
  )
}
