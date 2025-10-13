'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles, Zap, FileText, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface GenerateLoadingProps {
  jobId?: string
  queuePosition?: number | null
  estimatedTime?: string | null
}

export function GenerateLoading({ queuePosition, estimatedTime }: GenerateLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)

  const medicalFacts = [
    "Analyzing imaging parameters...",
    "Processing anatomical landmarks...",
    "Generating clinical observations...",
    "Formatting medical terminology...",
    "Finalizing report structure...",
  ]

  const steps = [
    { label: 'Received', icon: Check, completed: true },
    { label: 'Processing', icon: Zap, completed: progress > 30 },
    { label: 'Generating', icon: Sparkles, completed: progress > 60 },
    { label: 'Finalizing', icon: FileText, completed: progress > 90 },
  ]

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 3
      })
    }, 500)

    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % medicalFacts.length)
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(factInterval)
    }
  }, [medicalFacts.length])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-gray-100 overflow-hidden">
        {/* Header with Animated Icon */}
        <div className="bg-gradient-to-r from-emerald-500 to-violet-500 p-8 text-center">
          <motion.div
            className="inline-flex p-6 rounded-full bg-white/20 backdrop-blur-lg mb-4"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Loader2 className="w-12 h-12 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            Generating Your Report
          </h2>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={currentFactIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-white/90 text-lg"
            >
              {medicalFacts[currentFactIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Section */}
        <div className="p-8 space-y-8">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">Progress</span>
              <span className="font-bold text-emerald-600">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 shimmer opacity-30" />
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="flex justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
            {steps.map((step) => (
              <div key={step.label} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  step.completed
                    ? "bg-gradient-to-br from-emerald-500 to-violet-500 text-white shadow-lg"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  step.completed ? "text-emerald-600" : "text-gray-400"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Queue Info */}
          {queuePosition && queuePosition > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Queue Position</p>
                <p className="text-xs text-gray-600">You&apos;re #{queuePosition} in line</p>
              </div>
              {estimatedTime && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">{estimatedTime}</p>
                  <p className="text-xs text-gray-600">estimated wait</p>
                </div>
              )}
            </div>
          )}

          {/* Pro Tip */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Pro Tip</p>
                <p className="text-sm text-gray-600">
                  Reports are automatically saved. You can safely close this page and return later to view your report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}