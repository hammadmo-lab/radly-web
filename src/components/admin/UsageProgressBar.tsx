"use client"

import { motion } from 'framer-motion'

interface UsageProgressBarProps {
  used: number
  limit: number
  className?: string
}

export function UsageProgressBar({ used, limit, className = '' }: UsageProgressBarProps) {
  const percentage = Math.min((used / Math.max(limit, 1)) * 100, 100)

  const barClasses =
    percentage > 90
      ? 'bg-[linear-gradient(90deg,#FF6B6B_0%,#FF9F6B_100%)] shadow-[0_8px_18px_rgba(255,107,107,0.32)]'
      : percentage > 70
        ? 'bg-[linear-gradient(90deg,#F8B74D_0%,#FF8A4F_100%)] shadow-[0_8px_18px_rgba(248,183,77,0.26)]'
        : 'bg-[linear-gradient(90deg,#3FBF8C_0%,#6EE7B7_100%)] shadow-[0_8px_18px_rgba(63,191,140,0.32)]'

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[rgba(207,207,207,0.55)]">
        <span>
          {used} / {limit}
        </span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(18,22,36,0.85)]">
        <motion.div
          className={`h-full rounded-full ${barClasses}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-white/5 mix-blend-screen opacity-40" />
      </div>
    </div>
  )
}
