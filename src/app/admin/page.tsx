"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  LogOut,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { StatCard } from '@/components/admin/StatCard'
import { SubscriptionTable } from '@/components/admin/SubscriptionTable'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { useSubscriptions, useRevenueAnalytics } from '@/hooks/useAdminData'
import { SubscriptionListParams } from '@/types/admin'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const router = useRouter()
  const { logout } = useAdminAuth()
  
  const [filters, setFilters] = useState<SubscriptionListParams>({
    limit: 10,
    offset: 0,
  })
  const [currentPage, setCurrentPage] = useState(1)

  const { data: subscriptionsData, isLoading: subscriptionsLoading, refetch: refetchSubscriptions } = useSubscriptions(filters)
  const { data: revenueAnalytics } = useRevenueAnalytics(30)

  const handleSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search, offset: 0 }))
    setCurrentPage(1)
  }, [])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value || undefined, 
      offset: 0 
    }))
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    const newOffset = (page - 1) * (filters.limit || 10)
    setFilters(prev => ({ ...prev, offset: newOffset }))
    setCurrentPage(page)
  }, [filters.limit])

  const handleRefresh = useCallback(() => {
    refetchSubscriptions()
    toast.success('Data refreshed')
  }, [refetchSubscriptions])

  const handleExport = useCallback(() => {
    // TODO: Implement CSV export
    toast.info('CSV export feature coming soon')
  }, [])

  const handleViewUser = useCallback((email: string) => {
    router.push(`/admin/users/${encodeURIComponent(email)}`)
  }, [router])

  const handleLogout = useCallback(() => {
    logout()
    router.push('/admin/login')
    toast.success('Logged out successfully')
  }, [logout, router])

  const stats = [
    {
      title: 'Total Subscriptions',
      value: subscriptionsData?.total || 0,
      icon: Users,
      description: 'All time subscriptions',
    },
    {
      title: 'Active Subscriptions',
      value: subscriptionsData?.subscriptions?.filter(s => s.status === 'active').length || 0,
      icon: TrendingUp,
      description: 'Currently active',
    },
    {
      title: 'Monthly Revenue',
      value: revenueAnalytics ? `$${revenueAnalytics.mrr.toLocaleString()}` : '$0',
      icon: DollarSign,
      description: 'Monthly recurring revenue',
    },
    {
      title: 'New Users (7 days)',
      value: '12', // TODO: Get from analytics
      icon: Calendar,
      description: 'New signups this week',
    },
  ]

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Manage subscriptions and users</p>
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
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </motion.div>

          {/* Subscription Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <SubscriptionTable
              subscriptions={subscriptionsData?.subscriptions || []}
              isLoading={subscriptionsLoading}
              total={subscriptionsData?.total || 0}
              currentPage={currentPage}
              pageSize={filters.limit || 10}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              onRefresh={handleRefresh}
              onExport={handleExport}
              onViewUser={handleViewUser}
            />
          </motion.div>
        </main>
      </div>
    </AdminGuard>
  )
}
