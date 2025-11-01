"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  AlertCircle,
  Copy,
  LogOut,
  Trash2,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog'
import { EnhancedChangeTierDialog } from '@/components/admin/EnhancedChangeTierDialog'
import { useUserSubscription } from '@/hooks/useAdminData'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { useUserEmails } from '@/hooks/useUserEmails'
import { toast } from 'sonner'

export default function UserDetailsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [isChangeTierOpen, setIsChangeTierOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const userId = searchParams.get('userId')
  const email = searchParams.get('email')

  // Redirect if no userId provided
  useEffect(() => {
    if (!userId) {
      router.push('/admin')
    }
  }, [userId, router])

  const { data, isLoading, error } = useUserSubscription(userId || '')
  const { data: emailMap } = useUserEmails(userId ? [userId] : [])
  const userEmail = email || emailMap?.[userId || '']

  const handleBack = () => {
    router.push('/admin')
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const copyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId)
      toast.success('User ID copied to clipboard')
    }
  }

  if (!userId) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-[#0C0C0E] flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      </AdminGuard>
    )
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-[#0C0C0E]">
          {/* Header */}
          <header className="bg-[rgba(18,22,36,0.95)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.12)] sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14 sm:h-16">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="hover:bg-[rgba(255,255,255,0.08)] text-white flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-white truncate">User Details</h1>
                    <p className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)] truncate">{userId}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Loading Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-[rgba(18,22,36,0.8)] border-[rgba(255,255,255,0.12)]">
                  <CardHeader>
                    <Skeleton className="h-6 w-32 bg-[rgba(255,255,255,0.1)]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full bg-[rgba(255,255,255,0.1)]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </AdminGuard>
    )
  }

  if (error) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-[#0C0C0E]">
          {/* Header */}
          <header className="bg-[rgba(18,22,36,0.95)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.12)] sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14 sm:h-16">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="hover:bg-[rgba(255,255,255,0.08)] text-white flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-white truncate">User Details</h1>
                    <p className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)] truncate">{userId}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 border-[rgba(255,255,255,0.12)] text-white hover:bg-[rgba(255,255,255,0.08)]"
                  size="sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Error Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Alert variant="destructive" className="bg-[rgba(255,107,107,0.12)] border-[rgba(255,107,107,0.35)] text-white">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-white">Error Loading User</AlertTitle>
              <AlertDescription className="text-[rgba(255,255,255,0.85)]">
                Failed to load details for user ID: {userId}
                <br />
                {error.message}
              </AlertDescription>
            </Alert>
          </main>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0C0C0E]">
        {/* Header */}
        <header className="bg-[rgba(18,22,36,0.95)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.12)] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="hover:bg-[rgba(255,255,255,0.08)] text-white flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-white truncate">User Details</h1>
                  <p className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)] truncate">{userId}</p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 border-[rgba(255,255,255,0.12)] text-white hover:bg-[rgba(255,255,255,0.08)]"
                size="sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
          <div className="space-y-4 sm:space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={copyUserId}
                className="border-[rgba(255,255,255,0.12)] text-white hover:bg-[rgba(255,255,255,0.08)] min-h-[44px]"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangeTierOpen(true)}
                disabled={!data?.subscription}
                className="border-[rgba(255,255,255,0.12)] text-white hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-40 min-h-[44px]"
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Tier
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
                className="bg-[rgba(255,107,107,0.18)] border border-[rgba(255,107,107,0.35)] text-white hover:bg-[rgba(255,107,107,0.28)] min-h-[44px]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </div>

            {/* User ID Card */}
            <div className="border border-[rgba(255,255,255,0.12)] rounded-2xl p-4 sm:p-6 bg-[rgba(18,22,36,0.6)]">
              <h2 className="font-semibold mb-4 text-white text-base sm:text-lg">User Information</h2>
              <div className="space-y-3">
                {/* Email */}
                {userEmail && userEmail.includes('@') && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                    <span className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)]">Email:</span>
                    <span className="font-medium text-sm sm:text-base text-white break-all">{userEmail}</span>
                  </div>
                )}

                {/* User ID */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                  <span className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)]">User ID:</span>
                  <code className="text-xs sm:text-sm bg-[rgba(255,255,255,0.08)] px-2 py-1 rounded font-mono text-white break-all">
                    {userId}
                  </code>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            {data?.subscription ? (
              <div className="border border-[rgba(255,255,255,0.12)] rounded-2xl p-4 sm:p-6 bg-[rgba(18,22,36,0.6)]">
                <h2 className="font-semibold mb-4 text-white text-base sm:text-lg">Subscription Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)] block mb-1">Tier</span>
                    <p className="font-medium text-white text-sm sm:text-base">{data.subscription.tier_display_name || data.subscription.tier_name}</p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)] block mb-1">Status</span>
                    <p className="font-medium capitalize text-white text-sm sm:text-base">{data.subscription.status}</p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)] block mb-1">Region</span>
                    <p className="font-medium capitalize text-white text-sm sm:text-base">{data.subscription.region}</p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)] block mb-1">Reports Used</span>
                    <p className="font-medium text-white text-sm sm:text-base">
                      {data.subscription.reports_used_current_period} / {data.subscription.reports_limit}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)] block mb-1">Price Paid</span>
                    <p className="font-medium text-white text-sm sm:text-base">
                      {data.subscription.price_paid} {data.subscription.currency}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)] block mb-1">Period End</span>
                    <p className="font-medium text-white text-sm sm:text-base">
                      {new Date(data.subscription.period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Alert className="bg-[rgba(75,142,255,0.12)] border-[rgba(75,142,255,0.35)] text-white">
                <AlertTitle className="text-white">No Active Subscription</AlertTitle>
                <AlertDescription className="text-[rgba(207,207,207,0.85)]">
                  This user does not have an active subscription.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </main>

        {/* Dialogs */}
        <EnhancedChangeTierDialog
          isOpen={isChangeTierOpen}
          onClose={() => setIsChangeTierOpen(false)}
          userId={userId}
          userEmail={userEmail}
          currentTier={data?.subscription?.tier_name}
        />

        <DeleteUserDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          userId={userId}
          userEmail={userEmail}
        />
      </div>
    </AdminGuard>
  )
}
