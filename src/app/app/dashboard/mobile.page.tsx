'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, FileText, BookTemplate, TrendingUp, Clock,
  Sparkles, Activity, Settings,
  CreditCard, Menu, X, LogOut, User as UserIcon,
  ChevronRight, AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { useSubscription } from '@/hooks/useSubscription'
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
  const { data: subscriptionData, isLoading, error } = useSubscription()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const stats = useMemo(() => {
    const sub = subscriptionData?.subscription
    const usageStats = subscriptionData?.usage_stats
    const avgGenerationSeconds = resolveAvgGenerationSeconds(usageStats)
    const hasAvgGenerationData = avgGenerationSeconds != null && avgGenerationSeconds >= 0.5
    const resetDays = daysUntil(sub?.period_end)

    return [
      {
        label: 'Reports used',
        value: sub ? `${sub.reports_used}/${sub.reports_limit}` : '—',
        subtitle: sub ? `${sub.reports_remaining} left` : '',
        icon: FileText,
        color: '#4B8EFF',
        gradient: 'from-[#4B8EFF]/20 via-[#2653FF]/10 to-transparent',
      },
      {
        label: 'Avg. time',
        value: hasAvgGenerationData ? formatSeconds(avgGenerationSeconds) : '—',
        subtitle: hasAvgGenerationData ? 'Per report' : '',
        icon: Clock,
        color: '#8F82FF',
        gradient: 'from-[#8F82FF]/20 via-[#4B8EFF]/10 to-transparent',
      },
      {
        label: 'Plan',
        value: sub?.tier_display_name ?? '—',
        subtitle: sub?.status ?? '',
        icon: CreditCard,
        color: '#3FBF8C',
        gradient: 'from-[#3FBF8C]/20 via-[#8F82FF]/10 to-transparent',
      },
      {
        label: 'Resets in',
        value: resetDays != null ? `${resetDays} days` : '—',
        subtitle: sub?.period_end ? new Date(sub.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        icon: TrendingUp,
        color: '#F8B74D',
        gradient: 'from-[#F8B74D]/20 via-[#FF6B6B]/10 to-transparent',
      },
    ]
  }, [subscriptionData])

  const usageLimit = subscriptionData?.subscription?.reports_limit ?? 0
  const usageUsed = subscriptionData?.subscription?.reports_used ?? 0
  const usagePercentage = usageLimit > 0 ? (usageUsed / usageLimit) * 100 : 0

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--ds-bg-gradient)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#4B8EFF] to-[#8F82FF] flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/60 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error/Unauthenticated state
  if (error || !subscriptionData) {
    return (
      <div className="min-h-screen bg-[var(--ds-bg-gradient)] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#FF6B6B]/20 to-[#F8B74D]/20 border border-[rgba(255,107,107,0.3)] flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-[#FF6B6B]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Unable to load</h3>
            <p className="text-white/60 text-sm mb-6">
              {!user ? 'Please sign in to view your dashboard' : 'Unable to fetch subscription data'}
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#4B8EFF] to-[#2653FF] rounded-2xl text-white font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      {/* Safe Area Spacer for Notch */}
      <div className="h-16 bg-[#0a0e1a]" />

      {/* Header - Sticky with safe area for notch */}
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
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-white/60">Welcome back</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/app/settings')}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
        >
          <Settings className="w-6 h-6 text-white/80" />
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6 pb-32">
        {/* Usage Card - iOS Native Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#4B8EFF]/15 via-[rgba(255,255,255,0.03)] to-transparent backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4B8EFF] to-[#2653FF] flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-medium">
                  {subscriptionData.subscription.tier_display_name}
                </p>
                <p className="text-sm font-semibold text-white">
                  {subscriptionData.subscription.reports_used} of {subscriptionData.subscription.reports_limit} used
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white active:scale-95 transition-transform inline-flex items-center justify-center"
            >
              Upgrade
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#4B8EFF] to-[#8F82FF] rounded-full"
            />
          </div>
          <p className="text-xs text-white/50 text-right">
            {subscriptionData.subscription.reports_remaining} reports remaining
          </p>
        </motion.div>

        {/* Stats Grid - iOS Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} border border-white/10 flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="text-xs text-white/50 font-medium mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-white mb-0.5">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-xs text-white/40">{stat.subtitle}</p>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-base font-semibold text-white/90 px-1">Quick Actions</h2>

          {/* New Report - Primary Action */}
          <Link href="/app/templates">
            <div className="bg-gradient-to-br from-[#4B8EFF] to-[#2653FF] rounded-2xl p-5 active:scale-[0.98] transition-transform shadow-[0_8px_24px_rgba(75,142,255,0.3)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">New Report</h3>
                    <p className="text-sm text-white/80">Choose a template to start</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/60" />
              </div>
            </div>
          </Link>

          {/* Templates */}
          <Link href="/app/templates">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#8F82FF]/20 to-transparent rounded-xl flex items-center justify-center border border-white/10">
                    <BookTemplate className="w-5 h-5 text-[#8F82FF]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Browse Templates</h3>
                    <p className="text-xs text-white/50">View all available templates</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            </div>
          </Link>

          {/* Reports */}
          <Link href="/app/reports">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3FBF8C]/20 to-transparent rounded-xl flex items-center justify-center border border-white/10">
                    <FileText className="w-5 h-5 text-[#3FBF8C]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">My Reports</h3>
                    <p className="text-xs text-white/50">Access your generated reports</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Warning if approaching limit */}
        {usagePercentage >= 80 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-[#F8B74D]/15 via-[rgba(255,255,255,0.03)] to-transparent backdrop-blur-xl border border-[#F8B74D]/30 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#F8B74D]/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-[#F8B74D]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">
                  {usagePercentage >= 100 ? 'Limit reached' : 'Approaching limit'}
                </h3>
                <p className="text-xs text-white/70 mb-3">
                  {usagePercentage >= 100
                    ? `Upgrade to continue or wait ${daysUntil(subscriptionData.subscription.period_end)} days`
                    : 'Consider upgrading for more reports'}
                </p>
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-[#F8B74D]/20 border border-[#F8B74D]/40 rounded-xl text-xs font-semibold text-[#F8B74D] active:scale-95 transition-transform inline-flex items-center justify-center"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(10,14,26,0.95)] backdrop-blur-xl border-t border-white/10"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      >
        <div className="flex items-center justify-around px-2 pt-3 pb-2">
          <Link href="/app/templates" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
              <BookTemplate className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-[10px] font-medium text-white/50">Templates</span>
          </Link>
          <Link href="/app/reports" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-[10px] font-medium text-white/50">Reports</span>
          </Link>
        </div>
      </div>

      {/* Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-[rgba(10,14,26,0.98)] backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col"
            style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}
          >
              {/* Menu Header */}
              <div className="p-6 border-b border-white/10" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4B8EFF] to-[#2653FF] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider">Radly</p>
                      <p className="text-base font-bold text-white">Assistant</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-white/70" />
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
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
                    <Activity className="w-5 h-5 text-[#4B8EFF]" />
                    <span className="text-base font-medium text-white">Dashboard</span>
                  </div>
                </Link>
                <Link href="/app/templates" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
                    <BookTemplate className="w-5 h-5 text-white/60" />
                    <span className="text-base font-medium text-white/80">Templates</span>
                  </div>
                </Link>
                <Link href="/app/reports" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
                    <FileText className="w-5 h-5 text-white/60" />
                    <span className="text-base font-medium text-white/80">Reports</span>
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
              <div className="p-4 border-t border-white/10 bg-[#0a0e1a]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 active:scale-95 transition-all min-h-[56px] touch-manipulation"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-base font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
