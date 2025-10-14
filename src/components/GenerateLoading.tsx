'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react'

interface GenerateLoadingProps {
  jobId?: string
  queuePosition?: number | null
  estimatedTime?: string | null
}

export function GenerateLoading({ jobId, queuePosition, estimatedTime }: GenerateLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)

  const facts = [
    "🔬 Analyzing imaging parameters...",
    "🧬 Processing anatomical landmarks...",
    "⚡ Generating clinical observations...",
    "📝 Formatting medical terminology...",
    "✨ Finalizing report structure...",
  ]

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        return prev + Math.random() * 5
      })
    }, 800)

    // Rotate facts
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % facts.length)
    }, 3000)

    return () => {
      clearInterval(interval)
      clearInterval(factInterval)
    }
  }, [facts.length])

  const steps = [
    { label: 'Received', completed: true },
    { label: 'Processing', completed: progress > 30 },
    { label: 'Generating', completed: progress > 60 },
    { label: 'Finalizing', completed: progress > 90 },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-6">
      <div className="w-full max-w-3xl">
        {/* ANIMATED HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* ANIMATED ICON */}
          <motion.div
            className="inline-flex p-8 rounded-full bg-gradient-to-br from-emerald-500 to-violet-500 shadow-2xl mb-6"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Generating Your Report
          </h1>

          {/* ROTATING FACTS */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentFactIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-2xl text-gray-600 font-medium"
            >
              {facts[currentFactIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* MAIN CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl overflow-hidden"
        >
          {/* PROGRESS SECTION */}
          <div className="p-10 space-y-8">
            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-700">Progress</span>
                <span className="text-3xl font-bold text-emerald-600">
                  {Math.round(progress)}%
                </span>
              </div>
              
              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
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

            {/* STEPS TIMELINE */}
            <div className="flex justify-between items-center relative pt-4">
              {/* Connection line */}
              <div className="absolute top-9 left-0 right-0 h-1 bg-gray-200 rounded-full" />
              
              {steps.map((step, index) => (
                <div key={step.label} className="flex flex-col items-center relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-500
                      ${step.completed 
                        ? 'bg-gradient-to-br from-emerald-500 to-violet-500 text-white shadow-lg scale-110' 
                        : 'bg-white border-4 border-gray-200 text-gray-400'
                      }
                    `}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-7 h-7" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                    )}
                  </motion.div>
                  <span className={`
                    text-sm font-semibold transition-colors
                    ${step.completed ? 'text-emerald-600' : 'text-gray-400'}
                  `}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

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

            {/* PRO TIP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Pro Tip</h3>
                  <p className="text-gray-700">
                    Reports are automatically saved. You can safely close this page and return later to view your completed report in the Reports section.
                  </p>
                </div>
              </div>
            </motion.div>
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