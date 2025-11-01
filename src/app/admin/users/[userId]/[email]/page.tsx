"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  CreditCard, 
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogOut,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { UsageProgressBar } from '@/components/admin/UsageProgressBar'
import { ChangeTierDialog } from '@/components/admin/ChangeTierDialog'
import { useUserSubscription } from '@/hooks/useAdminData'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [isChangeTierOpen, setIsChangeTierOpen] = useState(false)
  
  const email = decodeURIComponent(params.email as string)
  const { data, isLoading, error } = useUserSubscription(email)

  const handleBack = () => {
    router.push('/admin')
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.expired}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTierBadge = (tier: string) => {
    const variants = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      premium: 'bg-yellow-100 text-yellow-800',
    }
    return (
      <Badge className={variants[tier as keyof typeof variants] || variants.free}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    )
  }

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
                    <p className="text-sm text-gray-500">{email}</p>
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
                    <p className="text-sm text-gray-500">{email}</p>
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
              <AlertTitle>User Not Found</AlertTitle>
              <AlertDescription>
                The user &quot;{email}&quot; could not be found in the system.
                {error.message && ` Error: ${error.message}`}
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
                  <p className="text-sm text-gray-500">{email}</p>
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
          {data ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg font-medium">{data.user_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">User ID</label>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                        {data.user_id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Created</label>
                      <p className="text-sm">
                        {new Date(data.subscription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Subscription Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Subscription Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Tier</span>
                      {getTierBadge(data.subscription.tier_name)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(data.subscription.status)}
                        {getStatusBadge(data.subscription.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Price</span>
                      <span className="font-mono">
                        {data.subscription.currency} {data.subscription.price_paid}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Payment Provider</span>
                      <span className="text-sm">{data.subscription.payment_provider}</span>
                    </div>
                    <div className="pt-4">
                      <Button
                        onClick={() => setIsChangeTierOpen(true)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Change Tier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Usage Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Usage Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Reports Usage
                      </label>
                      <UsageProgressBar
                        used={data.subscription.reports_used_current_period}
                        limit={data.subscription.reports_limit}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {data.subscription.reports_used_current_period}
                        </div>
                        <div className="text-sm text-gray-500">Used</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {data.subscription.reports_limit}
                        </div>
                        <div className="text-sm text-gray-500">Limit</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Subscription Period */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="lg:col-span-3"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Subscription Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Period Start</label>
                        <p className="text-lg font-medium">
                          {new Date(data.subscription.period_start).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Period End</label>
                        <p className="text-lg font-medium">
                          {new Date(data.subscription.period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Days Remaining</label>
                        <p className="text-lg font-medium">
                          {calculateDaysRemaining(data.subscription.period_end)} days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                This user does not have an active subscription.
              </AlertDescription>
            </Alert>
          )}
        </main>

        {/* Change Tier Dialog */}
        <ChangeTierDialog
          isOpen={isChangeTierOpen}
          onClose={() => setIsChangeTierOpen(false)}
          userEmail={email}
        />
      </div>
    </AdminGuard>
  )
}
