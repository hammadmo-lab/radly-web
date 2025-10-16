'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { httpGet } from '@/lib/http'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuthSession } from '@/hooks/useAuthSession'

interface UsageData {
  subscription: {
    tier: string
    tier_display_name: string
    reports_used: number
    reports_limit: number
    reports_remaining: number
    period_end: string
    price_monthly: number
    currency: string
    status: string
  }
  usage_stats: {
    total_reports: number
    avg_generation_time: number
  }
}

export default function UsageWidget() {
  const { isAuthed, mounted } = useAuthSession()
  
  // Debug: Log authentication status
  console.log('🔍 UsageWidget Auth Status:', { mounted, isAuthed })
  
  const { data: usage, isLoading, error } = useQuery({
    queryKey: ['subscription-usage'],
    queryFn: async () => {
      console.log('🔍 UsageWidget: Fetching usage data...')
      console.log('🔍 Auth status:', { mounted, isAuthed })
      try {
        const result = await httpGet<UsageData>('/v1/subscription/usage')
        console.log('✅ UsageWidget: Successfully fetched usage data:', result)
        return result
      } catch (err) {
        console.error('❌ UsageWidget: Failed to fetch usage data:', err)
        throw err
      }
    },
    refetchInterval: 60000, // Refetch every minute
    enabled: mounted && isAuthed, // Only fetch when authenticated
    retry: (failureCount, error) => {
      console.log('🔄 UsageWidget: Retry attempt', failureCount, error)
      // Don't retry on authentication errors (401, 403)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status
        if (status === 401 || status === 403) {
          console.log('🚫 UsageWidget: Not retrying auth error:', status)
          return false
        }
      }
      return failureCount < 3
    },
  })

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
            {/* Debug info */}
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              Debug: mounted={mounted ? 'true' : 'false'}, isAuthed={isAuthed ? 'true' : 'false'}
            </div>
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
                    There was an error loading your subscription data. Please try refreshing the page.
                  </p>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm">
                      View Pricing Plans
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { subscription } = usage
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
          <Link href="/pricing">
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </Link>
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
        {usage.usage_stats && usage.usage_stats.total_reports > 0 && (
          <div className="pt-4 border-t grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Reports</p>
              <p className="text-lg font-semibold text-foreground">
                {usage.usage_stats.total_reports}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg. Time</p>
              <p className="text-lg font-semibold text-foreground">
                {usage.usage_stats.avg_generation_time.toFixed(1)}s
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
