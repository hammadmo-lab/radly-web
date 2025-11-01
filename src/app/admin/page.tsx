"use client"

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  LogOut,
  Shield,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { StatCard } from '@/components/admin/StatCard'
import { SubscriptionTable } from '@/components/admin/SubscriptionTable'
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'
import { ConnectionStatus } from '@/components/admin/ConnectionStatus'
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

  const { 
    data: subscriptionsData, 
    isLoading: subscriptionsLoading, 
    error: subscriptionsError,
    refetch: refetchSubscriptions 
  } = useSubscriptions(filters)
  const { 
    data: revenueAnalytics, 
    isLoading: revenueLoading,
    error: revenueError 
  } = useRevenueAnalytics(30)

  // Check if there are any errors
  const hasErrors = subscriptionsError || revenueError

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

  const handleViewUser = useCallback((userId: string) => {
    if (!userId) {
      toast.error('Cannot view user: user ID not available')
      return
    }
    
    console.log('Viewing user:', userId)
    router.push(`/admin/users/${userId}`)
  }, [router])

  const handleLogout = useCallback(() => {
    logout()
    router.push('/admin/login')
    toast.success('Logged out successfully')
  }, [logout, router])

  // Handle errors with toast notifications
  useEffect(() => {
    if (subscriptionsError) {
      toast.error(`Failed to load subscriptions: ${subscriptionsError.message}`)
    }
  }, [subscriptionsError])

  useEffect(() => {
    if (revenueError) {
      toast.error(`Failed to load revenue analytics: ${revenueError.message}`)
    }
  }, [revenueError])

  // Safe revenue formatting function
  const formatRevenue = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0'
    }
    return `$${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`
  }

  const stats = [
    {
      title: 'Total Subscriptions',
      value: subscriptionsLoading ? '...' : subscriptionsData?.total || 0,
      icon: Users,
      description: 'All time subscriptions',
      isLoading: subscriptionsLoading,
    },
    {
      title: 'Active Subscriptions',
      value: subscriptionsLoading ? '...' : subscriptionsData?.subscriptions?.filter(s => s.status === 'active').length || 0,
      icon: TrendingUp,
      description: 'Currently active',
      isLoading: subscriptionsLoading,
    },
    {
      title: 'Monthly Revenue',
      value: revenueLoading ? '...' : formatRevenue(revenueAnalytics?.total_revenue),
      icon: DollarSign,
      description: 'This month',
      isLoading: revenueLoading,
    },
    {
      title: 'New Users (7 days)',
      value: '12', // TODO: Get from analytics
      icon: Calendar,
      description: 'New signups this week',
      isLoading: false,
    },
  ]

  const errorCopy = subscriptionsError
    ? `Failed to load subscriptions: ${subscriptionsError.message}`
    : revenueError
      ? `Failed to load revenue data: ${revenueError.message}`
      : ''

  return (
    <AdminGuard>
      <AdminErrorBoundary>
        <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 neon-page-stack">
            <div className="neon-shell space-y-8 p-6 sm:p-8 md:p-10 backdrop-blur-xl">
              <ConnectionStatus className="border border-[rgba(75,142,255,0.18)]" />

              <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2653FF_0%,#4B8EFF_55%,#8F82FF_100%)] shadow-[0_22px_48px_rgba(52,84,207,0.38)]">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">
                        Radly Control Room
                      </p>
                      <h1 className="text-3xl font-semibold text-white">Admin Dashboard</h1>
                    </div>
                  </div>
                  <p className="max-w-xl text-sm text-[rgba(207,207,207,0.65)]">
                    Monitor subscription health, revenue, and customer usage without leaving the neon shell.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/admin/metrics')}
                    className="h-11 rounded-xl border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] px-5 text-[#D7E3FF] hover:border-[rgba(75,142,255,0.45)] hover:bg-[rgba(75,142,255,0.22)]"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Metrics Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="h-11 rounded-xl border border-[rgba(255,255,255,0.12)] px-5 text-[rgba(207,207,207,0.8)] hover:border-[rgba(255,107,107,0.32)] hover:text-[#FFD1D1]"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </header>

              {hasErrors && (
                <div className="rounded-2xl border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.12)] p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-white">Connection error</h2>
                        <p className="text-sm text-[#FFD1D1]">
                          {errorCopy}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchSubscriptions()}
                      className="h-9 rounded-lg border border-[rgba(255,255,255,0.12)] px-4 text-[#FFD1D1] hover:border-[rgba(255,107,107,0.45)] hover:bg-[rgba(255,107,107,0.12)]"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              <section>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                  ))}
                </div>
              </section>

              <section>
                {subscriptionsLoading ? (
                  <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-10 text-center text-sm text-[rgba(207,207,207,0.65)]">
                    <p className="text-lg font-medium text-white">Loading subscriptions…</p>
                    <p className="mt-2 text-sm text-[rgba(207,207,207,0.55)]">
                      Fetching the latest customer data. This should only take a moment.
                    </p>
                  </div>
                ) : subscriptionsError ? (
                  <div className="rounded-2xl border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.12)] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-white">Error loading subscriptions</h2>
                          <p className="text-sm text-[#FFD1D1]">
                            {subscriptionsError.message}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetchSubscriptions()}
                        className="h-9 rounded-lg border border-[rgba(255,255,255,0.12)] px-4 text-[#FFD1D1] hover:border-[rgba(255,107,107,0.45)] hover:bg-[rgba(255,107,107,0.12)]"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : (
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
                )}
              </section>
            </div>
          </div>
        </div>
      </AdminErrorBoundary>
    </AdminGuard>
  )
}
