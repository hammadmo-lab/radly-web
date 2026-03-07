"use client"

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSubscriptions } from '@/hooks/useAdminData'
import { Subscription } from '@/types/admin'

const PLATFORM_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  ios: { label: 'iOS', color: '#8b5cf6', bg: 'rgba(139,92,246,0.18)' },
  apple: { label: 'iOS', color: '#8b5cf6', bg: 'rgba(139,92,246,0.18)' },
  android: { label: 'Android', color: '#10b981', bg: 'rgba(16,185,129,0.18)' },
  google: { label: 'Android', color: '#10b981', bg: 'rgba(16,185,129,0.18)' },
  web: { label: 'Web', color: '#3b82f6', bg: 'rgba(59,130,246,0.18)' },
  stripe: { label: 'Web', color: '#3b82f6', bg: 'rgba(59,130,246,0.18)' },
}

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  active: { color: '#3FBF8C', bg: 'rgba(63,191,140,0.18)' },
  cancelled: { color: '#FF6B6B', bg: 'rgba(255,107,107,0.18)' },
  expired: { color: '#F8B74D', bg: 'rgba(248,183,77,0.18)' },
}

const PAGE_SIZE = 50

interface UsersTableSectionProps {
  initialSubscriptions: Subscription[] | undefined
}

export function UsersTableSection({ initialSubscriptions }: UsersTableSectionProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setOffset(0)
  }, [])

  const { data, isLoading } = useSubscriptions({
    search: debouncedSearch || undefined,
    limit: PAGE_SIZE,
    offset,
  })

  const subscriptions = debouncedSearch || offset > 0 ? data?.subscriptions : (initialSubscriptions ?? data?.subscriptions ?? [])
  const total = debouncedSearch || offset > 0 ? (data?.total ?? 0) : (initialSubscriptions?.length ?? data?.total ?? 0)

  return (
    <section className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">Directory</p>
          <h2 className="text-lg font-semibold text-white">Users Table</h2>
        </div>
        <Input
          placeholder="Search users…"
          value={search}
          onChange={handleSearch}
          className="h-9 w-full max-w-xs border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] text-sm text-white placeholder:text-[rgba(207,207,207,0.4)]"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[rgba(255,255,255,0.08)]">
              <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">User ID</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Tier</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Platform</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(207,207,207,0.55)]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-[rgba(207,207,207,0.55)]">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !subscriptions?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-[rgba(207,207,207,0.55)]">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map(sub => {
                const platformKey = sub.payment_provider?.toLowerCase() ?? 'web'
                const platformBadge = PLATFORM_BADGE[platformKey] ?? PLATFORM_BADGE.web
                const statusBadge = STATUS_BADGE[sub.status] ?? { color: '#9ca3af', bg: 'rgba(156,163,175,0.18)' }
                return (
                  <TableRow key={sub.subscription_id} className="border-[rgba(255,255,255,0.06)]">
                    <TableCell>
                      <span
                        className="font-mono text-xs text-[rgba(207,207,207,0.8)]"
                        title={sub.user_id}
                      >
                        {sub.user_id.slice(0, 8)}…
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">
                      {sub.tier_display_name}
                    </TableCell>
                    <TableCell>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ color: statusBadge.color, background: statusBadge.bg }}
                      >
                        {sub.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ color: platformBadge.color, background: platformBadge.bg }}
                      >
                        {platformBadge.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-[rgba(207,207,207,0.8)]">
                      {sub.created_at ? sub.created_at.slice(0, 10) : '—'}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[rgba(207,207,207,0.55)]">
        <span>{total} total</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(o => Math.max(0, o - PAGE_SIZE))}
            className="h-8 px-3 text-[rgba(207,207,207,0.8)] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={(subscriptions?.length ?? 0) < PAGE_SIZE}
            onClick={() => setOffset(o => o + PAGE_SIZE)}
            className="h-8 px-3 text-[rgba(207,207,207,0.8)] disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
