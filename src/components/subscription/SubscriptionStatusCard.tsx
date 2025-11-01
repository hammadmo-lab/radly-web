/**
 * Subscription Status Card Component
 *
 * Displays the user's current subscription with platform-specific management options.
 * Shows different UI based on whether subscription is from web, iOS, or Android.
 */

'use client'

import { usePlatform } from '@/hooks/usePlatform'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CreditCard, Store, ExternalLink, Smartphone, Globe } from 'lucide-react'
import Link from 'next/link'

export function SubscriptionStatusCard() {
  const {
    platform,
    storeName,
    shouldShowWebSubscriptions,
    shouldShowMobileSubscriptions,
    subscriptionManagementUrl,
    isReady,
  } = usePlatform()

  const { data: usageData, isLoading } = useSubscription()
  const subscription = usageData?.subscription

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
          {subscription.tier_display_name || subscription.tier} Plan
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
