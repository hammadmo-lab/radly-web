"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UsageAnalytics } from '@/types/admin'

interface TierDistributionSectionProps {
  data: UsageAnalytics | undefined
  isLoading: boolean
  error: Error | null
}

export function TierDistributionSection({ data, isLoading, error }: TierDistributionSectionProps) {
  // usage_by_tier can be Record<string, number> or an array — handle both
  const tierEntries: Array<{ tier: string; count: number }> = (() => {
    if (!data?.usage_by_tier) return []
    if (Array.isArray(data.usage_by_tier)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.usage_by_tier as any[]).map((item: any) => ({
        tier: item.tier ?? item.tier_name ?? String(item),
        count: item.count ?? item.users ?? 0,
      }))
    }
    return Object.entries(data.usage_by_tier).map(([tier, count]) => ({ tier, count }))
  })()

  return (
    <section className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">Analytics</p>
        <h2 className="text-lg font-semibold text-white">Tier Distribution</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-[rgba(207,207,207,0.55)]">Loading tier data…</p>
      ) : error ? (
        <p className="text-sm text-[rgba(207,207,207,0.4)]">Analytics data unavailable.</p>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">Avg Reports / User</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {data?.average_reports_per_user?.toFixed(1) ?? '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">Users Near Limit</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {data?.users_near_limit?.length ?? 0}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.08)]">
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Tier</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Active Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tierEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-6 text-center text-sm text-[rgba(207,207,207,0.55)]">
                      No tier data available
                    </TableCell>
                  </TableRow>
                ) : (
                  tierEntries.map(({ tier, count }) => (
                    <TableRow key={tier} className="border-[rgba(255,255,255,0.06)]">
                      <TableCell className="text-sm font-medium text-white">{tier}</TableCell>
                      <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">{count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  )
}
