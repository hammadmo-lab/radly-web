/**
 * Web Vitals monitoring for performance tracking
 */
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals'

function sendToAnalytics(metric: Metric) {
  // Send to your analytics service
  // For now, just log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
  }
  
  // Example: Send to Google Analytics
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: Math.round(metric.value),
  //     metric_id: metric.id,
  //     metric_value: metric.value,
  //     metric_delta: metric.delta,
  //   })
  // }
  
  // Example: Send to custom analytics endpoint
  // if (typeof window !== 'undefined') {
  //   fetch('/api/analytics/web-vitals', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(metric),
  //   }).catch(console.error)
  // }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics)
  onINP(sendToAnalytics)
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}

/**
 * Performance monitoring utilities
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined') return null
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  
  return {
    // Core Web Vitals
    lcp: getLCP(),
    inp: getINP(),
    cls: getCLS(),
    
    // Additional metrics
    fcp: getFCP(),
    ttfb: navigation?.responseStart - navigation?.requestStart,
    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
    loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
  }
}

function getLCP(): number | null {
  const entries = performance.getEntriesByType('largest-contentful-paint')
  return entries.length > 0 ? entries[entries.length - 1].startTime : null
}

function getINP(): number | null {
  // INP is calculated differently - this is a simplified version
  // In a real implementation, you'd use the web-vitals library
  return null
}

function getCLS(): number {
  let clsValue = 0
  const entries = performance.getEntriesByType('layout-shift')
  
  for (const entry of entries) {
    const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
    if (!layoutShiftEntry.hadRecentInput) {
      clsValue += layoutShiftEntry.value || 0
    }
  }
  
  return clsValue
}

function getFCP(): number | null {
  const entries = performance.getEntriesByType('paint')
  const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
  return fcpEntry ? fcpEntry.startTime : null
}
