"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRecentJobs } from '@/hooks/useAdminData'

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  done: { color: '#3FBF8C', bg: 'rgba(63,191,140,0.18)' },
  failed: { color: '#FF6B6B', bg: 'rgba(255,107,107,0.18)' },
  processing: { color: '#F8B74D', bg: 'rgba(248,183,77,0.18)' },
  queued: { color: '#3b82f6', bg: 'rgba(59,130,246,0.18)' },
}

export function RecentJobsSection() {
  const { data, isLoading, error } = useRecentJobs(20)

  return (
    <section className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">Queue</p>
        <h2 className="text-lg font-semibold text-white">Recent Jobs</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-[rgba(207,207,207,0.55)]">Loading recent jobs…</p>
      ) : error ? (
        <p className="text-sm text-[#FFD1D1]">{error.message}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[rgba(255,255,255,0.08)]">
                <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Job ID</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Template</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Duration</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data?.jobs?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-[rgba(207,207,207,0.55)]">
                    No recent jobs
                  </TableCell>
                </TableRow>
              ) : (
                data.jobs.map(job => {
                  const badge = STATUS_BADGE[job.status] ?? { color: '#9ca3af', bg: 'rgba(156,163,175,0.18)' }
                  const durationSec = job.processing_time_ms ? `${(job.processing_time_ms / 1000).toFixed(1)}s` : '—'
                  const time = job.created_at ? job.created_at.slice(0, 16).replace('T', ' ') : '—'
                  return (
                    <TableRow key={job.job_id} className="border-[rgba(255,255,255,0.06)]">
                      <TableCell>
                        <span className="font-mono text-xs text-[rgba(207,207,207,0.8)]" title={job.job_id}>
                          {job.job_id.slice(0, 8)}…
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">{job.template_id}</TableCell>
                      <TableCell>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ color: badge.color, background: badge.bg }}
                        >
                          {job.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">{durationSec}</TableCell>
                      <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">{time}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
