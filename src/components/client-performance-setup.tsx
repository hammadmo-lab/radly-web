'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/register-sw'
import { reportWebVitals } from '@/lib/web-vitals'

export function ClientPerformanceSetup() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker()
    
    // Report web vitals
    reportWebVitals()
  }, [])

  return null
}
