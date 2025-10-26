/**
 * Mobile App Pricing Redirect Component
 *
 * Shows a message to mobile app users directing them to manage subscriptions
 * in the App Store or Google Play instead of showing web pricing.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePlatform } from '@/hooks/usePlatform'
import { Store, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function MobileAppPricingRedirect() {
  const {
    isNative,
    displayName,
    storeName,
    subscriptionManagementUrl,
    isReady,
  } = usePlatform()
  const router = useRouter()

  // Don't render anything during SSR or if on web
  if (!isReady || !isNative) {
    return null
  }

  const handleManageSubscription = () => {
    if (subscriptionManagementUrl) {
      window.open(subscriptionManagementUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ds-bg-gradient)] px-4">
      <div className="aurora-card w-full max-w-md border border-[rgba(255,255,255,0.1)] p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(38,83,255,0.15)]">
            <Store className="h-8 w-8 text-[rgba(75,142,255,0.9)]" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-white">
          Manage Subscription in {storeName}
        </h1>

        <p className="mt-4 text-sm text-[rgba(207,207,207,0.75)] sm:text-base">
          You're using the {displayName} app. To subscribe or manage your subscription, please use the {storeName}.
        </p>

        <div className="mt-8 space-y-3">
          {subscriptionManagementUrl && (
            <button
              onClick={handleManageSubscription}
              className="w-full rounded-lg bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_45%,#8F82FF_100%)] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(143,130,255,0.65)]"
            >
              Open {storeName}
            </button>
          )}

          <Link
            href="/app/dashboard"
            className="flex items-center justify-center gap-2 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.5)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[rgba(12,16,28,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(143,130,255,0.65)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-[rgba(207,207,207,0.55)]">
          All {displayName} subscriptions are managed through the {storeName}.
          Web-based subscriptions are not available in the mobile app.
        </p>
      </div>
    </div>
  )
}
