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
        bgClass: 'bg-emerald-50',
        iconClass: 'text-emerald-600',
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
        bgClass: 'bg-blue-50',
        iconClass: 'text-blue-600',
      },
      {
        label: 'Plan',
        value: sub?.tier_display_name ?? '—',
        change: sub ? sub.status : '',
        icon: BookTemplate,
        bgClass: 'bg-violet-50',
        iconClass: 'text-violet-600',
      },
      {
        label: 'Resets in',
        value: resetDays != null ? `${resetDays} day${resetDays === 1 ? '' : 's'}` : '—',
        change: sub?.period_end ? new Date(sub.period_end).toLocaleDateString() : '',
        icon: TrendingUp,
        bgClass: 'bg-cyan-50',
        iconClass: 'text-cyan-600',
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
            gradient: 'from-emerald-500 to-teal-500',
            badge: 'Draft saved',
            cta: 'Continue',
          }
        : {
            icon: Plus,
            title: 'Choose a Template',
            description: 'Start a fresh report from our library',
            href: '/app/templates',
            gradient: 'from-emerald-500 to-teal-500',
            cta: 'Get started',
          },
      {
        icon: BookTemplate,
        title: 'Browse Templates',
        description: 'View all available report templates',
        href: '/app/templates',
        gradient: 'from-violet-500 to-purple-500',
        cta: 'Browse',
      },
      {
        icon: Activity,
        title: 'View Reports',
        description: 'Access your generated reports',
        href: '/app/reports',
        gradient: 'from-blue-500 to-cyan-500',
        cta: 'Open reports',
      },
    ]
  }, [recentTemplate])

  return (
    <div className="space-y-8 pb-24 md:pb-8 px-4 sm:px-0">
      {/* USAGE WIDGET - Top Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto lg:mx-0 lg:max-w-none"
      >
        <UsageWidget />
      </motion.div>

      {subscriptionData?.subscription && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-sm text-emerald-900 shadow-sm"
        >
          {`You're ${subscriptionData.subscription.reports_remaining} reports away from your ${
            subscriptionData.subscription.tier_display_name
          } plan limit this cycle.`}{' '}
          <button
            className="font-semibold text-primary underline-offset-4 hover:underline"
            onClick={() => router.push('/pricing')}
            type="button"
          >
            Explore upgrade options
          </button>
        </motion.div>
      )}

      {/* HERO SECTION - Modern & Welcoming */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-6 sm:p-8 lg:p-12 border-2 border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Welcome back
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          <span className="text-gradient-brand">Generate Reports</span>
          <br />
          <span className="text-gray-900">With AI Speed</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-6 sm:mb-8">
          Create professional medical reports in seconds. Choose a template, enter patient data, and let AI handle the rest.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            size="lg"
            className="btn-primary h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
            onClick={handlePrimaryCta}
            disabled={ctaBusy}
          >
            <Plus className="w-5 h-5 mr-2" />
            {ctaBusy ? 'Opening templates…' : 'Choose a Template'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-2 w-full sm:w-auto"
            onClick={() => router.push('/app/templates')}
          >
            <BookTemplate className="w-5 h-5 mr-2" />
            Browse Templates
          </Button>
        </div>
      </motion.div>

      {/* STATS GRID - Animated Cards with mobile overflow protection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
          >
            <Card className="card-modern touch-target">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgClass}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconClass}`} />
                  </div>
                  {stat.change ? (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
                      {stat.change}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* QUICK ACTIONS - Interactive Cards */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="card-interactive group touch-manipulation"
              onClick={() => router.push(action.href)}
            >
              <CardContent className="p-6">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-600 mb-4">{action.description}</p>
                <div className="flex items-center text-primary font-medium">
                  {action.badge ? (
                    <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
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
