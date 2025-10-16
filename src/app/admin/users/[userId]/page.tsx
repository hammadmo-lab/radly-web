"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { UsageProgressBar } from '@/components/admin/UsageProgressBar'
import { ChangeTierDialog } from '@/components/admin/ChangeTierDialog'
import { useUserSubscription } from '@/hooks/useAdminData'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface UserDetailPageProps {
  params: {
    userId: string
  }
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [isChangeTierOpen, setIsChangeTierOpen] = useState(false)
  
  const userEmail = decodeURIComponent(params.userId)
  const { data: userData, isLoading, error } = useUserSubscription(userEmail)

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

  if (error) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
                <p className="text-gray-500 mb-4">
                  The user &quot;{userEmail}&quot; could not be found.
                </p>
                <Button onClick={handleBack} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  <p className="text-sm text-gray-500">{userEmail}</p>
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
          {isLoading ? (
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
          ) : userData ? (
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
                      <p className="text-lg font-medium">{userData.user_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">User ID</label>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                        {userData.user_id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Created</label>
                      <p className="text-sm">
                        {new Date(userData.subscription.created_at).toLocaleDateString()}
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
                      {getTierBadge(userData.subscription.tier_name)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(userData.subscription.status)}
                        {getStatusBadge(userData.subscription.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Price</span>
                      <span className="font-mono">
                        {userData.subscription.currency} {userData.subscription.price_paid}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Payment Provider</span>
                      <span className="text-sm">{userData.subscription.payment_provider}</span>
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
                        used={userData.subscription.reports_used_current_period}
                        limit={userData.subscription.reports_limit}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {userData.subscription.reports_used_current_period}
                        </div>
                        <div className="text-sm text-gray-500">Used</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {userData.subscription.reports_limit}
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
                          {new Date(userData.subscription.period_start).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Period End</label>
                        <p className="text-lg font-medium">
                          {new Date(userData.subscription.period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Days Remaining</label>
                        <p className="text-lg font-medium">
                          {calculateDaysRemaining(userData.subscription.period_end)} days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : null}
        </main>

        {/* Change Tier Dialog */}
        <ChangeTierDialog
          isOpen={isChangeTierOpen}
          onClose={() => setIsChangeTierOpen(false)}
          userEmail={userEmail}
        />
      </div>
    </AdminGuard>
  )
}
