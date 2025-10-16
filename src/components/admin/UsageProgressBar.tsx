"use client"

import { motion } from 'framer-motion'

interface UsageProgressBarProps {
  used: number
  limit: number
  className?: string
}

export function UsageProgressBar({ used, limit, className = '' }: UsageProgressBarProps) {
  const percentage = Math.min((used / limit) * 100, 100)
  const color = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{used} / {limit}</span>
        <span className="text-gray-500">{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
