"use client"

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

export function StatCard({ title, value, icon: Icon, trend, description }: StatCardProps) {
  const trendBadgeClasses = trend
    ? trend.isPositive
      ? 'border-[rgba(63,191,140,0.42)] bg-[rgba(63,191,140,0.18)] text-[#C8F3E2]'
      : 'border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]'
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(75,142,255,0.35)] hover:shadow-[0_18px_42px_rgba(20,28,45,0.5)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2653FF_0%,#4B8EFF_50%,#8F82FF_100%)] shadow-[0_18px_42px_rgba(52,84,207,0.42)]">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">
                  {title}
                </p>
                <p className="text-3xl font-semibold leading-tight text-white">{value}</p>
              </div>
            </div>

            {description && (
              <p className="max-w-[18rem] text-xs text-[rgba(207,207,207,0.6)]">
                {description}
              </p>
            )}
          </div>

          {trend && (
            <div className="flex flex-col items-end gap-2 text-right">
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]',
                  trendBadgeClasses
                )}
              >
                {trend.isPositive ? 'Stable' : 'Watch'}
              </span>
              <span className={cn('text-lg font-semibold', trend.isPositive ? 'text-[#7AE7B4]' : 'text-[#FF9F9F]')}>
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-[10px] text-[rgba(207,207,207,0.45)]">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
