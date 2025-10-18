/**
 * Safe polling hook with tab visibility detection and exponential backoff
 * Reduces Cloudflare Worker request usage by polling at 10-15s intervals
 * and pausing when tab is hidden
 */
import { useEffect, useRef, useCallback, useState } from 'react'

interface UseSafePollingOptions {
  /** Base interval in milliseconds (default: 12000 = 12s) */
  baseInterval?: number
  /** Maximum interval for exponential backoff (default: 60000 = 60s) */
  maxInterval?: number
  /** Whether to pause when tab is hidden (default: true) */
  pauseWhenHidden?: boolean
  /** Whether to run immediately on mount (default: true) */
  immediate?: boolean
  /** Whether to cleanup on error (default: true) */
  cleanupOnError?: boolean
  /** Custom backoff multiplier (default: 1.5) */
  backoffMultiplier?: number
  /** Reset backoff on successful requests (default: true) */
  resetBackoffOnSuccess?: boolean
}

interface UseSafePollingReturn {
  /** Whether polling is currently active */
  isPolling: boolean
  /** Whether the tab is currently visible */
  isVisible: boolean
  /** Current polling interval */
  currentInterval: number
  /** Manually trigger a poll */
  triggerPoll: () => void
  /** Pause polling */
  pause: () => void
  /** Resume polling */
  resume: () => void
}

export function useSafePolling(
  callback: () => void | Promise<void>,
  options: UseSafePollingOptions = {}
): UseSafePollingReturn {
  const {
    baseInterval = 12000, // 12 seconds
    maxInterval = 60000, // 60 seconds
    pauseWhenHidden = true,
    immediate = true,
    cleanupOnError = true,
    backoffMultiplier = 1.5,
    resetBackoffOnSuccess = true,
  } = options

  const [isPolling, setIsPolling] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [currentInterval, setCurrentInterval] = useState(baseInterval)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const backoffCountRef = useRef(0)
  const isMountedRef = useRef(true)

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const scheduleNextPoll = useCallback(() => {
    if (!isMountedRef.current || !isPolling || (!isVisible && pauseWhenHidden)) {
      return
    }

    clearCurrentTimeout()
    
    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return

      try {
        await callback()
        
        // Reset backoff on successful request
        if (resetBackoffOnSuccess) {
          backoffCountRef.current = 0
          setCurrentInterval(baseInterval)
        }
        
        // Schedule next poll
        scheduleNextPoll()
      } catch (error) {
        console.error('Polling callback error:', error)
        
        // Apply exponential backoff on error
        backoffCountRef.current++
        const newInterval = Math.min(
          baseInterval * Math.pow(backoffMultiplier, backoffCountRef.current),
          maxInterval
        )
        setCurrentInterval(newInterval)
        
        if (cleanupOnError) {
          console.warn('Polling stopped due to error')
          setIsPolling(false)
          return
        }
        
        // Schedule next poll with backoff
        scheduleNextPoll()
      }
    }, currentInterval)
  }, [callback, isPolling, isVisible, pauseWhenHidden, currentInterval, baseInterval, maxInterval, backoffMultiplier, resetBackoffOnSuccess, cleanupOnError, clearCurrentTimeout])

  // Track tab visibility
  useEffect(() => {
    if (!pauseWhenHidden) return

    const handleVisibilityChange = () => {
      const visible = !document.hidden
      setIsVisible(visible)
      
      if (visible && isPolling) {
        // Resume polling when tab becomes visible
        scheduleNextPoll()
      } else if (!visible) {
        // Pause polling when tab is hidden
        clearCurrentTimeout()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [pauseWhenHidden, isPolling, scheduleNextPoll, clearCurrentTimeout])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      clearCurrentTimeout()
    }
  }, [clearCurrentTimeout])

  // Start/stop polling based on isPolling state
  useEffect(() => {
    if (isPolling && (isVisible || !pauseWhenHidden)) {
      if (immediate) {
        // Run immediately on mount/resume
        Promise.resolve(callback()).catch(console.error)
      }
      scheduleNextPoll()
    } else {
      clearCurrentTimeout()
    }

    return clearCurrentTimeout
  }, [isPolling, isVisible, pauseWhenHidden, immediate, callback, scheduleNextPoll, clearCurrentTimeout])

  const triggerPoll = useCallback(async () => {
    try {
      await callback()
      // Reset backoff on manual trigger success
      if (resetBackoffOnSuccess) {
        backoffCountRef.current = 0
        setCurrentInterval(baseInterval)
      }
    } catch (error) {
      console.error('Manual poll error:', error)
    }
  }, [callback, resetBackoffOnSuccess, baseInterval])

  const pause = useCallback(() => {
    setIsPolling(false)
    clearCurrentTimeout()
  }, [clearCurrentTimeout])

  const resume = useCallback(() => {
    setIsPolling(true)
    // Will be handled by the useEffect above
  }, [])

  return {
    isPolling,
    isVisible,
    currentInterval,
    triggerPoll,
    pause,
    resume,
  }
}

/**
 * Specialized hook for job status polling with exponential backoff
 * Optimized for /v1/jobs/:id endpoint polling
 */
export function useJobStatusPolling(
  callback: () => void | Promise<void>,
  options: Omit<UseSafePollingOptions, 'baseInterval' | 'maxInterval'> = {}
) {
  return useSafePolling(callback, {
    baseInterval: 10000, // 10 seconds for job status
    maxInterval: 120000, // 2 minutes max
    backoffMultiplier: 2.0, // More aggressive backoff for job polling
    ...options,
  })
}

/**
 * Specialized hook for queue stats polling
 * Optimized for /v1/queue/stats endpoint polling
 */
export function useQueueStatsPolling(
  callback: () => void | Promise<void>,
  options: Omit<UseSafePollingOptions, 'baseInterval' | 'maxInterval'> = {}
) {
  return useSafePolling(callback, {
    baseInterval: 15000, // 15 seconds for queue stats
    maxInterval: 60000, // 1 minute max
    backoffMultiplier: 1.5, // Moderate backoff for stats
    ...options,
  })
}
