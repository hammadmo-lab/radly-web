'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to prevent button unresponsiveness issues
 * Provides cleanup utilities and event handler optimization
 */
export function useButtonResponsiveness() {
  const cleanupRef = useRef<(() => void)[]>([])

  // Add cleanup function
  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current.push(cleanup)
  }, [])

  // Clean up all registered cleanup functions
  const cleanup = useCallback(() => {
    cleanupRef.current.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.warn('Cleanup function error:', error)
      }
    })
    cleanupRef.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return { addCleanup, cleanup }
}

/**
 * Enhanced button click handler that prevents double-clicks and handles cleanup
 */
export function useSafeClickHandler(
  handler: () => void | Promise<void>,
  options: {
    preventDoubleClick?: boolean
    cleanupOnError?: boolean
  } = {}
) {
  const { preventDoubleClick = true, cleanupOnError = true } = options
  const isProcessingRef = useRef(false)
  const { cleanup } = useButtonResponsiveness()

  return useCallback(async (e?: React.MouseEvent) => {
    // Prevent default behavior
    e?.preventDefault()
    e?.stopPropagation()

    // Prevent double clicks
    if (preventDoubleClick && isProcessingRef.current) {
      return
    }

    try {
      isProcessingRef.current = true
      await handler()
    } catch (error) {
      console.error('Button click handler error:', error)
      
      if (cleanupOnError) {
        cleanup()
      }
    } finally {
      isProcessingRef.current = false
    }
  }, [handler, preventDoubleClick, cleanupOnError, cleanup])
}

/**
 * Hook to manage intervals safely
 */
export function useSafeInterval(
  callback: () => void,
  delay: number | null,
  options: {
    immediate?: boolean
    cleanupOnError?: boolean
  } = {}
) {
  const { immediate = false, cleanupOnError = true } = options
  const { addCleanup } = useButtonResponsiveness()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (delay === null) return

    if (immediate) {
      callback()
    }

    intervalRef.current = setInterval(() => {
      try {
        callback()
      } catch (error) {
        console.error('Interval callback error:', error)
        
        if (cleanupOnError) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
        }
      }
    }, delay)

    // Register cleanup
    addCleanup(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    })

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [callback, delay, immediate, cleanupOnError, addCleanup])
}

/**
 * Hook to manage timeouts safely
 */
export function useSafeTimeout(
  callback: () => void,
  delay: number | null,
  options: {
    cleanupOnError?: boolean
  } = {}
) {
  const { cleanupOnError = true } = options
  const { addCleanup } = useButtonResponsiveness()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (delay === null) return

    timeoutRef.current = setTimeout(() => {
      try {
        callback()
      } catch (error) {
        console.error('Timeout callback error:', error)
        
        if (cleanupOnError) {
          // Timeout already executed, no need to clear
        }
      }
    }, delay)

    // Register cleanup
    addCleanup(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    })

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [callback, delay, cleanupOnError, addCleanup])
}
