/**
 * Subscription Status Card Component
 *
 * Displays the user's current subscription with platform-specific management options.
 * Shows different UI based on whether subscription is from web, iOS, or Android.
 */

'use client'

import { usePlatform } from '@/hooks/usePlatform'
import { useSubscriptionStatus } from '@/hooks/useSubscription'
import { useRestorePurchases, useSyncSubscriptions } from '@/hooks/useMobileSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CreditCard, Store, ExternalLink, Smartphone, Globe, RefreshCw, History } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
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

  const { data: subscriptionData, isLoading } = useSubscriptionStatus()
  const subscription = subscriptionData?.current_tier
  const activeSubscriptions = subscriptionData?.active_subscriptions || []

  // Mobile subscription mutations
  const { mutate: syncSubscriptions, isPending: isSyncing } = useSyncSubscriptions({
    onSuccess: (data) => {
      if (data.errors && data.errors.length > 0) {
        toast.error(`Synced ${data.synced_count} subscriptions, but ${data.errors.length} failed`)
      } else {
        toast.success(`Successfully synced ${data.synced_count} subscription(s)`)
      }
    },
    onError: (error) => {
      toast.error('Failed to sync subscriptions: ' + error.message)
    },
  })

  // Note: Restore purchases requires platform-specific receipt/token data
  // This would typically be called from native app code with Capacitor
  // For now, we'll show the button but with a placeholder implementation
  const [isRestoring, setIsRestoring] = useState(false)

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

  // Determine subscription platform from the API response
  const subscriptionPlatform = subscription.platform || platform
  const isPlatformWeb = subscriptionPlatform === 'web'
  const isPlatformMobile = subscriptionPlatform === 'ios' || subscriptionPlatform === 'android'

  // Check if user has multiple active subscriptions
  const hasMultipleSubscriptions = activeSubscriptions.length > 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPlatformWeb ? (
              <Globe className="w-5 h-5" />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
            Subscription
          </div>
          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
            {subscription.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          {subscription.tier_display_name || subscription.tier_name} Plan
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
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
          <Progress value={usagePercentage} />
        </div>

        {/* Billing Info */}
        <div className="space-y-2 text-sm">
          {subscription.expires_at && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {subscription.auto_renew ? 'Renews on' : 'Expires on'}
              </span>
              <span className="font-medium">
                {new Date(subscription.expires_at).toLocaleDateString()}
              </span>
            </div>
          )}
          {subscription.days_until_expiration !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Days Remaining</span>
              <span className="font-medium">
                {subscription.days_until_expiration}
              </span>
            </div>
          )}
        </div>

        {/* Multiple Subscriptions Notice */}
        {hasMultipleSubscriptions && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              You have {activeSubscriptions.length} active subscriptions across different platforms.
              Showing your highest tier: {subscription.tier_display_name || subscription.tier_name}
            </p>
          </div>
        )}

        {/* Management Actions */}
        <div className="pt-4 border-t">
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

          {shouldShowMobileSubscriptions && isPlatformMobile && (
            <div className="space-y-2">
              {subscriptionManagementUrl && (
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
              )}

              {/* Mobile subscription management buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncSubscriptions()}
                  disabled={isSyncing}
                  className="w-full"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // This will be implemented when Capacitor is integrated
                    // For now, show a message
                    toast.info('Restore purchases will be available in the mobile app')
                  }}
                  disabled={isRestoring}
                  className="w-full"
                >
                  <History className="w-3 h-3 mr-1" />
                  Restore
                </Button>
              </div>

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
