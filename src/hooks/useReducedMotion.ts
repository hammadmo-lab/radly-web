'use client';

import { useSyncExternalStore } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      // Subscribe to media query changes
      if (typeof window === 'undefined' || !window.matchMedia) {
        return () => {};
      }

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', callback);
        return () => mediaQuery.removeEventListener('change', callback);
      }
      // Older browsers (Safari < 14)
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(callback);
        return () => mediaQuery.removeListener(callback);
      }

      return () => {};
    },
    () => {
      // Get current snapshot
      if (typeof window === 'undefined' || !window.matchMedia) {
        return false;
      }
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    () => false // Server snapshot
  );
}
