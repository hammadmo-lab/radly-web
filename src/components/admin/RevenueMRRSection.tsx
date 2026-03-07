"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RevenueAnalytics } from '@/types/admin'

interface RevenueMRRSectionProps {
  data: RevenueAnalytics | undefined
  isLoading: boolean
  error: Error | null
}

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return '$0'
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function RevenueMRRSection({ data, isLoading, error }: RevenueMRRSectionProps) {
  const tierEntries: Array<{ tier: string; revenue: number }> = (() => {
    if (!data?.revenue_by_tier) return []
    if (Array.isArray(data.revenue_by_tier)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.revenue_by_tier as any[]).map((item: any) => ({
        tier: item.tier ?? item.tier_name ?? String(item),
        revenue: item.revenue ?? item.amount ?? 0,
      }))
    }
    return Object.entries(data.revenue_by_tier).map(([tier, revenue]) => ({ tier, revenue }))
  })()

  const cards = [
    { label: 'MRR', value: fmt(data?.mrr) },
    { label: 'Revenue (30d)', value: fmt(data?.total_revenue) },
    { label: 'Churn Rate', value: data?.churn_rate != null ? `${(data.churn_rate * 100).toFixed(1)}%` : '—' },
  ]

  return (
    <section className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">Finance</p>
        <h2 className="text-lg font-semibold text-white">Revenue &amp; MRR</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-[rgba(207,207,207,0.55)]">Loading revenue data…</p>
      ) : error ? (
        <p className="text-sm text-[rgba(207,207,207,0.4)]">Revenue data unavailable.</p>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            {cards.map(card => (
              <div
                key={card.label}
                className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          {tierEntries.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.08)]">
                    <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Tier</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tierEntries.map(({ tier, revenue }) => (
                    <TableRow key={tier} className="border-[rgba(255,255,255,0.06)]">
                      <TableCell className="text-sm font-medium text-white">{tier}</TableCell>
                      <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">{fmt(revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </section>
  )
}
