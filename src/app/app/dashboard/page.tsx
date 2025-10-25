'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
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

function daysUntil(dateString?: string) {
  if (!dateString) return null
  const end = new Date(dateString).getTime()
  if (Number.isNaN(end)) return null
  const diff = Math.max(0, end - Date.now())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: subscriptionData } = useSubscription()
  const [ctaBusy, setCtaBusy] = useState(false)
  const [recentTemplate, setRecentTemplate] = useState<{ id: string; name: string | null } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = localStorage.getItem('recent-template-id')
    const name = localStorage.getItem('recent-template-name')
    if (id) {
      setRecentTemplate({
        id,
        name,
      })
    }
  }, [])

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      subscriptionData?.usage_stats
    ) {
      // Surfacing raw timing data locally helps debug mismatches with backend averages.
      console.debug('Dashboard usage stats', subscriptionData.usage_stats)
    }
  }, [subscriptionData?.usage_stats, subscriptionData])

  const handlePrimaryCta = useCallback(() => {
    if (ctaBusy) return
    setCtaBusy(true)
    router.push('/app/templates')
  }, [ctaBusy, router])

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
        bgClass: 'bg-[rgba(75,142,255,0.18)] shadow-[0_0_12px_rgba(75,142,255,0.25)]',
        iconClass: 'text-[#4B8EFF]',
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
        bgClass: 'bg-[rgba(143,130,255,0.18)] shadow-[0_0_12px_rgba(143,130,255,0.25)]',
        iconClass: 'text-[#8F82FF]',
      },
      {
        label: 'Plan',
        value: sub?.tier_display_name ?? '—',
        change: sub ? sub.status : '',
        icon: BookTemplate,
        bgClass: 'bg-[rgba(63,191,140,0.18)] shadow-[0_0_12px_rgba(63,191,140,0.25)]',
        iconClass: 'text-[#3FBF8C]',
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
            gradient: 'from-[#4B8EFF] to-[#8F82FF]',
            badge: 'Draft saved',
            cta: 'Continue',
          }
        : {
            icon: Plus,
            title: 'Choose a Template',
            description: 'Start a fresh report from our library',
            href: '/app/templates',
            gradient: 'from-[#4B8EFF] to-[#3FBF8C]',
            cta: 'Get started',
          },
      {
        icon: BookTemplate,
        title: 'Browse Templates',
        description: 'View all available report templates',
        href: '/app/templates',
        gradient: 'from-[#8F82FF] to-[#4B8EFF]',
        cta: 'Browse',
      },
      {
        icon: Activity,
        title: 'View Reports',
        description: 'Access your generated reports',
        href: '/app/reports',
        gradient: 'from-[#3FBF8C] to-[#4B8EFF]',
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
          className="aurora-card border border-[rgba(58,130,247,0.28)] bg-[rgba(22,30,52,0.82)] px-4 sm:px-6 py-5 text-sm text-[#D7E3FF] shadow-[0_18px_44px_rgba(58,130,247,0.22)] w-full max-w-full"
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
              className="h-10 px-4 sm:px-5 text-sm font-semibold text-[#4B8EFF] border-[#4B8EFF]/40 hover:bg-[rgba(75,142,255,0.12)] w-full sm:w-auto min-h-[44px] shrink-0"
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
        className="aurora-card relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(38,83,255,0.32)0%,rgba(12,12,14,0.85)70%)] p-6 sm:p-8 lg:p-12 shadow-[0_24px_48px_rgba(0,0,0,0.6)] w-full max-w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-[#4B8EFF] animate-pulse" />
          <span className="text-sm font-medium text-[rgba(207,207,207,0.75)] uppercase tracking-wide">
            Welcome back
          </span>
        </div>
        
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white"
          style={{
            textShadow: '0 0 30px rgba(75, 142, 255, 0.4)'
          }}
        >
          <span className="text-gradient-brand">Generate Reports</span>
          <br />
          <span className="text-white">With AI Speed</span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-[rgba(207,207,207,0.75)] max-w-full sm:max-w-2xl mb-6 sm:mb-8 break-words">
          Create professional medical reports in seconds. Choose a template, enter patient data, and let AI handle the rest.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            size="lg"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
            onClick={handlePrimaryCta}
            disabled={ctaBusy}
          >
            <Plus className="w-5 h-5 mr-2" />
            {ctaBusy ? 'Opening templates…' : 'Choose a Template'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
            onClick={() => router.push('/app/templates')}
          >
            <BookTemplate className="w-5 h-5 mr-2" />
            Browse Templates
          </Button>
        </div>
      </motion.div>

      {/* STATS GRID - Animated Cards with mobile overflow protection */}
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
                    <span className="text-xs text-[#3FBF8C] bg-[rgba(63,191,140,0.18)] px-2 py-1 rounded-full font-medium">
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

      {/* QUICK ACTIONS - Interactive Cards */}
      <div className="w-full max-w-full">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-[#4B8EFF]" />
          <h2
            className="text-2xl font-bold text-white"
            style={{
              textShadow: '0 0 20px rgba(75, 142, 255, 0.3)'
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
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.gradient} mb-4 shadow-[0_0_16px_rgba(75,142,255,0.35)] group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#4B8EFF] transition-colors break-words">
                  {action.title}
                </h3>
                <p className="text-sm sm:text-base text-[rgba(207,207,207,0.75)] mb-4 break-words">{action.description}</p>
                <div className="flex items-center text-[#4B8EFF] font-medium">
                  {action.badge ? (
                    <span className="mr-2 rounded-full bg-[rgba(63,191,140,0.2)] px-2 py-0.5 text-xs font-semibold text-[#B6F2DB]">
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
    </div>
  )
}
