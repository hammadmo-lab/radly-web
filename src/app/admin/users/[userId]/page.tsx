"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { 
  ArrowLeft, 
  AlertCircle,
  Copy,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { ChangeTierDialog } from '@/components/admin/ChangeTierDialog'
import { useUserSubscription } from '@/hooks/useAdminData'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { useUserEmails } from '@/hooks/useUserEmails'
import { toast } from 'sonner'

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [isChangeTierOpen, setIsChangeTierOpen] = useState(false)
  
  const userId = params.userId as string
  const { data, isLoading, error } = useUserSubscription(userId)
  const { data: emailMap } = useUserEmails([userId])
  const userEmail = emailMap?.[userId]

  const handleBack = () => {
    router.push('/admin')
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const copyUserId = () => {
    navigator.clipboard.writeText(userId)
    toast.success('User ID copied to clipboard')
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                    <p className="text-sm text-gray-500">{userId}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Loading Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                    <p className="text-sm text-gray-500">{userId}</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Error Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading User</AlertTitle>
              <AlertDescription>
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                  <p className="text-sm text-gray-500">{userId}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* User ID Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">User Details</h1>
              <Button variant="outline" size="sm" onClick={copyUserId}>
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </Button>
            </div>
            
            {/* User ID Card */}
            <div className="border rounded-lg p-6">
              <h2 className="font-semibold mb-3">User Information</h2>
              <div className="space-y-3">
                {/* Email */}
                {userEmail && userEmail.includes('@') && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{userEmail}</span>
                  </div>
                )}
                
                {/* User ID */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                    {userId}
                  </code>
                </div>
              </div>
            </div>
            
            {/* Subscription Details */}
            {data?.subscription ? (
              <div className="border rounded-lg p-6">
                <h2 className="font-semibold mb-4">Subscription Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Tier</span>
                    <p className="font-medium">{data.subscription.tier_display_name || data.subscription.tier_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Status</span>
                    <p className="font-medium capitalize">{data.subscription.status}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Region</span>
                    <p className="font-medium capitalize">{data.subscription.region}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Reports Used</span>
                    <p className="font-medium">
                      {data.subscription.reports_used_current_period} / {data.subscription.reports_limit}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Price Paid</span>
                    <p className="font-medium">
                      {data.subscription.price_paid} {data.subscription.currency}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Period End</span>
                    <p className="font-medium">
                      {new Date(data.subscription.period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTitle>No Active Subscription</AlertTitle>
                <AlertDescription>
                  This user does not have an active subscription.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </main>

        {/* Change Tier Dialog */}
        <ChangeTierDialog
          isOpen={isChangeTierOpen}
          onClose={() => setIsChangeTierOpen(false)}
          userEmail={userId}
        />
      </div>
    </AdminGuard>
  )
}