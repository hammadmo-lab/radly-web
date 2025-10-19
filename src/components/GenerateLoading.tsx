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
import { FloatingMedicalIcons } from './loading/FloatingMedicalIcons'
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

    switch (jobStatus.status) {
      case 'queued':
        setProgress(5)
        break
      case 'running':
        setProgress(25)
        break
      case 'done':
        setProgress(100)
        break
      case 'error':
        setProgress(0)
        break
      default:
        setProgress(0)
    }
  }, [jobStatus])

  // Safe polling for progress animation
  useSafePolling(() => {
    if (!jobStatus || jobStatus.status === 'done' || jobStatus.status === 'error') {
      return
    }
    
    setProgress(prev => {
      // Don't exceed the status-based progress
      const maxProgress = jobStatus.status === 'queued' ? 20 : 
                         jobStatus.status === 'running' ? 95 : prev
      
      if (prev >= maxProgress) return prev
      return prev + Math.random() * 3
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-4 sm:p-6 relative overflow-hidden">
      {/* Floating Background Icons */}
      <FloatingMedicalIcons />

      <div className="w-full max-w-6xl relative z-10">
        {/* ANIMATED HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* ANIMATED ICON */}
          <motion.div
            className="inline-flex p-6 sm:p-8 rounded-full bg-gradient-to-br from-emerald-500 to-violet-500 shadow-2xl mb-6"
            animate={{
              scale: jobStatus?.status === 'done' ? 1 : [1, 1.05, 1],
              rotate: jobStatus?.status === 'done' ? 0 : [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: jobStatus?.status === 'done' ? 0 : Infinity,
              ease: "easeInOut",
            }}
          >
            {jobStatus?.status === 'done' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </motion.div>
            )}
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {jobStatus?.status === 'done' ? 'Report Generated! 🎉' : 'Generating Your Report'}
          </h1>

          <p className="text-lg sm:text-xl text-gray-600">
            {jobStatus?.status === 'done'
              ? 'Your medical report is ready for review'
              : 'Please wait while we create your professional medical report'}
          </p>
        </motion.div>

        {/* MAIN CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl overflow-hidden"
        >
          {/* PROGRESS SECTION */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
            {/* Stats Display */}
            <StatsDisplay
              startTime={startTimeRef.current}
              jobStatus={jobStatus?.status as 'queued' | 'running' | 'done' | 'error'}
              estimatedSeconds={estimatedSecondsRemaining}
            />

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold text-gray-700">Overall Progress</span>
                <motion.span
                  key={Math.round(progress)}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-emerald-600"
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>

              <div className="relative h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{ width: '50%' }}
                />
              </div>
            </div>

            {/* Generation Steps */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Generation Progress</h3>
              <GenerationSteps
                currentProgress={progress}
                jobStatus={jobStatus?.status as 'queued' | 'running' | 'done' | 'error'}
              />
            </div>

            {/* Report Preview Skeleton */}
            {(jobStatus?.status === 'running' || progress > 30) && (
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Report Structure</h3>
                <ReportSkeleton progress={progress} />
              </div>
            )}

            {/* QUEUE INFO */}
            {(queuePosition !== null && queuePosition !== undefined && queuePosition > 0) ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Queue Position</p>
                    <p className="text-3xl font-bold text-blue-600">#{queuePosition}</p>
                  </div>
                  {estimatedTime && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600 mb-1">Estimated Wait</p>
                      <p className="text-2xl font-bold text-blue-600">{estimatedTime}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}

            {/* Medical Trivia / Educational Content */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Did You Know?</h3>
              <MedicalTrivia rotationInterval={5000} />
            </div>
          </div>

          {/* JOB ID FOOTER */}
          {jobId && (
            <div className="bg-gray-50 px-10 py-4 border-t-2 border-gray-100">
              <p className="text-sm text-gray-500 font-mono">
                Job ID: {jobId}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}