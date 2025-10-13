'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2, Lightbulb, Users, CheckCircle2, AlertCircle, Brain, FileText, Sparkles, Target, Clipboard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

// Fun medical facts to entertain users while waiting
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
  { icon: "🔍", text: "Analyzing findings...", duration: 2000 },
  { icon: "🧠", text: "Consulting AI radiology expert...", duration: 3000 },
  { icon: "📝", text: "Drafting impression...", duration: 2500 },
  { icon: "✨", text: "Polishing professional language...", duration: 2000 },
  { icon: "🎯", text: "Ensuring clinical accuracy...", duration: 2500 },
  { icon: "📋", text: "Formatting your report...", duration: 1500 }
]

export default function GenerateLoading({
  visible,
  status = 'queued',
  title = 'Generating your report',
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
  const prefersReducedMotion = useReducedMotion()

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm"
      role="dialog"
      aria-live="polite"
      aria-label="Generating report"
    >
      {/* Animated medical icon */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-6xl mb-6"
      >
        {currentState.icon}
      </motion.div>

      {/* Progress bar with glow effect */}
      <div className="w-full max-w-md mb-8">
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-accent to-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute h-full w-20 bg-white/30 blur-sm rounded-full"
            animate={{ x: [-80, 400] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-center mt-2 text-sm text-muted-foreground">
          {progress}% complete
        </p>
      </div>

      {/* Current state with animation */}
      <motion.p
        key={currentState.text}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-xl font-medium text-foreground mb-8"
      >
        {currentState.text}
      </motion.p>

      {/* Fun fact card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mb-6"
      >
        <Card className="border-2 border-accent/20 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              While you wait...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {currentFact}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Queue position and time info */}
      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        {queuePosition > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Position in queue: {queuePosition}
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <span aria-label="Elapsed time">{time}</span>
          <span>•</span>
          <span>Estimated: {estimatedTime}s</span>
        </motion.div>
      </div>

      {/* Cancel button */}
      {onCancel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel Generation
          </button>
        </motion.div>
      )}

      {/* Hint text */}
      {hint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-muted-foreground text-center max-w-md"
        >
          {hint}
        </motion.p>
      )}
    </motion.div>
  )
}