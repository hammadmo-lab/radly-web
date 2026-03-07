"use client"

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Subscription } from '@/types/admin'

interface PlatformBreakdownProps {
  subscriptions: Subscription[] | undefined
  isLoading: boolean
  error: Error | null
  onRefresh: () => void
}

interface PlatformCard {
  label: string
  count: number
  color: string
  bg: string
  border: string
}

export function PlatformBreakdown({ subscriptions, isLoading, error, onRefresh }: PlatformBreakdownProps) {
  const web = subscriptions?.filter(s => !s.payment_provider || s.payment_provider === 'web' || s.payment_provider === 'stripe').length ?? 0
  const ios = subscriptions?.filter(s => s.payment_provider === 'ios' || s.payment_provider === 'apple').length ?? 0
  const android = subscriptions?.filter(s => s.payment_provider === 'android' || s.payment_provider === 'google').length ?? 0
  const total = subscriptions?.length ?? 0

  const cards: PlatformCard[] = [
    { label: 'Web', count: web, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.28)' },
    { label: 'iOS', count: ios, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.28)' },
    { label: 'Android', count: android, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.28)' },
    { label: 'Total', count: total, color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.20)' },
  ]

  return (
    <section className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">Platform</p>
          <h2 className="text-lg font-semibold text-white">Platform Breakdown</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-9 rounded-lg border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] px-4 text-[#D7E3FF] hover:bg-[rgba(75,142,255,0.22)]"
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[rgba(207,207,207,0.55)]">Loading platform data…</p>
      ) : error ? (
        <p className="text-sm text-[#FFD1D1]">{error.message}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(card => (
            <div
              key={card.label}
              className="rounded-2xl border p-5"
              style={{ background: card.bg, borderColor: card.border }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: card.color }}>
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{card.count}</p>
              <p className="mt-1 text-xs text-[rgba(207,207,207,0.55)]">active subscriptions</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
