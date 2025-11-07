'use client'

import { useEffect, useState } from 'react'

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<{
    lcp?: number
    inp?: number
    cls?: number
    fcp?: number
    ttfb?: number
  }>({})
  
  useEffect(() => {
    // Only in development
    if (process.env.NODE_ENV !== 'development') return

    // Monitor long tasks (only log if very long > 200ms)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 200) {
              console.debug('Long task detected:', entry)
            }
          }
        })

        observer.observe({ entryTypes: ['longtask'] })

        return () => observer.disconnect()
      } catch (err) {
        // PerformanceObserver not supported or feature unavailable
        console.debug('PerformanceObserver not available:', err)
      }
    }
  }, [])
  
  useEffect(() => {
    // Only in development
    if (process.env.NODE_ENV !== 'development') return
    
    // Get performance metrics after page load
    const timer = setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      setMetrics({
        lcp: getLCP() ?? undefined,
        inp: getINP() ?? undefined,
        cls: getCLS(),
        fcp: getFCP() ?? undefined,
        ttfb: navigation?.responseStart - navigation?.requestStart,
      })
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-3 text-xs rounded-lg font-mono max-w-xs">
      <div className="font-bold mb-2">Performance Monitor</div>
      <div className="space-y-1">
        {metrics.lcp && <div>LCP: {metrics.lcp.toFixed(0)}ms</div>}
        {metrics.fcp && <div>FCP: {metrics.fcp.toFixed(0)}ms</div>}
        {metrics.ttfb && <div>TTFB: {metrics.ttfb.toFixed(0)}ms</div>}
        {metrics.cls !== undefined && <div>CLS: {metrics.cls.toFixed(3)}</div>}
        {metrics.inp && <div>INP: {metrics.inp.toFixed(0)}ms</div>}
      </div>
    </div>
  )
}

function getLCP(): number | null {
  try {
    const entries = performance.getEntriesByType('largest-contentful-paint')
    return entries.length > 0 ? entries[entries.length - 1].startTime : null
  } catch (err) {
    return null
  }
}

function getINP(): number | null {
  try {
    // INP is calculated differently - this is a simplified version
    // In a real implementation, you'd use the web-vitals library
    return null
  } catch (err) {
    return null
  }
}

function getCLS(): number {
  try {
    let clsValue = 0
    const entries = performance.getEntriesByType('layout-shift')

    for (const entry of entries) {
      const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value || 0
      }
    }

    return clsValue
  } catch (err) {
    return 0
  }
}

function getFCP(): number | null {
  const entries = performance.getEntriesByType('paint')
  const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
  return fcpEntry ? fcpEntry.startTime : null
}
