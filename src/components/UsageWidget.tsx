'use client'

import { useEffect } from 'react'
import { AlertCircle, Calendar, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useSubscription } from '@/hooks/useSubscription'
import { formatSeconds, resolveAvgGenerationSeconds } from '@/utils/time'

export default function UsageWidget() {
  const { isAuthed } = useAuthSession()
  const { data: usage, isLoading, error, refetch } = useSubscription()

  // Debug: Log when data changes
  useEffect(() => {
    if (usage) {
      console.log('📊 UsageWidget: Data updated:', {
        reportsUsed: usage.subscription.reports_used,
        reportsLimit: usage.subscription.reports_limit,
        reportsRemaining: usage.subscription.reports_remaining
      })
    }
  }, [usage])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !usage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Unable to load usage information
            </p>
            <div className="space-y-2">
              {!isAuthed ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Please sign in to view your subscription details.
                  </p>
                  <Link href="/auth/signin">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Authentication error: Token validation failed. Please try signing out and signing back in.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/auth/signin">
                      <Button variant="outline" size="sm">
                        Sign In Again
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="outline" size="sm">
                        View Pricing Plans
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { subscription } = usage
  const usageStats = usage.usage_stats || null
  const avgGenerationSecondsRaw = resolveAvgGenerationSeconds(usageStats)
  const avgGenerationSeconds = avgGenerationSecondsRaw != null && avgGenerationSecondsRaw >= 0.5
    ? avgGenerationSecondsRaw
    : null
  const totalReports = Number(usageStats?.total_reports ?? 0)
  const usagePercentage = (subscription.reports_used / subscription.reports_limit) * 100
  
  const daysUntilReset = Math.ceil(
    (new Date(subscription.period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {subscription.tier_display_name} Plan
            </CardTitle>
            {subscription.price_monthly > 0 && (
              <CardDescription>
                {subscription.price_monthly} {subscription.currency}/month
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                console.log('🔄 Manual refresh triggered')
                refetch()
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link href="/pricing">
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {subscription.reports_used} of {subscription.reports_limit} reports used
            </span>
            <span className="font-medium text-foreground">
              {subscription.reports_remaining} remaining
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress 
              value={Math.min(usagePercentage, 100)} 
            />
          </div>
        </div>

        {/* Reset Date */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''} 
            {' '}({new Date(subscription.period_end).toLocaleDateString()})
          </span>
        </div>

        {/* Warning when approaching limit */}
        {usagePercentage >= 80 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  {usagePercentage >= 100
                    ? 'Monthly limit reached'
                    : 'Approaching monthly limit'}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {usagePercentage >= 100 ? (
                    <>
                      Upgrade to continue generating reports or wait {daysUntilReset} days for reset.
                    </>
                  ) : (
                    <>Consider upgrading to a higher tier for more reports.</>
                  )}
                </p>
                {subscription.tier !== 'premium' && (
                  <Link href="/pricing" className="inline-block mt-2">
                    <Button variant="outline" size="sm" className="h-8">
                      View upgrade options →
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {(totalReports > 0 || avgGenerationSeconds != null) && (
          <div className="pt-4 border-t grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Reports</p>
              <p className="text-lg font-semibold text-foreground">
                {totalReports}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg. Time</p>
              <p className="text-lg font-semibold text-foreground">
                {formatSeconds(avgGenerationSeconds)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
