'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useSafePolling } from '@/hooks/useSafePolling'
import { JobStatusResponse } from '@/lib/jobs'
import { GenerationSteps } from './loading/GenerationSteps'
import { MedicalTrivia } from './loading/MedicalTrivia'
import { StatsDisplay } from './loading/StatsDisplay'
import { ReportSkeleton } from './loading/ReportSkeleton'
import { triggerCelebration, isCelebrationEnabled } from '@/utils/celebration'

interface GenerateLoadingProps {
  jobId?: string
  queuePosition?: number | null
  estimatedTime?: string | null
  jobStatus?: JobStatusResponse | null
}

export function GenerateLoading({ jobId, queuePosition, estimatedTime, jobStatus }: GenerateLoadingProps) {
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const celebrationTriggeredRef = useRef(false)

  // Track start time for elapsed time calculation
  useEffect(() => {
    if (jobStatus?.status === 'running' && startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
  }, [jobStatus])

  // Trigger celebration when report is done
  useEffect(() => {
    if (jobStatus?.status === 'done' && !celebrationTriggeredRef.current) {
      celebrationTriggeredRef.current = true
      if (isCelebrationEnabled()) {
        setTimeout(() => {
          triggerCelebration('success')
        }, 500)
      }
    }
  }, [jobStatus])

  // Update progress based on actual job status
  useEffect(() => {
    if (!jobStatus) {
      setProgress(0)
      return
    }

    if (jobStatus.status === 'queued') {
      setProgress(prev => {
        const baseline = (queuePosition ?? 0) > 0 ? 8 : 30
        if (jobStatus.progress !== undefined) {
          return Math.max(prev, jobStatus.progress)
        }
        return Math.max(prev, baseline)
      })
      return
    }

    if (jobStatus.status === 'running') {
      setProgress(prev => {
        if (jobStatus.progress !== undefined) {
          return Math.max(prev, jobStatus.progress)
        }
        return Math.max(prev, 35)
      })
      return
    }

    if (jobStatus.status === 'done') {
      setProgress(100)
      return
    }

    if (jobStatus.status === 'error') {
      setProgress(0)
      return
    }
  }, [jobStatus, queuePosition])

  // Safe polling for progress animation
  useSafePolling(() => {
    if (!jobStatus || jobStatus.status === 'done' || jobStatus.status === 'error') {
      return
    }

    setProgress(prev => {
      if (jobStatus.progress !== undefined) {
        const target = Math.max(prev, jobStatus.progress)
        if (target >= 100) return 100
        return target
      }

      const waiting = (queuePosition ?? 0) > 0
      const maxProgress = jobStatus.status === 'queued'
        ? (waiting ? 25 : 80)
        : 95
      if (prev >= maxProgress) return prev
      return Math.min(maxProgress, prev + Math.random() * 2.5)
    })
  }, { 
    baseInterval: 1000, // Keep 1s for UI animation
    maxInterval: 2000, // Max 2s for UI
    pauseWhenHidden: false, // Don't pause UI animations
    immediate: false 
  })


  // Calculate estimated remaining time
  const estimatedSecondsRemaining = queuePosition && queuePosition > 0
    ? queuePosition * 30 // Rough estimate: 30 seconds per job
    : jobStatus?.status === 'running' ? 45 : undefined

  const isComplete = jobStatus?.status === 'done'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--ds-bg-gradient)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_20%_15%,rgba(75,142,255,0.25),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(143,130,255,0.2),transparent_60%)]" />
        <div className="absolute inset-y-0 -left-32 w-64 bg-[radial-gradient(circle,rgba(63,191,140,0.18),transparent_65%)]" />
        <div className="absolute inset-y-0 -right-48 w-72 bg-[radial-gradient(circle,rgba(248,183,77,0.16),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="hero-starfield rounded-[46px] px-8 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16"
        >
          <div className="hero-aurora" />

          <div className="relative space-y-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <motion.div
                className="flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(75,142,255,0.38)] bg-[rgba(12,16,28,0.75)] shadow-[0_32px_88px_rgba(31,64,175,0.5)]"
                animate={{
                  scale: isComplete ? 1 : [1, 1.04, 1],
                }}
                transition={{ duration: 1.8, repeat: isComplete ? 0 : Infinity, ease: 'easeInOut' }}
              >
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220 }}
                  >
                    <CheckCircle className="h-14 w-14 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="h-14 w-14 text-white" />
                  </motion.div>
                )}
              </motion.div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.5)]">
                  {isComplete ? 'Complete' : 'Assistant at work'}
                </p>
                <h1 className="text-3xl font-semibold sm:text-[3rem] sm:leading-[1.1]">
                  {isComplete ? 'Report ready for your review 🎉' : 'Generating your radiology report'}
                </h1>
                <p className="max-w-2xl text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
                  {isComplete
                    ? 'Radly assembled the report. Take a moment to review and finalize it with your clinical judgment.'
                    : 'Radly is aligning findings, impressions, and structured sections behind the scenes. We will bring you the draft shortly.'}
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-6">
                <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.5)]">
                      Overall progress
                    </span>
                    <motion.span
                      key={Math.round(progress)}
                      initial={{ scale: 1.1, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-semibold text-white"
                    >
                      {Math.round(progress)}%
                    </motion.span>
                  </div>
                  <div className="mt-4 h-3 w-full rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.75)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_50%,#8F82FF_100%)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(progress, 3)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <GenerationSteps
                    currentProgress={progress}
                    jobStatus={jobStatus?.status as 'queued' | 'running' | 'done' | 'error'}
                  />
                </div>

                {(queuePosition ?? 0) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="aurora-card border border-[rgba(75,142,255,0.28)] bg-[rgba(12,16,28,0.65)] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.5)]">Queue position</p>
                        <p className="text-3xl font-semibold text-white">#{queuePosition}</p>
                      </div>
                      {estimatedTime && (
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.5)]">Estimated wait</p>
                          <p className="text-2xl font-semibold text-white">{estimatedTime}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                <StatsDisplay
                  startTime={startTimeRef.current}
                  jobStatus={jobStatus?.status as 'queued' | 'running' | 'done' | 'error'}
                  estimatedSeconds={estimatedSecondsRemaining}
                />

                {(jobStatus?.status === 'running' || progress > 30) && (
                  <ReportSkeleton progress={progress} />
                )}

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.5)]">
                    Did you know?
                  </p>
                  <MedicalTrivia rotationInterval={5000} />
                </div>
              </div>
            </div>

            {jobId && (
              <div className="flex items-center justify-center text-xs font-mono uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
                Job ID: {jobId}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
