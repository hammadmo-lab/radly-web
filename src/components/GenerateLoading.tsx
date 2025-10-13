'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Users, Clock, Zap, Brain, FileText, CheckCircle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Props = {
  visible: boolean
  status?: 'queued' | 'running' | 'finalizing' | 'done' | 'error'
  title?: string
  hint?: string
  onCancel?: () => void
  queuePosition?: number
  estimatedTime?: number
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}` }

// Enhanced medical facts with better formatting
const loadingFacts = [
  "Did you know? X-rays were discovered by accident in 1895 by Wilhelm Röntgen.",
  "Fun fact: The human body glows! We emit biophotons, but they're too weak to see.",
  "Radiology tidbit: MRI scanners are so loud because of the Lorentz forces in action.",
  "Medical history: The first CT scan took 2.5 hours. Now it takes seconds!",
  "Amazing fact: Your heart beats about 100,000 times per day.",
  "Did you know? Medical imaging has helped identify over 400 different diseases.",
  "Fun fact: The 'funny bone' isn't a bone at all—it's your ulnar nerve!",
  "Radiology fact: Ultrasound uses sound waves, not radiation.",
  "Medical marvel: A single DNA strand can stretch from Earth to Sun and back 600 times!",
  "Did you know? Medical AI can now detect some diseases earlier than humans.",
  "Fun fact: Your brain uses about 20% of your body's energy despite being only 2% of your weight.",
  "Radiology insight: The first mammogram was performed in 1913.",
  "Medical trivia: The smallest bone in your body is the stapes in your ear.",
  "Did you know? Medical imaging has reduced surgery rates by 30% in some specialties.",
  "Fun fact: Your body produces 25 million new cells every second!"
]

// Enhanced loading states with icons and descriptions
const loadingStates = [
  { icon: Brain, text: "Analyzing findings...", description: "Our AI is carefully reviewing your clinical data" },
  { icon: Zap, text: "Consulting AI radiology expert...", description: "Advanced algorithms are processing your case" },
  { icon: FileText, text: "Drafting impression...", description: "Creating a professional medical report" },
  { icon: Sparkles, text: "Polishing professional language...", description: "Ensuring clinical accuracy and clarity" },
  { icon: CheckCircle, text: "Ensuring clinical accuracy...", description: "Final quality checks and validation" },
  { icon: FileText, text: "Formatting your report...", description: "Preparing the final document" }
]

export default function GenerateLoading({
  visible,
  status = 'queued',
  hint,
  onCancel,
  queuePosition = 0,
  estimatedTime = 30
}: Props) {
  const [seconds, setSeconds] = useState(0)
  const [currentStateIndex, setCurrentStateIndex] = useState(0)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!visible) return
    
    // Start timer
    intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    
    // Cycle through loading states
    const stateInterval = setInterval(() => {
      setCurrentStateIndex((prev) => (prev + 1) % loadingStates.length)
    }, 3000)
    
    // Cycle through facts every 8 seconds
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % loadingFacts.length)
    }, 8000)
    
    // Simulate progress based on status
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (status === 'queued') return Math.min(prev + 2, 15)
        if (status === 'running') return Math.min(prev + 3, 75)
        if (status === 'finalizing') return Math.min(prev + 4, 95)
        return prev
      })
    }, 500)
    
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      clearInterval(stateInterval)
      clearInterval(factInterval)
      clearInterval(progressInterval)
      intervalRef.current = null
      setSeconds(0)
      setProgress(0)
    }
  }, [visible, status])

  const currentState = loadingStates[currentStateIndex]
  const currentFact = loadingFacts[currentFactIndex]
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  const time = `${pad(mm)}:${pad(ss)}`

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 backdrop-blur-lg"
      role="dialog"
      aria-live="polite"
      aria-label="Generating report"
    >
      {/* Main content container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Header with animated icon */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative inline-block mb-6"
          >
            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-50" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl">
              <currentState.icon className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-gradient mb-2">
            Generating Your Report
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Our AI is working hard to create your medical report
          </p>
        </div>

        {/* Progress section */}
        <Card className="mb-8 border-2 border-primary/20 shadow-xl">
          <CardContent className="p-6">
            {/* Current state */}
            <motion.div
              key={currentStateIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <currentState.icon className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {currentState.text}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentState.description}
              </p>
            </motion.div>

            {/* Enhanced progress bar */}
            <div className="mb-4">
              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute h-full bg-gradient-primary rounded-full shadow-lg"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute h-full w-20 bg-white/40 blur-sm rounded-full"
                  animate={{ x: [-80, 400] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-primary">
                  {progress}% complete
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {time} elapsed
                </span>
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex items-center justify-center gap-6 text-sm">
              {queuePosition > 0 && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Position: {queuePosition}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Est: {estimatedTime}s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fun fact card */}
        <motion.div
          key={currentFactIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-8"
        >
          <Card className="border-2 border-secondary/20 bg-gradient-subtle shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-secondary">
                <Lightbulb className="w-5 h-5" />
                Pro Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentFact}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              Cancel Generation
            </Button>
          )}
        </div>

        {/* Hint text */}
        {hint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mx-auto"
          >
            {hint}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}