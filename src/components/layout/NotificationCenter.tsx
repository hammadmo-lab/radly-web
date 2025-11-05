'use client'

import type { ComponentProps } from 'react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubscription } from '@/hooks/useSubscription'
import { formatSeconds, resolveAvgGenerationSeconds } from '@/utils/time'
import { cn } from '@/lib/utils'

type LucideIcon = typeof Sparkles

interface NotificationCard {
  id: string
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
  badge?: string
  badgeVariant?: ComponentProps<typeof Badge>['variant']
  badgeClassName?: string
  meta?: string
  actionLabel?: string
  href?: string
  onAction?: () => void
  progress?: number
  attention?: boolean
}

interface RecentDraft {
  id: string
  name: string | null
}

function isValidDate(date: Date | null) {
  return Boolean(date && !Number.isNaN(date.getTime()))
}

export function NotificationCenter() {
  const router = useRouter()
  const { data: subscriptionData, isLoading: subscriptionLoading } = useSubscription()
  const [open, setOpen] = useState(false)
  const [openedOnce, setOpenedOnce] = useState(false)
  const [recentDraft, setRecentDraft] = useState<RecentDraft | null>(null)
  const [dailyInsight] = useState(() => {
    const insights = [
      {
        id: 'insight-templates',
        title: 'Plan tomorrow\'s templates today',
        description: 'Queue up tomorrow\'s cases in Templates and they\'ll be ready for review when you log in.',
        icon: Sparkles,
        iconClassName: 'bg-[rgba(143,130,255,0.18)] text-[#8F82FF] ring-[rgba(143,130,255,0.45)]',
        badge: 'Workflow tip',
        badgeVariant: 'outline' as const,
        badgeClassName: 'border-transparent bg-[rgba(143,130,255,0.18)] text-[#D7D1FF]',
        actionLabel: 'Browse templates',
        href: '/app/templates',
      },
      {
        id: 'insight-reports',
        title: 'Keep your report history tidy',
        description: 'Archive older reports from the Reports page to keep search lightning fast.',
        icon: FileText,
        iconClassName: 'bg-[rgba(75,142,255,0.16)] text-[#4B8EFF] ring-[rgba(75,142,255,0.35)]',
        badge: 'Housekeeping',
        badgeVariant: 'outline' as const,
        badgeClassName: 'border-transparent bg-[rgba(75,142,255,0.18)] text-[#C7DAFF]',
        actionLabel: 'Open reports',
        href: '/app/reports',
      },
      {
        id: 'insight-speed',
        title: 'Speed up with reusable snippets',
        description: 'Save recurring phrases as template snippets so every new report starts 80% complete.',
        icon: Zap,
        iconClassName: 'bg-[rgba(63,191,140,0.16)] text-[#3FBF8C] ring-[rgba(63,191,140,0.35)]',
        badge: 'Power user',
        badgeVariant: 'outline' as const,
        badgeClassName: 'border-transparent bg-[rgba(63,191,140,0.18)] text-[#B6F2DB]',
        actionLabel: 'Manage templates',
        href: '/app/templates',
      },
    ]

    return insights[Math.floor(Math.random() * insights.length)]
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = localStorage.getItem('recent-template-id')
    const name = localStorage.getItem('recent-template-name')
    if (id) {
      setRecentDraft({ id, name })
    }
  }, [])

  const subscriptionNotifications = useMemo(() => {
    const notifications: NotificationCard[] = []
    const subscription = subscriptionData?.subscription

    if (subscription) {
      const totalReports = subscription.reports_limit || 0
      const usedReports = subscription.reports_used || 0
      const remainingReports = Math.max(subscription.reports_remaining ?? 0, 0)
      const usagePercent = totalReports > 0 ? Math.min((usedReports / totalReports) * 100, 100) : 0
      const periodEnd = subscription.period_end ? new Date(subscription.period_end) : null
      const resetCopy = isValidDate(periodEnd)
        ? `Resets ${formatDistanceToNow(periodEnd!, { addSuffix: true })}`
        : 'Cycle renewal date coming up'
      const isRunningLow = totalReports > 0
        ? remainingReports <= Math.max(3, Math.round(totalReports * 0.15))
        : remainingReports <= 3

      notifications.push({
        id: 'subscription-usage',
        title: isRunningLow ? "You're nearing your plan limit" : 'Plenty of runway left',
        description: isRunningLow
          ? `Only ${remainingReports} report${remainingReports === 1 ? '' : 's'} left on the ${subscription.tier_display_name} plan.`
          : `You still have ${remainingReports} report${remainingReports === 1 ? '' : 's'} available this cycle.`,
        icon: TrendingUp,
        iconClassName: isRunningLow
          ? 'bg-[rgba(255,107,107,0.18)] text-[#FF6B6B] ring-[rgba(255,107,107,0.35)]'
          : 'bg-[rgba(63,191,140,0.16)] text-[#3FBF8C] ring-[rgba(63,191,140,0.35)]',
        badge: `${Math.round(usagePercent)}% used`,
        badgeVariant: 'outline',
        badgeClassName: isRunningLow
          ? 'bg-[rgba(255,107,107,0.18)] text-[#FFD7D7] border-transparent'
          : 'bg-[rgba(63,191,140,0.18)] text-[#D0F7EB] border-transparent',
        meta: resetCopy,
        progress: usagePercent,
        actionLabel: isRunningLow ? 'Review plans' : undefined,
        href: isRunningLow ? '/pricing' : undefined,
        attention: isRunningLow,
      })

      const avgSeconds = resolveAvgGenerationSeconds(subscriptionData?.usage_stats)
      if (avgSeconds != null && avgSeconds >= 0.5) {
        notifications.push({
          id: 'generation-speed',
          title: `Reports finish in ~${formatSeconds(avgSeconds)}`,
          description: 'Your 30-day average generation time looks healthy. We will surface alerts if it trends upward.',
          icon: Clock,
          iconClassName: 'bg-[rgba(75,142,255,0.16)] text-[#4B8EFF] ring-[rgba(75,142,255,0.35)]',
          badge: 'Performance',
          badgeVariant: 'outline',
          badgeClassName: 'border-transparent bg-[rgba(75,142,255,0.18)] text-[#C7DAFF]',
          meta: `Tracking ${subscriptionData?.usage_stats?.total_reports ?? subscription.reports_used} recent reports`,
        })
      }
    }

    return notifications
  }, [subscriptionData])

  const draftNotification = useMemo<NotificationCard | null>(() => {
    if (!recentDraft) return null
    const trimmedName = recentDraft.name
      ? recentDraft.name.length > 40
        ? `${recentDraft.name.slice(0, 37)}…`
        : recentDraft.name
      : null

    return {
      id: 'resume-draft',
      title: trimmedName ? `Resume "${trimmedName}"` : 'Resume your saved draft',
      description: 'We\'ll restore the latest inputs so you can finish in one click.',
      icon: FileText,
      iconClassName: 'bg-[rgba(143,130,255,0.18)] text-[#8F82FF] ring-[rgba(143,130,255,0.45)]',
      badge: 'Draft ready',
      badgeVariant: 'outline',
      badgeClassName: 'border-transparent bg-[rgba(75,142,255,0.18)] text-[#C7DAFF]',
      actionLabel: 'Open draft',
      href: `/app/generate?templateId=${encodeURIComponent(recentDraft.id)}`,
      attention: true,
    }
  }, [recentDraft])

  const notifications = useMemo(() => {
    const items: NotificationCard[] = [...subscriptionNotifications]
    if (draftNotification) items.unshift(draftNotification)

    if (dailyInsight) {
      items.push({
        ...dailyInsight,
        attention: false,
      })
    }

    return items
  }, [subscriptionNotifications, draftNotification, dailyInsight])

  const handleNavigate = useCallback(
    (href?: string, action?: () => void) => {
      if (href) {
        router.push(href)
      } else if (action) {
        action()
      }
      setOpen(false)
    },
    [router]
  )

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen && !openedOnce) {
      setOpenedOnce(true)
    }
  }

  const hasAttention = notifications.some((notification) => notification.attention)
  const showAttentionBadge = hasAttention && !open && !openedOnce

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative hidden sm:flex text-[rgba(207,207,207,0.75)] transition-transform hover:scale-[1.03] hover:text-white',
            open && 'text-[#4B8EFF]'
          )}
          title="Notifications"
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5" />
          {showAttentionBadge && (
            <span className="absolute top-1 right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
              {Math.min(notifications.length, 9)}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-full max-w-lg max-h-[85vh] flex-col overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,12,14,0.95)] p-0 shadow-[0_24px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl safe-area-inset-top">
        <div className="border-b border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(38,83,255,0.4)0%,rgba(12,12,14,0.9)70%)] px-6 py-5 safe-area-pt safe-area-px">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[rgba(207,207,207,0.75)]">
                Notification Center
              </p>
              <DialogTitle className="mt-1 text-2xl font-semibold text-white">
                Stay on track effortlessly
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-[rgba(207,207,207,0.75)]">
                Tailored nudges and insights so your reporting flow stays fast.
              </DialogDescription>
            </div>
            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.12)] text-[#4B8EFF] shadow-[0_0_10px_rgba(75,142,255,0.35)]">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 safe-area-px safe-area-pb">
          {subscriptionLoading && notifications.length === 0 ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.16)] bg-[rgba(22,22,26,0.7)] p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)] shadow">
                <Sparkles className="h-6 w-6 text-[#4B8EFF]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                All quiet for now
              </h3>
              <p className="mt-2 text-sm text-[rgba(207,207,207,0.75)]">
                We'll ping you here when there's something truly worth your attention.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,26,0.92)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
              >
                <div className="grid gap-3 px-4 py-4 sm:grid-cols-[auto,1fr] sm:gap-5 sm:px-5 sm:py-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,12,14,0.8)] shadow-inner">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset',
                        notification.iconClassName
                      )}
                    >
                      <notification.icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-tight text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm leading-relaxed text-[rgba(207,207,207,0.75)]">
                          {notification.description}
                        </p>
                      </div>
                      {notification.badge && (
                        <Badge
                          variant={notification.badgeVariant}
                          className={cn(
                            'rounded-full border border-transparent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide leading-none',
                            notification.badgeClassName
                          )}
                        >
                          {notification.badge}
                        </Badge>
                      )}
                    </div>

                    {notification.progress != null && (
                      <div className="space-y-2">
                        <Progress value={notification.progress} />
                        <p className="text-xs font-medium uppercase tracking-wide text-[rgba(207,207,207,0.6)]">
                          {notification.meta}
                        </p>
                      </div>
                    )}

                    {notification.progress == null && notification.meta && (
                      <p className="text-xs font-medium uppercase tracking-wide text-[rgba(207,207,207,0.6)]">
                        {notification.meta}
                      </p>
                    )}
                  </div>
                </div>
                {notification.actionLabel && (
                  <div className="flex items-center justify-end gap-2 border-t border-[rgba(255,255,255,0.08)] px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-4 text-sm font-semibold text-[#4B8EFF] border-[#4B8EFF]/30 hover:bg-[rgba(75,142,255,0.12)]"
                      onClick={() => handleNavigate(notification.href, notification.onAction)}
                    >
                      {notification.actionLabel}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}

          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,26,0.88)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Tune your notification preferences
                </p>
                <p className="text-sm text-[rgba(207,207,207,0.75)]">
                  Choose email digests and in-app nudges that work best for your day.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-1 h-9 px-3 text-sm font-semibold text-[#4B8EFF] border-[#4B8EFF]/30 hover:bg-[rgba(75,142,255,0.12)] sm:mt-0"
                onClick={() => handleNavigate('/app/settings')}
              >
                Adjust settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
