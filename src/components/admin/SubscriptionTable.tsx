"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Subscription, SubscriptionListParams } from '@/types/admin'
import { UsageProgressBar } from './UsageProgressBar'
import { useUserEmails } from '@/hooks/useUserEmails'
import { cn } from '@/lib/utils'

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  isLoading: boolean
  total: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onSearch: (search: string) => void
  onFilterChange: (key: string, value: string) => void
  onRefresh: () => void
  onExport: () => void
  onViewUser: (userId: string) => void
  onClearFilters: () => void
  currentFilters: SubscriptionListParams
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  active: 'border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.18)] text-[#C8F3E2]',
  cancelled: 'border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]',
  expired: 'border-[rgba(207,207,207,0.2)] bg-[rgba(18,22,36,0.75)] text-[rgba(207,207,207,0.7)]',
}

const TIER_BADGE_STYLES: Record<string, string> = {
  free: 'border-[rgba(207,207,207,0.18)] bg-[rgba(207,207,207,0.08)] text-[rgba(207,207,207,0.75)]',
  starter: 'border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] text-[#D7E3FF]',
  professional: 'border-[rgba(143,130,255,0.35)] bg-[rgba(143,130,255,0.16)] text-[#E2DAFF]',
  premium: 'border-[rgba(248,183,77,0.35)] bg-[rgba(248,183,77,0.16)] text-[#FBE3B5]',
}

export function SubscriptionTable({
  subscriptions,
  isLoading,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onSearch,
  onFilterChange,
  onRefresh,
  onExport,
  onViewUser,
  onClearFilters,
  currentFilters,
}: SubscriptionTableProps) {
  const [searchValue, setSearchValue] = useState(currentFilters.search || '')

  // Helper function to calculate days since expiration
  const getDaysSinceExpiration = (periodEnd: string): number => {
    const endDate = new Date(periodEnd)
    const today = new Date()
    const diffTime = today.getTime() - endDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper function to format expiration message
  const getExpirationMessage = (periodEnd: string): string => {
    const days = getDaysSinceExpiration(periodEnd)
    if (days === 0) return 'Expired today'
    if (days === 1) return 'Expired 1 day ago'
    return `Expired ${days} days ago`
  }

  // Check if any filters are applied (beyond the default "active" status)
  const hasActiveFilters = !!(
    (currentFilters.status && currentFilters.status !== 'active') ||
    currentFilters.tier ||
    currentFilters.region ||
    currentFilters.search
  )

  // Get status label for display
  const getStatusLabel = (): string => {
    if (!currentFilters.status || currentFilters.status === 'active') return 'Active'
    if (currentFilters.status === 'expired') return 'Expired'
    if (currentFilters.status === 'cancelled') return 'Cancelled'
    return 'All'
  }

  // Deduplicate subscriptions - only show the most recent subscription per user
  const deduplicatedSubscriptions = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) {
      return []
    }

    // Group subscriptions by user_id
    const subscriptionsByUser = subscriptions.reduce((acc, sub) => {
      const userId = sub.user_id
      if (!userId) return acc

      if (!acc[userId]) {
        acc[userId] = []
      }
      acc[userId].push(sub)
      return acc
    }, {} as Record<string, Subscription[]>)

    // For each user, get the most recent subscription
    const result = Object.values(subscriptionsByUser).map((userSubs) => {
      // Prioritize active subscriptions
      const activeSub = userSubs.find(s => s.status === 'active')
      if (activeSub) {
        return activeSub
      }

      // Otherwise, return the subscription with the latest period_end
      return userSubs.reduce((latest, current) => {
        const latestTime = new Date(latest.period_end || 0).getTime()
        const currentTime = new Date(current.period_end || 0).getTime()
        return currentTime > latestTime ? current : latest
      })
    })

    // Sort by most recent period_end descending
    return result.sort((a, b) => {
      const aTime = new Date(a.period_end || 0).getTime()
      const bTime = new Date(b.period_end || 0).getTime()
      return bTime - aTime
    })
  }, [subscriptions])

  const userIds = useMemo(
    () => deduplicatedSubscriptions?.map((s) => s.user_id).filter(Boolean) || [],
    [deduplicatedSubscriptions]
  )
  const { data: emailMap, isLoading: emailsLoading } = useUserEmails(userIds)

  const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)))
  const hasResults = total > 0
  const startItem = hasResults ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = hasResults ? Math.min(currentPage * pageSize, total) : 0

  const handleSearch = (value: string) => {
    setSearchValue(value)
    // Pass search value to backend - backend should search across user_id, email, and tier
    onSearch(value)
  }

  const renderStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase() ?? 'expired'
    const classes =
      STATUS_BADGE_STYLES[normalized] || STATUS_BADGE_STYLES.expired
    return (
      <Badge
        className={cn(
          'border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] bg-transparent',
          classes
        )}
      >
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
      </Badge>
    )
  }

  const renderTierBadge = (tier: string) => {
    const normalized = tier?.toLowerCase() ?? 'free'
    const classes = TIER_BADGE_STYLES[normalized] || TIER_BADGE_STYLES.free
    return (
      <Badge
        className={cn(
          'border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] bg-transparent',
          classes
        )}
      >
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
      </Badge>
    )
  }

  return (
    <Card className="aurora-card border border-[rgba(255,255,255,0.08)] backdrop-blur-xl">
      <CardHeader className="space-y-6 border-b border-[rgba(255,255,255,0.06)] p-6 pb-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2653FF_0%,#4B8EFF_55%,#8F82FF_100%)] shadow-[0_22px_48px_rgba(52,84,207,0.38)]">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">Subscriptions</h2>
              <p className="text-sm text-[rgba(207,207,207,0.65)]">
                Showing {total} {getStatusLabel().toLowerCase()} subscription{total !== 1 ? 's' : ''}
                {hasActiveFilters && (
                  <span className="ml-1 text-[#4B8EFF]">(filtered)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-10 border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.12)] text-[#FFD1D1] hover:border-[rgba(255,107,107,0.45)] hover:bg-[rgba(255,107,107,0.18)]"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-10 border border-[rgba(255,255,255,0.12)] text-[rgba(207,207,207,0.85)] hover:border-[#4B8EFF]/40 hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="h-10 border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] text-[#D7E3FF] hover:border-[rgba(75,142,255,0.45)] hover:bg-[rgba(75,142,255,0.22)]"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgba(207,207,207,0.45)]" />
            <Input
              placeholder="Search by email, user ID, or tier..."
              value={searchValue}
              onChange={(event) => handleSearch(event.target.value)}
              className="h-12 rounded-xl border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] pl-12 text-white placeholder:text-[rgba(207,207,207,0.45)] focus-visible:ring-[#4B8EFF]"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Select
              value={currentFilters.status || 'active'}
              onValueChange={(value) => onFilterChange('status', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="h-11 min-w-[140px] rounded-xl border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.75)] hover:border-[#4B8EFF]/40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,14,24,0.95)] text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => onFilterChange('tier', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="h-11 min-w-[140px] rounded-xl border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.75)] hover:border-[#4B8EFF]/40">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,14,24,0.95)] text-white">
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => onFilterChange('region', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="h-11 min-w-[140px] rounded-xl border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.75)] hover:border-[#4B8EFF]/40">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,14,24,0.95)] text-white">
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="egypt">Egypt</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-4 w-[240px] rounded bg-[rgba(255,255,255,0.08)]" />
                <Skeleton className="h-4 w-[110px] rounded bg-[rgba(255,255,255,0.08)]" />
                <Skeleton className="h-4 w-[90px] rounded bg-[rgba(255,255,255,0.08)]" />
                <Skeleton className="h-4 w-[140px] rounded bg-[rgba(255,255,255,0.08)]" />
                <Skeleton className="h-4 w-[120px] rounded bg-[rgba(255,255,255,0.08)]" />
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="aurora-card border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.65)] py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] text-[#D7E3FF]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">No subscriptions match that view</h3>
            <p className="mt-2 text-sm text-[rgba(207,207,207,0.65)]">
              Adjust your filters or search query to see more customers.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)]">
              <Table>
                <TableHeader className="bg-[rgba(12,16,28,0.72)]">
                  <TableRow className="border-b border-[rgba(255,255,255,0.06)]">
                    {['User', 'Tier', 'Status', 'Usage', 'Revenue', 'Period End', 'Actions'].map(
                      (column) => (
                        <TableHead
                          key={column}
                          className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]"
                        >
                          {column}
                        </TableHead>
                      )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deduplicatedSubscriptions.map((subscription) => (
                    <motion.tr
                      key={subscription.subscription_id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-b border-[rgba(255,255,255,0.05)] bg-transparent last:border-none hover:bg-[rgba(75,142,255,0.08)]"
                    >
                      <TableCell className="px-6 py-5 text-sm text-white">
                        <div className="min-w-[200px] space-y-2">
                          <div className="font-medium">
                            {emailsLoading ? (
                              <span className="animate-pulse text-[rgba(207,207,207,0.55)]">
                                Loading email…
                              </span>
                            ) : emailMap?.[subscription.user_id] &&
                              emailMap[subscription.user_id].includes('@') ? (
                              <span title={emailMap[subscription.user_id]}>
                                {emailMap[subscription.user_id]}
                              </span>
                            ) : (
                              <span className="text-[rgba(207,207,207,0.55)]">
                                {emailMap?.[subscription.user_id] || 'Email unavailable'}
                              </span>
                            )}
                          </div>
                          <div
                            className="font-mono text-[11px] uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]"
                            title={subscription.user_id}
                          >
                            ID:{' '}
                            {subscription.user_id
                              ? `${subscription.user_id.substring(0, 8)}…`
                              : 'N/A'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-5">{renderTierBadge(subscription.tier_name)}</TableCell>
                      <TableCell className="px-6 py-5">{renderStatusBadge(subscription.status)}</TableCell>

                      <TableCell className="px-6 py-5">
                        <UsageProgressBar
                          used={subscription.reports_used_current_period}
                          limit={subscription.reports_limit}
                        />
                      </TableCell>

                      <TableCell className="px-6 py-5 text-sm text-[rgba(207,207,207,0.75)]">
                        {subscription.currency} {subscription.price_paid}
                      </TableCell>

                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-[rgba(207,207,207,0.75)]">
                            {new Date(subscription.period_end).toLocaleDateString()}
                          </span>
                          {subscription.status === 'expired' && (
                            <span className="text-xs text-[rgba(255,107,107,0.85)]">
                              {getExpirationMessage(subscription.period_end)}
                              {getDaysSinceExpiration(subscription.period_end) <= 7 && (
                                <span className="ml-1 font-semibold">(recent)</span>
                              )}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewUser(subscription.user_id)}
                          disabled={!subscription.user_id}
                          className="h-9 border border-transparent text-[#D7E3FF] hover:border-[rgba(75,142,255,0.35)] hover:bg-[rgba(75,142,255,0.12)]"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 text-sm text-[rgba(207,207,207,0.55)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                {hasResults
                  ? `Showing ${startItem}-${endItem} of ${total} results`
                  : 'No matching subscriptions'}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-9 border border-[rgba(255,255,255,0.12)] text-[rgba(207,207,207,0.8)] disabled:border-transparent disabled:text-[rgba(207,207,207,0.3)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-9 border border-[rgba(255,255,255,0.12)] text-[rgba(207,207,207,0.8)] disabled:border-transparent disabled:text-[rgba(207,207,207,0.3)]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
