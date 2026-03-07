"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSecurityStats } from '@/hooks/useAdminData'

export function SecuritySection() {
  const { data, isLoading, error } = useSecurityStats()

  return (
    <section className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">Security</p>
        <h2 className="text-lg font-semibold text-white">Security Overview</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-[rgba(207,207,207,0.55)]">Loading security data…</p>
      ) : error ? (
        <p className="text-sm text-[#FFD1D1]">{error.message}</p>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[rgba(255,107,107,0.28)] bg-[rgba(255,107,107,0.08)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,107,107,0.8)]">Failed Auth (24h)</p>
              <p className="mt-2 text-3xl font-semibold text-white">{data?.failed_auth_count ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(248,183,77,0.28)] bg-[rgba(248,183,77,0.08)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(248,183,77,0.8)]">Unique IPs (24h)</p>
              <p className="mt-2 text-3xl font-semibold text-white">{data?.unique_ips ?? 0}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.08)]">
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Event Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Count</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data?.security_events?.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-sm text-[rgba(207,207,207,0.55)]">
                      No security events
                    </TableCell>
                  </TableRow>
                ) : (
                  data.security_events.map((evt, i) => (
                    <TableRow key={i} className="border-[rgba(255,255,255,0.06)]">
                      <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">{evt.event_type}</TableCell>
                      <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">{evt.event_count}</TableCell>
                      <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">
                        {evt.last_occurrence ? evt.last_occurrence.slice(0, 16).replace('T', ' ') : '—'}
                      </TableCell>
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
