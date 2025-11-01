'use client'

import { useState } from 'react'
import { useRevenueCat } from '@/hooks/useRevenueCat'
import { usePlatform } from '@/hooks/usePlatform'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface PaywallSheetProps {
  isOpen?: boolean
  onClose?: () => void
}

/**
 * Mobile Paywall Sheet Component
 *
 * Displays available subscription packages from RevenueCat
 * and handles purchase flow on iOS and Android.
 *
 * Only renders on native platforms (iOS/Android).
 */
export function PaywallSheet({ isOpen = true, onClose }: PaywallSheetProps) {
  const { isNative } = usePlatform()
  const {
    offerings,
    isLoadingOfferings,
    currentTier,
    purchasePackage,
    isPurchasing,
    restorePurchases,
    isRestoring,
    offeringsError,
  } = useRevenueCat()

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  // Don't render on web
  if (!isNative) {
    return null
  }

  // Don't render if closed
  if (!isOpen) {
    return null
  }

  const handlePurchase = async (packageId: string) => {
    try {
      setSelectedPackageId(packageId)
      const pkg = offerings?.current?.availablePackages.find(
        (p) => p.identifier === packageId
      )

      if (!pkg) {
        toast.error('Package not found')
        return
      }

      await purchasePackage(pkg)
      toast.success('Subscription purchased successfully!')
      onClose?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed'
      toast.error(errorMessage)
    } finally {
      setSelectedPackageId(null)
    }
  }

  const handleRestore = async () => {
    try {
      await restorePurchases()
      toast.success('Purchases restored successfully!')
      onClose?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restore failed'
      toast.error(errorMessage)
    }
  }

  // Show loading state
  if (isLoadingOfferings) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end z-50">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="w-full bg-white rounded-t-2xl p-6 flex items-center justify-center min-h-[300px]"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </motion.div>
      </div>
    )
  }

  // Show error state
  if (offeringsError) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end z-50">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="w-full bg-white rounded-t-2xl p-6"
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Error loading packages</p>
                <p className="text-sm text-red-700 mt-1">
                  {offeringsError instanceof Error ? offeringsError.message : 'Please try again later'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full mt-4"
          >
            Close
          </Button>
        </motion.div>
      </div>
    )
  }

  const packages = offerings?.current?.availablePackages || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-gray-600">
            Upgrade your account to unlock premium features
          </p>
          {currentTier && currentTier !== 'free' && (
            <div className="mt-3">
              <Badge className="bg-emerald-100 text-emerald-700">
                Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
              </Badge>
            </div>
          )}
        </div>

        {/* Packages Grid */}
        <div className="space-y-4 mb-6">
          {packages.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">
                  No packages available at this time
                </p>
              </CardContent>
            </Card>
          ) : (
            packages.map((pkg) => {
              const isCurrentTier = currentTier === pkg.identifier.split('_')[1]
              const isBestValue = pkg.identifier.includes('yearly')

              return (
                <motion.div
                  key={pkg.identifier}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      isCurrentTier
                        ? 'border-2 border-emerald-500 bg-emerald-50'
                        : 'border-2 border-gray-200 hover:border-primary'
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg capitalize">
                            {pkg.product.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {pkg.product.description || 'Premium features included'}
                          </p>
                        </div>
                        {isBestValue && (
                          <Badge className="bg-blue-100 text-blue-700 ml-2">
                            Save 17%
                          </Badge>
                        )}
                        {isCurrentTier && (
                          <Badge className="bg-emerald-100 text-emerald-700 ml-2">
                            Current
                          </Badge>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {pkg.product.priceString}
                          </span>
                          <span className="text-gray-600 text-sm">
                            {pkg.product.subscriptionPeriod?.includes('M') ? '/month' : pkg.product.subscriptionPeriod?.includes('Y') ? '/year' : '/subscription'}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handlePurchase(pkg.identifier)}
                        disabled={isPurchasing || isCurrentTier}
                        className="w-full"
                        variant={isCurrentTier ? 'outline' : 'default'}
                      >
                        {isCurrentTier ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Current Plan
                          </>
                        ) : isPurchasing && selectedPackageId === pkg.identifier ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Purchasing...
                          </>
                        ) : (
                          <>
                            <span>Subscribe Now</span>
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Restore Purchases Button */}
        <Button
          variant="outline"
          onClick={handleRestore}
          disabled={isRestoring}
          className="w-full mb-4"
        >
          {isRestoring ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Restoring...
            </>
          ) : (
            'Restore Previous Purchases'
          )}
        </Button>

        {/* Close Button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full"
        >
          Maybe Later
        </Button>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          All subscriptions include a 7-day free trial. Cancel anytime.
        </p>
      </motion.div>
    </div>
  )
}
