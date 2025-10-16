"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Subscription } from '@/types/admin'
import { UsageProgressBar } from './UsageProgressBar'
import { useUserEmails } from '@/hooks/useUserEmails'

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
}: SubscriptionTableProps) {
  const [searchValue, setSearchValue] = useState('')

  // Extract all user IDs from subscriptions
  const userIds = subscriptions?.map(s => s.user_id).filter(Boolean) || []

  // Fetch emails for all users
  const { data: emailMap, isLoading: emailsLoading } = useUserEmails(userIds)

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch(value)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
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

  const totalPages = Math.ceil(total / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, total)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Subscriptions ({total})
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by email or user ID..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select onValueChange={(value) => onFilterChange('status', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => onFilterChange('tier', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => onFilterChange('region', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="egypt">Egypt</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <motion.tr
                      key={subscription.subscription_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        <div className="space-y-1 min-w-[200px]">
                          {/* Email */}
                          <div className="text-sm font-medium truncate">
                            {emailsLoading ? (
                              <span className="text-muted-foreground animate-pulse">
                                Loading email...
                              </span>
                            ) : emailMap?.[subscription.user_id] && emailMap[subscription.user_id].includes('@') ? (
                              <span title={emailMap[subscription.user_id]}>
                                {emailMap[subscription.user_id]}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {emailMap?.[subscription.user_id] || 'Email unavailable'}
                              </span>
                            )}
                          </div>
                          
                          {/* User ID (shortened) */}
                          <div className="text-xs text-muted-foreground font-mono" title={subscription.user_id}>
                            ID: {subscription.user_id ? subscription.user_id.substring(0, 8) + '...' : 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTierBadge(subscription.tier_name)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell>
                        <UsageProgressBar
                          used={subscription.reports_used_current_period}
                          limit={subscription.reports_limit}
                        />
                      </TableCell>
                      <TableCell>
                        {subscription.currency} {subscription.price_paid}
                      </TableCell>
                      <TableCell>
                        {new Date(subscription.period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewUser(subscription.user_id)}
                          disabled={!subscription.user_id}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {startItem}-{endItem} of {total} results
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
