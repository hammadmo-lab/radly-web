'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus, FileText, BookTemplate, TrendingUp, Clock,
  Sparkles, Zap, ArrowRight, Activity, Settings,
  BarChart3, CreditCard, Bell, Menu, X, LogOut, User as UserIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import UsageWidget from '@/components/UsageWidget'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/components/auth-provider'
import { formatSeconds, resolveAvgGenerationSeconds } from '@/utils/time'

function daysUntil(dateString?: string) {
  if (!dateString) return null
  const end = new Date(dateString).getTime()
  if (Number.isNaN(end)) return null
  const diff = Math.max(0, end - Date.now())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function MobileDashboardPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { data: subscriptionData } = useSubscription()
  const [recentTemplate, setRecentTemplate] = useState<{ id: string; name: string | null } | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/app/dashboard'

  // Use actual user email from auth context, with fallback to localStorage for test mode
  const userEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('user-email') : null)

  const navItems = [
    { href: '/app/dashboard', icon: Activity, label: 'Dashboard' },
    { href: '/app/templates', icon: BookTemplate, label: 'Templates' },
    { href: '/app/reports', icon: FileText, label: 'Reports' },
  ]

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
        bgClass: 'bg-gradient-to-br from-[#4B8EFF]/20 to-[#2653FF]/10',
        iconColor: 'text-[#4B8EFF]',
        onClick: () => router.push('/app/reports'),
      },
      {
        label: 'Avg. time',
        value: hasAvgGenerationData ? formatSeconds(avgGenerationSeconds) : '—',
        change: hasAvgGenerationData
          ? 'Last 30 days'
          : usageStats
          ? 'Data coming soon'
          : '',
        icon: Clock,
        bgClass: 'bg-gradient-to-br from-[#8F82FF]/20 to-[#4B8EFF]/10',
        iconColor: 'text-[#8F82FF]',
        onClick: () => {},
      },
      {
        label: 'Plan',
        value: sub?.tier_display_name ?? '—',
        change: sub ? sub.status : '',
        icon: CreditCard,
        bgClass: 'bg-gradient-to-br from-[#3FBF8C]/20 to-[#8F82FF]/10',
        iconColor: 'text-[#3FBF8C]',
        onClick: () => router.push('/app/settings?tab=subscription'),
      },
      {
        label: 'Resets in',
        value: resetDays != null ? `${resetDays}d` : '—',
        change: sub?.period_end ? new Date(sub.period_end).toLocaleDateString() : '',
        icon: TrendingUp,
        bgClass: 'bg-gradient-to-br from-[#F8B74D]/20 to-[#FF6B6B]/10',
        iconColor: 'text-[#F8B74D]',
        onClick: () => {},
      },
    ]
  }, [subscriptionData, router])

  const quickActions = useMemo(() => {
    const recentTitle = recentTemplate?.name
      ? recentTemplate.name.length > 24
        ? `${recentTemplate.name.slice(0, 21)}…`
        : recentTemplate.name
      : null

    return [
      {
        icon: Plus,
        title: recentTitle ? `Resume ${recentTitle}` : 'New Report',
        description: 'Start creating a report',
        href: recentTemplate
          ? `/app/generate?templateId=${encodeURIComponent(recentTemplate.id)}`
          : '/app/templates',
        gradient: 'from-[#4B8EFF] to-[#8F82FF]',
        badge: recentTemplate ? 'Draft' : null,
      },
      {
        icon: BookTemplate,
        title: 'Browse Templates',
        description: 'Choose from library',
        href: '/app/templates',
        gradient: 'from-[#8F82FF] to-[#3FBF8C]',
      },
      {
        icon: Activity,
        title: 'My Reports',
        description: 'View history',
        href: '/app/reports',
        gradient: 'from-[#3FBF8C] to-[#4B8EFF]',
      },
    ]
  }, [recentTemplate])

  const menuItems = [
    { icon: Settings, label: 'Settings', href: '/app/settings', color: 'text-[#4B8EFF]' },
    { icon: Bell, label: 'Notifications', href: '/app/settings?tab=notifications', color: 'text-[#8F82FF]' },
    { icon: BarChart3, label: 'Usage Stats', href: '/app/settings?tab=usage', color: 'text-[#3FBF8C]' },
  ]

  return (
    <div className="h-screen w-screen bg-[#0A0E1A] flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      {/* MOBILE NAVIGATION MENU */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Side panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative h-full w-80 max-w-[88vw] bg-[rgba(8,12,22,0.96)] border-r border-[rgba(75,142,255,0.25)] shadow-[0_30px_80px_rgba(10,14,24,0.75)]"
          >
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] p-4 safe-area-inset-top">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2653FF_0%,#4B8EFF_60%,#8F82FF_100%)] shadow-[0_18px_42px_rgba(31,64,175,0.42)]">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm uppercase tracking-[0.24em] text-[rgba(207,207,207,0.45)]">
                    Radly
                  </span>
                  <span className="text-xl font-semibold text-white">Assistant</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close navigation menu"
                className="text-[rgba(207,207,207,0.7)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation items */}
            <nav className="space-y-3 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation text-[rgba(207,207,207,0.7)] bg-[rgba(12,16,28,0.72)] hover:border-[rgba(75,142,255,0.32)] hover:bg-[rgba(75,142,255,0.12)] hover:text-white hover:shadow-[0_14px_30px_rgba(31,64,175,0.35)]"
                  style={{
                    borderColor: pathname.startsWith(item.href) ? 'rgba(75,142,255,0.45)' : 'rgba(255,255,255,0.08)',
                    backgroundColor: pathname.startsWith(item.href) ? 'rgba(75,142,255,0.16)' : 'rgba(12,16,28,0.72)',
                    color: pathname.startsWith(item.href) ? 'white' : 'rgba(207,207,207,0.7)'
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(18,22,36,0.85)]"
                    style={{
                      borderColor: pathname.startsWith(item.href) ? 'rgba(75,142,255,0.35)' : 'rgba(255,255,255,0.08)',
                      backgroundColor: pathname.startsWith(item.href) ? 'rgba(75,142,255,0.2)' : 'rgba(18,22,36,0.85)',
                      color: pathname.startsWith(item.href) ? '#D7E3FF' : 'rgba(207,207,207,0.7)'
                    }}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User info and sign out */}
            <div className="absolute inset-x-0 bottom-0 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(6,10,18,0.95)] p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.7)]">
                  <UserIcon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.email || userEmail || 'Loading...'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    // Proper sign out using Supabase auth
                    await signOut()

                    // Clear local storage (but not everything)
                    localStorage.removeItem('user-email')
                    localStorage.removeItem('recent-template-id')
                    localStorage.removeItem('recent-template-name')

                    // Navigate to sign in
                    router.push('/auth/signin')
                    setIsMenuOpen(false)
                  } catch (error) {
                    console.error('Error signing out:', error)
                    // Fallback to clear everything if sign out fails
                    localStorage.clear()
                    router.push('/auth/signin')
                    setIsMenuOpen(false)
                  }
                }}
                className="w-full justify-center rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.72)] text-[rgba(207,207,207,0.75)] hover:border-[rgba(255,107,107,0.35)] hover:bg-[rgba(255,107,107,0.16)] hover:text-[#FFD1D1]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-[#0A0E1A]/95 backdrop-blur-lg border-b border-[rgba(255,255,255,0.08)] px-4 pb-4 shrink-0"
        style={{
          paddingTop: 'env(safe-area-inset-top, 16px)',
          minHeight: 'calc(16px + env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#4B8EFF]/20 to-[#8F82FF]/20 border border-[rgba(75,142,255,0.3)]">
              <Sparkles className="w-6 h-6 text-[#4B8EFF]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              <p className="text-xs text-[rgba(255,255,255,0.6)]">Welcome back</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
              onClick={() => router.push('/app/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20 w-full" style={{
        WebkitOverflowScrolling: 'touch',
        maxHeight: 'calc(100dvh - 200px)' // Account for header and nav
      }}>
        {/* USAGE WIDGET */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <UsageWidget />
        </motion.div>

        {/* PLAN STATUS CARD */}
        {subscriptionData?.subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="aurora-card rounded-2xl border border-[rgba(75,142,255,0.28)] bg-[rgba(38,83,255,0.12)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[#4B8EFF]" />
                  <span className="text-xs font-medium text-[#4B8EFF] uppercase tracking-wide">
                    {subscriptionData.subscription.tier_display_name}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  {subscriptionData.subscription.reports_remaining} reports remaining
                </p>
                <p className="text-xs text-[rgba(255,255,255,0.6)]">
                  Resets in {daysUntil(subscriptionData.subscription.period_end)} days
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs font-semibold text-[#4B8EFF] border-[#4B8EFF]/40 hover:bg-[rgba(75,142,255,0.12)] shrink-0"
                onClick={() => router.push('/pricing')}
              >
                Upgrade
              </Button>
            </div>
          </motion.div>
        )}

        {/* STATS GRID - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card
                className="aurora-card rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-hidden touch-manipulation"
                onClick={stat.onClick}
              >
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg mb-3 ${stat.bgClass}`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <p className="text-xs text-[rgba(255,255,255,0.6)] font-medium mb-1 truncate">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  {stat.change && (
                    <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1 truncate">
                      {stat.change}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[#4B8EFF]" />
            <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          </div>

          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className="aurora-card rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-hidden touch-manipulation"
                  onClick={() => router.push(action.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-[0_0_16px_rgba(75,142,255,0.35)] shrink-0`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {action.title}
                          </h3>
                          {action.badge && (
                            <span className="rounded-full bg-[rgba(63,191,140,0.2)] px-2 py-0.5 text-xs font-semibold text-[#B6F2DB] shrink-0">
                              {action.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[rgba(255,255,255,0.6)]">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[rgba(255,255,255,0.4)] shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* MENU ITEMS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className="aurora-card rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-hidden touch-manipulation"
                  onClick={() => router.push(item.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)] shrink-0">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-sm font-medium text-white flex-1">
                        {item.label}
                      </span>
                      <ArrowRight className="w-5 h-5 text-[rgba(255,255,255,0.4)] shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FOOTER SPACING */}
        <div className="h-4" />
      </div>
    </div>
  )
}
