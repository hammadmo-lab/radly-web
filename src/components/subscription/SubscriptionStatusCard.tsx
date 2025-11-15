/**
 * Subscription Status Card Component
 *
 * Displays the user's current subscription with platform-specific management options.
 * Shows different UI based on whether subscription is from web, iOS, or Android.
 * Includes manual refresh button and tier change notifications.
 */

'use client'

import { useState, useEffect } from 'react'
import { usePlatform } from '@/hooks/usePlatform'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CreditCard, Store, ExternalLink, Smartphone, Globe, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export function SubscriptionStatusCard() {
  const {
    platform,
    storeName,
    shouldShowWebSubscriptions,
    shouldShowMobileSubscriptions,
    subscriptionManagementUrl,
    isReady,
  } = usePlatform()

  const { data: usageData, isLoading, forceRefresh, clearCache, error } = useSubscription()
  const subscription = usageData?.subscription
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showTierChangeNotification, setShowTierChangeNotification] = useState(false)
  const [tierChangeInfo, setTierChangeInfo] = useState<{
    previous: string
    current: string
    status: string
  } | null>(null)

  // Handle tier change notifications
  useEffect(() => {
    const handleTierChange = (event: CustomEvent) => {
      const { previousTier, currentTier, status } = event.detail
      setTierChangeInfo({
        previous: previousTier,
        current: currentTier,
        status,
      })
      setShowTierChangeNotification(true)

      // Show toast notification
      const statusMessages: Record<string, string> = {
        expired: `Your ${previousTier} subscription has expired. You're now on the ${currentTier} plan.`,
        cancelled: `Your ${previousTier} subscription was cancelled. You're now on the ${currentTier} plan.`,
      }

      const message = statusMessages[status] ||
        `Your subscription has been updated from ${previousTier} to ${currentTier}.`

      toast.success(message, {
        duration: 5000,
      })

      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setShowTierChangeNotification(false)
      }, 10000)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('subscription:tier-change', handleTierChange as EventListener)
      return () => {
        window.removeEventListener('subscription:tier-change', handleTierChange as EventListener)
      }
    }
  }, [])

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await forceRefresh()
      toast.success('Subscription data refreshed', {
        description: 'Latest quota and status information loaded',
      })
    } catch (err) {
      console.error('Refresh failed:', err)
      toast.error('Failed to refresh subscription data', {
        description: 'Please try again or check your connection',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle cache clear
  const handleClearCache = () => {
    clearCache()
    toast.success('Cache cleared', {
      description: 'Subscription data will be refetched on next access',
    })
  }

  if (!isReady || isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="h-4 w-60 bg-muted rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You don't have an active subscription yet.
          </p>
          {shouldShowWebSubscriptions && (
            <Button asChild>
              <Link href="/pricing">
                View Plans
              </Link>
            </Button>
          )}
          {shouldShowMobileSubscriptions && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Subscribe through the {storeName} to unlock premium features.
              </p>
              {subscriptionManagementUrl && (
                <Button asChild>
                  <a
                    href={subscriptionManagementUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Open {storeName}
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Calculate usage percentage
  const usagePercentage = Math.min(
    100,
    (subscription.reports_used / subscription.reports_limit) * 100
  )

  // Determine subscription platform display (no platform in subscription data, use current platform)
  const subscriptionPlatform = platform
  const isPlatformWeb = subscriptionPlatform === 'web'
  const isPlatformMobile = subscriptionPlatform === 'ios' || subscriptionPlatform === 'android'

  // Get status configuration
  const getStatusConfig = () => {
    const configs = {
      active: {
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Active',
        variant: 'default' as const,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      expired: {
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Expired',
        variant: 'secondary' as const,
        className: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      cancelled: {
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Cancelled',
        variant: 'secondary' as const,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      },
    }

    return configs[subscription.status as keyof typeof configs] || configs.active
  }

  const statusConfig = getStatusConfig()

  return (
    <Card className="relative overflow-hidden">
      {/* Tier Change Notification Banner */}
      {showTierChangeNotification && tierChangeInfo && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 text-center text-sm font-medium z-10 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>
              Subscription updated: {tierChangeInfo.previous} → {tierChangeInfo.current}
            </span>
          </div>
        </div>
      )}

      <CardHeader className={showTierChangeNotification ? 'pt-12' : ''}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPlatformWeb ? (
              <Globe className="w-5 h-5" />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
            Subscription
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh subscription status"
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Badge className={statusConfig.className}>
              <span className="flex items-center gap-1">
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          {subscription.tier_display_name || subscription.tier} Plan
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Message for Expired/Cancelled */}
        {subscription.status === 'expired' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">
                  Subscription Expired
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Your {subscription.tier} subscription has expired. You're now on the free plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {subscription.status === 'cancelled' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Subscription Cancelled
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Access continues until your billing period ends on{' '}
                  {new Date(subscription.period_end).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Platform Badge */}
        {isPlatformMobile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="w-4 h-4" />
            <span>
              Managed by{' '}
              {subscriptionPlatform === 'ios' ? 'App Store' : 'Google Play'}
            </span>
          </div>
        )}

        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reports Used</span>
            <span className="font-medium">
              {subscription.reports_used} / {subscription.reports_limit}
            </span>
          </div>
          <div className={usagePercentage >= 90 ? '[&>div]:bg-orange-500' : ''}>
            <Progress value={usagePercentage} />
          </div>
        </div>

        {/* Billing Info */}
        <div className="space-y-2 text-sm">
          {subscription.price_monthly !== 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">
                {subscription.price_monthly} {subscription.currency}/month
              </span>
            </div>
          )}
          {subscription.period_end && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {subscription.status === 'active' ? 'Renews on' : 'Expires on'}
              </span>
              <span className="font-medium">
                {new Date(subscription.period_end).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Management Actions */}
        <div className="pt-4 border-t space-y-3">
          {/* Debug/Utility Buttons (only show if error or for debugging) */}
          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="w-full text-xs"
            >
              Clear Cache & Retry
            </Button>
          )}

          {shouldShowWebSubscriptions && isPlatformWeb && (
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/pricing">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Change Plan
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Manage your web subscription
              </p>
            </div>
          )}

          {shouldShowMobileSubscriptions && isPlatformMobile && subscriptionManagementUrl && (
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <a
                  href={subscriptionManagementUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Store className="w-4 h-4 mr-2" />
                  Manage in {storeName}
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Subscription managed through {storeName}
              </p>
            </div>
          )}

          {/* Cross-platform message */}
          {shouldShowMobileSubscriptions && isPlatformWeb && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                You have a web subscription. To use mobile app subscriptions,
                please subscribe through the {storeName} on your mobile device.
              </p>
            </div>
          )}

          {shouldShowWebSubscriptions && isPlatformMobile && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                You have a mobile subscription managed through {storeName}.
                To change your plan, please use your device's app store.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
