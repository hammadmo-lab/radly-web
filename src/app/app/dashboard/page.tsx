'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus, FileText, BookTemplate, TrendingUp, Clock,
  Sparkles, Zap, ArrowRight, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import UsageWidget from '@/components/UsageWidget'
import { useSubscription } from '@/hooks/useSubscription'
import { formatSeconds, resolveAvgGenerationSeconds } from '@/utils/time'
import { DashboardStatsSkeleton } from '@/components/loading/DashboardStatsSkeleton'
import { GridCardsSkeleton } from '@/components/loading/GridCardsSkeleton'

function daysUntil(dateString?: string) {
  if (!dateString) return null
  const end = new Date(dateString).getTime()
  if (Number.isNaN(end)) return null
  const diff = Math.max(0, end - Date.now())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function WebDashboardPage() {
  const router = useRouter()
  const { data: subscriptionData, clearCache } = useSubscription()

  // Initialize recentTemplate from localStorage
  const [recentTemplate, setRecentTemplate] = useState<{ id: string; name: string | null } | null>(() => {
    if (typeof window === 'undefined') return null
    const id = localStorage.getItem('recent-template-id')
    const name = localStorage.getItem('recent-template-name')
    return id ? { id, name } : null
  })

  // Clear cache on page load to ensure fresh subscription data
  useEffect(() => {
    const initializePage = async () => {
      console.log('📄 DashboardPage: Initializing, clearing subscription cache...')
      clearCache()
    }
    initializePage()
  }, [clearCache])

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      subscriptionData?.usage_stats
    ) {
      // Surfacing raw timing data locally helps debug mismatches with backend averages.
      console.debug('Dashboard usage stats', subscriptionData.usage_stats)
    }
  }, [subscriptionData?.usage_stats, subscriptionData])

  const stats = useMemo(() => {
    const sub = subscriptionData?.subscription
    const usageStats = subscriptionData?.usage_stats
    const avgGenerationSeconds = resolveAvgGenerationSeconds(usageStats)
    const hasAvgGenerationData =
      avgGenerationSeconds != null && avgGenerationSeconds >= 0.5
    const resetDays = daysUntil(sub?.period_end)

    return [
      {
        label: 'Reports used',
        value: sub ? `${sub.reports_used}/${sub.reports_limit}` : '—',
        change: sub ? `${sub.reports_remaining} remaining` : '',
        icon: FileText,
        bgClass: 'bg-[rgba(212,180,131,0.18)] shadow-[0_0_12px_rgba(212,180,131,0.25)]',
        iconClass: 'text-[#D4B483]',
      },
      {
        label: 'Avg. generation time',
        value: hasAvgGenerationData ? formatSeconds(avgGenerationSeconds) : '—',
        change: hasAvgGenerationData
          ? 'Last 30 days'
          : usageStats
            ? 'Timing data not yet available'
            : '',
        icon: Clock,
        bgClass: 'bg-[rgba(168,159,145,0.18)] shadow-[0_0_12px_rgba(168,159,145,0.25)]',
        iconClass: 'text-[#A89F91]',
      },
      {
        label: 'Plan',
        value: sub?.tier_display_name ?? '—',
        change: sub ? sub.status : '',
        icon: BookTemplate,
        bgClass: 'bg-[rgba(212,180,131,0.18)] shadow-[0_0_12px_rgba(212,180,131,0.25)]',
        iconClass: 'text-[#D4B483]',
      },
      {
        label: 'Resets in',
        value: resetDays != null ? `${resetDays} day${resetDays === 1 ? '' : 's'}` : '—',
        change: sub?.period_end ? new Date(sub.period_end).toLocaleDateString() : '',
        icon: TrendingUp,
        bgClass: 'bg-[rgba(248,183,77,0.2)] shadow-[0_0_12px_rgba(248,183,77,0.25)]',
        iconClass: 'text-[#F8B74D]',
      },
    ]
  }, [subscriptionData])

  const quickActions = useMemo(() => {
    const recentTitle = recentTemplate?.name
      ? recentTemplate.name.length > 32
        ? `${recentTemplate.name.slice(0, 29)}…`
        : recentTemplate.name
      : null

    return [
      recentTemplate
        ? {
          icon: Plus,
          title: recentTitle ? `Resume ${recentTitle}` : 'Resume recent draft',
          description: 'Pick up where you left off',
          href: `/app/generate?templateId=${encodeURIComponent(recentTemplate.id)}`,
          gradient: 'from-[#D4B483] to-[#B89666]',
          badge: 'Draft saved',
          cta: 'Continue',
        }
        : {
          icon: Plus,
          title: 'Choose a Template',
          description: 'Start a fresh report from our library',
          href: '/app/templates',
          gradient: 'from-[#D4B483] to-[#C68E59]',
          cta: 'Get started',
        },
      {
        icon: BookTemplate,
        title: 'Browse Templates',
        description: 'View all available report templates',
        href: '/app/templates',
        gradient: 'from-[#B89666] to-[#D4B483]',
        cta: 'Browse',
      },
      {
        icon: Activity,
        title: 'View Reports',
        description: 'Access your generated reports',
        href: '/app/reports',
        gradient: 'from-[#C68E59] to-[#D4B483]',
        cta: 'Open reports',
      },
    ]
  }, [recentTemplate])

  return (
    <div className="space-y-8 pb-24 md:pb-8 text-white w-full max-w-full overflow-x-hidden">
      {/* USAGE WIDGET - Top Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-full"
      >
        <UsageWidget />
      </motion.div>

      {subscriptionData?.subscription && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="aurora-card border border-[rgba(212,180,131,0.28)] bg-[rgba(22,30,52,0.82)] px-4 sm:px-6 py-5 text-sm text-[#E8DCC8] shadow-[0_18px_44px_rgba(212,180,131,0.22)] w-full max-w-full"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-xs uppercase tracking-[0.3em] text-[rgba(215,227,255,0.6)]">
                Plan Status
              </span>
              <p className="text-base sm:text-lg font-semibold text-white break-words">
                {`You're ${subscriptionData.subscription.reports_remaining} reports away from your ${subscriptionData.subscription.tier_display_name} limit.`}
              </p>
              <p className="text-[rgba(215,227,255,0.65)] break-words">
                Keep momentum going—upgrade now to unlock more capacity this cycle.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-10 px-4 sm:px-5 text-sm font-semibold text-[#D4B483] border-[#D4B483]/40 hover:bg-[rgba(212,180,131,0.12)] w-full sm:w-auto min-h-[44px] shrink-0"
              onClick={() => router.push('/pricing')}
              type="button"
            >
              Explore upgrade options
            </Button>
          </div>
        </motion.div>
      )}

      {/* HERO SECTION - Modern & Welcoming */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="aurora-card relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(212,180,131,0.12)0%,rgba(12,12,14,0.85)70%)] p-6 sm:p-8 lg:p-12 shadow-[0_24px_48px_rgba(0,0,0,0.6)] w-full max-w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-[#D4B483] animate-pulse" />
          <span className="text-sm font-medium text-[rgba(207,207,207,0.75)] uppercase tracking-wide">
            Welcome back
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white"
          style={{
            textShadow: '0 0 30px rgba(212, 180, 131, 0.4)'
          }}
        >
          <span className="text-gradient-brand">Generate Reports</span>
          <br />
          <span className="text-white">With AI Speed</span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-[rgba(207,207,207,0.75)] max-w-full sm:max-w-2xl mb-6 break-words">
          Create professional medical reports in seconds. Choose a template, enter patient data, and let AI handle the rest.
        </p>

        {/* Value Propositions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(212,180,131,0.08)] border border-[rgba(212,180,131,0.2)]">
            <div className="p-2 rounded-lg bg-[rgba(212,180,131,0.15)]">
              <Zap className="w-5 h-5 text-[#D4B483]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Lightning Fast</h3>
              <p className="text-xs text-[rgba(207,207,207,0.65)]">Generate reports in under 60 seconds</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(168,159,145,0.08)] border border-[rgba(168,159,145,0.2)]">
            <div className="p-2 rounded-lg bg-[rgba(168,159,145,0.15)]">
              <FileText className="w-5 h-5 text-[#A89F91]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Professional Quality</h3>
              <p className="text-xs text-[rgba(207,207,207,0.65)]">AI-powered medical accuracy</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(212,180,131,0.08)] border border-[rgba(212,180,131,0.2)]">
            <div className="p-2 rounded-lg bg-[rgba(212,180,131,0.15)]">
              <BookTemplate className="w-5 h-5 text-[#D4B483]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Multiple Templates</h3>
              <p className="text-xs text-[rgba(207,207,207,0.65)]">Choose from our curated library</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS GRID - Animated Cards with mobile overflow protection */}
      <Suspense fallback={<DashboardStatsSkeleton count={4} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-full">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
            >
              <Card className="aurora-card card-modern touch-target">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl border border-[rgba(255,255,255,0.08)] ${stat.bgClass}`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconClass}`} />
                    </div>
                    {stat.change ? (
                      <span className="text-xs text-[#D4B483] bg-[rgba(212,180,131,0.18)] px-2 py-1 rounded-full font-medium">
                        {stat.change}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-[rgba(207,207,207,0.75)] font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Suspense>

      {/* QUICK ACTIONS - Interactive Cards */}
      <Suspense fallback={<GridCardsSkeleton count={3} columns={1} variant="card" />}>
        <div className="w-full max-w-full">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-[#D4B483]" />
            <h2
              className="text-2xl font-bold text-white"
              style={{
                textShadow: '0 0 20px rgba(212, 180, 131, 0.3)'
              }}
            >
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="aurora-card card-interactive group touch-manipulation w-full max-w-full"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-6 w-full">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.gradient} mb-4 shadow-[0_0_16px_rgba(212,180,131,0.35)] group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#D4B483] transition-colors break-words">
                    {action.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[rgba(207,207,207,0.75)] mb-4 break-words">{action.description}</p>
                  <div className="flex items-center text-[#D4B483] font-medium">
                    {action.badge ? (
                      <span className="mr-2 rounded-full bg-[rgba(212,180,131,0.2)] px-2 py-0.5 text-xs font-semibold text-[#E8DCC8]">
                        {action.badge}
                      </span>
                    ) : null}
                    <span>{action.cta ?? 'Get started'}</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Suspense>
    </div>
  )
}

export default function DashboardPage() {
  return <WebDashboardPage />
}
