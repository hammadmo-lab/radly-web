'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Menu,
  Settings,
  LogOut,
  User as UserIcon,
  Activity,
  BookTemplate
} from 'lucide-react'
import { getJob, getRecentJobs } from '@/lib/jobs'
import { getRecentReportsClient } from '@/lib/reports'
import { toast } from 'sonner'
import { useAuthToken } from '@/hooks/useAuthToken'
import { useJobStatusPolling } from '@/hooks/useSafePolling'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/components/auth-provider'
import { useSubscription } from '@/hooks/useSubscription'

// Local type for mobile reports display
type MobileReportRow = {
  job_id: string
  status: string
  template_id?: string
  title: string
  created_at: number
}

type StoredJob = {
  job_id: string
  status: string
  template_id?: string
  title?: string
  created_at?: number
}

const normalizeStoredJob = (job: StoredJob): MobileReportRow => {
  const createdAt = job.created_at ?? Date.now()
  return {
    job_id: job.job_id,
    status: job.status,
    template_id: job.template_id,
    title: job.title || job.template_id || 'Untitled Report',
    created_at: createdAt,
  }
}

const persistJobs = (storageKey: string, jobs: MobileReportRow[]) => {
  const payload: StoredJob[] = jobs.map(({ job_id, status, template_id, title, created_at }) => ({
    job_id,
    status,
    template_id,
    title,
    created_at,
  }))
  localStorage.setItem(storageKey, JSON.stringify(payload))
}

const STATUS_CONFIG = {
  done: {
    label: 'Completed',
    icon: CheckCircle,
    color: '#3FBF8C',
    bgColor: 'bg-[#3FBF8C]/20',
    borderColor: 'border-[#3FBF8C]/40',
  },
  running: {
    label: 'Generating',
    icon: Loader2,
    color: '#4B8EFF',
    bgColor: 'bg-[#4B8EFF]/20',
    borderColor: 'border-[#4B8EFF]/40',
  },
  queued: {
    label: 'Queued',
    icon: Clock,
    color: '#F8B74D',
    bgColor: 'bg-[#F8B74D]/20',
    borderColor: 'border-[#F8B74D]/40',
  },
  error: {
    label: 'Failed',
    icon: AlertCircle,
    color: '#FF6B6B',
    bgColor: 'bg-[#FF6B6B]/20',
    borderColor: 'border-[#FF6B6B]/40',
  },
}

export default function MobileReportsPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { data: subscriptionData } = useSubscription()
  const { userId } = useAuthToken()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<MobileReportRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const previousJobIds = useRef<Set<string>>(new Set())
  const hasHydratedJobs = useRef(false)
  
  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  const getUserJobsKey = useCallback(() => {
    if (!userId) return null
    return `radly_recent_jobs_local_${userId}`
  }, [userId])

  const showArrivalToast = useCallback((count: number) => {
    if (!count) return
    toast.success(count === 1 ? 'New report is ready.' : `${count} new reports are ready.`)
    if (typeof window !== 'undefined') {
      import('@capacitor/haptics')
        .then(async ({ Haptics }) => {
          const { ImpactStyle } = await import('@capacitor/haptics')
          Haptics.impact({ style: ImpactStyle.Medium })
        })
        .catch(() => {})
    }
  }, [])

  const applyRows = useCallback((jobs: MobileReportRow[], persistKey?: string) => {
    const sorted = [...jobs].sort((a, b) => b.created_at - a.created_at)
    const newJobs = sorted.filter(job => !previousJobIds.current.has(job.job_id))
    if (hasHydratedJobs.current && newJobs.length) {
      showArrivalToast(newJobs.length)
    }
    previousJobIds.current = new Set(sorted.map(job => job.job_id))
    hasHydratedJobs.current = true
    setRows(sorted)
    if (persistKey) {
      persistJobs(persistKey, sorted)
    }
    return sorted
  }, [showArrivalToast])

  const fetchRemoteReports = useCallback(async (): Promise<MobileReportRow[]> => {
    try {
      const remote = await getRecentReportsClient(50)
      let normalized = remote?.map((report) => {
        const createdAtMs = report.created_at ? Date.parse(report.created_at) : Date.now()
        const createdAt = Number.isNaN(createdAtMs) ? Date.now() : createdAtMs
        return {
          job_id: report.job_id,
          status: report.status,
          template_id: report.template_id,
          title: report.template_id || 'Untitled Report',
          created_at: createdAt,
        }
      }) ?? []

      if (!normalized.length) {
        const fallback = await getRecentJobs(50).catch(() => [])
        normalized = fallback.map((job) => {
          const status = ['queued', 'running', 'done', 'error'].includes(job.status)
            ? (job.status === 'running' ? 'queued' : job.status)
            : 'queued'
          const result = job.result as Record<string, unknown> | undefined
          const report = result?.report as Record<string, unknown> | undefined
          const title =
            (typeof report?.title === 'string' && report.title.trim()) ||
            job.template_id ||
            'Untitled Report'
          return {
            job_id: job.job_id,
            status: status as 'queued' | 'done' | 'error',
            template_id: job.template_id || '—',
            title,
            created_at: Date.now(),
          }
        })
      }

      return normalized
    } catch (remoteError) {
      console.error('Failed to fetch recent reports from Supabase:', remoteError)
      return []
    }
  }, [])

  const loadReports = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const jobsKey = getUserJobsKey()
      if (!jobsKey) {
        setRows([])
        return
      }

      const stored = localStorage.getItem(jobsKey)
      if (!stored) {
        const remoteRows = await fetchRemoteReports()
        applyRows(remoteRows, jobsKey)
        return
      }

      const localJobs: StoredJob[] = JSON.parse(stored)

      if (localJobs.length === 0) {
        const remoteRows = await fetchRemoteReports()
        applyRows(remoteRows, jobsKey)
        return
      }

      const jobPromises = localJobs.map(async (localJob) => {
        const fallbackRow = normalizeStoredJob(localJob)
        try {
          const job = await getJob(localJob.job_id)
          const templateId = job.result?.template_id || fallbackRow.template_id
          return {
            job_id: localJob.job_id,
            status: job.status,
            template_id: templateId,
            title: fallbackRow.title || templateId || 'Untitled Report',
            created_at: fallbackRow.created_at,
          }
        } catch {
          return fallbackRow
        }
      })

      const jobs = await Promise.all(jobPromises)
      const sortedJobs = applyRows(jobs, jobsKey)

      if (showLoading) {
        const remoteRows = await fetchRemoteReports()
        if (remoteRows.length) {
          const mergedMap = new Map<string, MobileReportRow>()
          sortedJobs.forEach((job) => mergedMap.set(job.job_id, job))
          remoteRows.forEach((job) => mergedMap.set(job.job_id, job))
          const merged = Array.from(mergedMap.values())
          applyRows(merged, jobsKey)
        }
      }
    } catch (err) {
      console.error('Error loading reports:', err)
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [applyRows, fetchRemoteReports, getUserJobsKey])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // Poll for running/queued jobs
  useJobStatusPolling(async () => {
    const queuedOrRunningJobs = rows.filter(row =>
      row.status === 'queued' || row.status === 'running'
    )

    if (queuedOrRunningJobs.length === 0) return

    // Refresh all jobs to get latest status
    await loadReports(false)
  })

  
  const handleViewReport = (jobId: string) => {
    if (!jobId) return
    const encodedId = encodeURIComponent(jobId)
    router.push(`/app/report/mobile?jobId=${encodedId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
        {/* Safe Area Spacer for Notch */}
        <div className="h-16 bg-[#0a0e1a]" />

        {/* Header - Matches dashboard exactly */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-16 z-50 bg-gradient-to-b from-[#0a0e1a] to-transparent px-4 pb-4 pt-4 flex items-center justify-between border-b border-white/10"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
            >
              <Menu className="w-6 h-6 text-white/80" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Reports</h1>
              <p className="text-sm text-white/60">Loading reports...</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/app/settings')}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
          >
            <Settings className="w-6 h-6 text-white/80" />
          </button>
        </motion.div>

        {/* Loading skeletons */}
        <div className="px-4 py-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      {/* Safe Area Spacer for Notch */}
      <div className="h-16 bg-[#0a0e1a]" />

      {/* Header - Matches dashboard exactly */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-50 bg-gradient-to-b from-[#0a0e1a] to-transparent px-4 pb-4 pt-4 flex items-center justify-between border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
          >
            <Menu className="w-6 h-6 text-white/80" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Reports</h1>
            <p className="text-sm text-white/60">
              {rows.length} report{rows.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/app/settings')}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
        >
          <Settings className="w-6 h-6 text-white/80" />
        </button>
      </motion.div>

      {/* Reports List */}
      <div className="p-4 pb-32 space-y-3">
        {error && (
          <div className="bg-[#FF6B6B]/20 border border-[#FF6B6B]/40 rounded-2xl p-4">
            <p className="text-sm text-white">{error}</p>
            <button
              onClick={() => loadReports()}
              className="mt-2 text-sm text-[#FF6B6B] font-medium active:opacity-70"
            >
              Try again
            </button>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No reports yet</h3>
            <p className="text-sm text-white/60 mb-6">
              Generate your first report to see it here
            </p>
            <button
              onClick={() => router.push('/app/templates')}
              className="px-6 py-3 bg-gradient-to-r from-[#4B8EFF] to-[#2653FF] rounded-xl text-white font-semibold active:scale-95 transition-transform"
            >
              Browse Templates
            </button>
          </div>
        ) : (
          rows.map((row) => {
            const statusConfig = STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.error
            const StatusIcon = statusConfig.icon

            return (
              <motion.button
                key={row.job_id}
                layoutId={row.job_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => handleViewReport(row.job_id)}
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 active:scale-[0.98] transition-all touch-manipulation text-left relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${statusConfig.bgColor} border ${statusConfig.borderColor} flex items-center justify-center shrink-0`}>
                    {row.status === 'running' ? (
                      <StatusIcon className="w-6 h-6 animate-spin" style={{ color: statusConfig.color }} />
                    ) : (
                      <StatusIcon className="w-6 h-6" style={{ color: statusConfig.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1 truncate">
                      {row.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 ${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-full text-[10px] font-medium`}
                        style={{ color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                      {row.created_at && (
                        <span className="text-[10px] text-white/50">
                          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  {row.status === 'done' && (
                    <Eye className="w-5 h-5 text-white/40 shrink-0" />
                  )}
                </div>
              </motion.button>
            )
          })
        )}

      {/* Side Menu - Matches dashboard exactly */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isMenuOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-[rgba(10,14,26,0.98)] backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}
      >
        {/* Menu Header */}
        <div className="p-6 border-b border-white/10" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3FBF8C] to-[#4B8EFF] flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">Radly</p>
                <p className="text-base font-bold text-white">Reports</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
            >
              <RefreshCw className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4B8EFF] to-[#8F82FF] flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-white/50">
                {subscriptionData?.subscription.tier_display_name}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <Link href="/app/dashboard" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
              <Activity className="w-5 h-5 text-white/60" />
              <span className="text-base font-medium text-white/80">Dashboard</span>
            </div>
          </Link>
          <Link href="/app/templates" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
              <BookTemplate className="w-5 h-5 text-white/60" />
              <span className="text-base font-medium text-white/80">Templates</span>
            </div>
          </Link>
          <Link href="/app/reports" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
              <FileText className="w-5 h-5 text-[#3FBF8C]" />
              <span className="text-base font-medium text-white">Reports</span>
            </div>
          </Link>
          <Link href="/app/settings" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
              <Settings className="w-5 h-5 text-white/60" />
              <span className="text-base font-medium text-white/80">Settings</span>
            </div>
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-white/10" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 active:scale-95 transition-all min-h-[56px] touch-manipulation"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-base font-medium">Sign Out</span>
          </button>
        </div>
      </motion.div>

      {/* Menu Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Bottom Navigation - Matches dashboard exactly */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(10,14,26,0.95)] backdrop-blur-xl border-t border-white/10"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      >
        <div className="flex items-center justify-around px-2 pt-3 pb-2">
          <Link href="/app/dashboard" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-[10px] font-medium text-white/50">Home</span>
          </Link>
          <Link href="/app/templates" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
              <BookTemplate className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-[10px] font-medium text-white/50">Templates</span>
          </Link>
          <Link href="/app/reports" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3FBF8C] to-[#4B8EFF] flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-white">Reports</span>
          </Link>
        </div>
      </div>
      </div>
    </div>
  )
}
