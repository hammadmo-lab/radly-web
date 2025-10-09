'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type Props = {
  visible: boolean
  status?: 'queued' | 'running' | 'finalizing' | 'done' | 'error'
  title?: string
  hint?: string
  onCancel?: () => void
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}` }

export default function GenerateLoading({
  visible,
  status = 'queued',
  title = 'Generating your report',
  hint,
  onCancel
}: Props) {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!visible) return
    // start timer
    intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      intervalRef.current = null
      setSeconds(0)
    }
  }, [visible])

  // Stage label mapping
  const stageText = useMemo(() => {
    switch (status) {
      case 'queued': return 'Queued…'
      case 'running': return 'Analyzing findings…'
      case 'finalizing': return 'Finalizing formatting…'
      case 'done': return 'Done'
      case 'error': return 'Something went wrong'
      default: return 'Working…'
    }
  }, [status])

  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  const time = `${pad(mm)}:${pad(ss)}`

  // Indeterminate progress bar animation (pauses for reduced motion)
  const bar = (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-2 w-1/3 rounded-full bg-primary/90"
        initial={{ x: '-100%' }}
        animate={prefersReducedMotion ? { x: 0 } : { x: ['-100%', '120%'] }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
    </div>
  )

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Generating report"
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm"
    >
      <div className="w-[92vw] max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <div className="mt-4 space-y-3">
          {bar}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{stageText}</span>
            <span aria-label="Elapsed time">{time}</span>
          </div>

          {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}

          {/* Optional micro tips that update every ~10s */}
          <StageTips seconds={seconds} />
        </div>

        {onCancel && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StageTips({ seconds }: { seconds: number }) {
  const tips = useMemo(
    () => [
      'Pro tip: You can paste findings as bullets or free text.',
      'Reminder: Indication helps improve the Impression.',
      'Docs export as .docx — see the Export button on the result.',
      'Set your preferred template in Settings.',
    ],
    []
  )
  const index = Math.min(tips.length - 1, Math.floor(seconds / 10)) // change every 10s
  return <p className="text-xs text-muted-foreground/90">{tips[index]}</p>
}
