'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

interface MobileGenerateLoadingProps {
  jobStatus?: { status: string; progress?: number } | null
}

export function MobileGenerateLoading({ jobStatus }: MobileGenerateLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--ds-bg-gradient)] text-white pt-20 pb-24 px-6"
      style={{ paddingTop: 'max(2rem, calc(env(safe-area-inset-top) + 1rem))' }}
    >
      {/* Animated spinner - multiple rotating circles */}
      <div className="mb-12 flex items-center justify-center">
        <motion.div
          className="absolute w-20 h-20 border-4 border-transparent border-t-[#4B8EFF] border-r-[#8F82FF] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-16 h-16 border-4 border-transparent border-b-[#2653FF] rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center dot */}
        <div className="w-3 h-3 bg-gradient-to-br from-[#4B8EFF] to-[#8F82FF] rounded-full" />
      </div>

      {/* Text content */}
      <div className="text-center space-y-3 max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
          ASSISTANT AT WORK
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
          Generating your report
        </h2>
        <p className="text-sm text-white/70 leading-relaxed">
          Radly is aligning findings, impressions, and recommendations. You'll see the report in just a moment.
        </p>
      </div>

      {/* Animated pulse dots */}
      <div className="mt-12 flex gap-2 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#4B8EFF] rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      {/* Job status indicator */}
      {jobStatus && (
        <div className="mt-12 text-center">
          <p className="text-xs text-white/50 uppercase tracking-wider">
            Status: <span className="capitalize text-white/70 font-medium">{jobStatus.status}</span>
          </p>
          {jobStatus.progress !== undefined && (
            <p className="text-xs text-white/50 mt-1">
              Progress: {Math.round(jobStatus.progress)}%
            </p>
          )}
        </div>
      )}
    </div>
  )
}
