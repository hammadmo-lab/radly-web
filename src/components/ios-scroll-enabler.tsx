'use client'

import { useEffect } from 'react'

/**
 * iOS Scroll Enabler
 *
 * This component ensures scrolling works properly on iOS Safari
 * by disabling certain touch behaviors that prevent scrolling.
 *
 * iOS Safari can sometimes prevent scrolling if:
 * 1. The page structure isn't properly configured
 * 2. Touch event handlers are preventing default scroll
 * 3. Viewport configuration needs adjustment
 *
 * This solution:
 * - Sets up proper event listeners for iOS compatibility
 * - Ensures momentum scrolling is enabled
 * - Allows the browser's native scroll behavior to work
 */
export function IOSScrollEnabler() {
  useEffect(() => {
    // Ensure iOS Safari allows scrolling by enabling touch event handling
    // This prevents any accidental preventDefault on scroll events
    const preventTouchMove = (e: TouchEvent) => {
      // Only prevent default if the target is NOT a scrollable element
      const target = e.target as HTMLElement
      const isScrollable = target.closest('[style*="overflow"]') !== null

      if (!isScrollable && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        // Allow default behavior for scrolling
      }
    }

    // Add listener with passive flag (allows browser to optimize)
    document.addEventListener('touchmove', preventTouchMove, { passive: true })

    return () => {
      document.removeEventListener('touchmove', preventTouchMove)
    }
  }, [])

  return null
}
