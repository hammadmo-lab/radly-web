"use client"

import { useDatabaseStats, useCacheStats } from '@/hooks/useAdminData'

interface InfraCard {
  label: string
  value: string
  color: string
  bg: string
  border: string
}

export function InfrastructureSection() {
  const { data: db, isLoading: dbLoading, error: dbError } = useDatabaseStats()
  const { data: cache, isLoading: cacheLoading, error: cacheError } = useCacheStats()

  const isLoading = dbLoading || cacheLoading
  const error = dbError || cacheError

  const hits = cache?.keyspace_hits ?? 0
  const misses = cache?.keyspace_misses ?? 0
  const total = hits + misses
  const hitRate = total > 0 ? `${((hits / total) * 100).toFixed(1)}%` : '—'

  const cards: InfraCard[] = [
    {
      label: 'DB Size',
      value: db?.size?.total_size ?? '—',
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.25)',
    },
    {
      label: 'Active Jobs',
      value: db?.active_jobs != null ? String(db.active_jobs) : '—',
      color: '#F8B74D',
      bg: 'rgba(248,183,77,0.08)',
      border: 'rgba(248,183,77,0.25)',
    },
    {
      label: 'Cache Hit Rate',
      value: hitRate,
      color: '#3FBF8C',
      bg: 'rgba(63,191,140,0.08)',
      border: 'rgba(63,191,140,0.25)',
    },
    {
      label: 'Cache Keys',
      value: cache?.keys_count != null ? cache.keys_count.toLocaleString() : '—',
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.25)',
    },
  ]

  return (
    <section className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">Infra</p>
        <h2 className="text-lg font-semibold text-white">Infrastructure</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-[rgba(207,207,207,0.55)]">Loading infrastructure data…</p>
      ) : error ? (
        <p className="text-sm text-[#FFD1D1]">{error.message}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(card => (
            <div
              key={card.label}
              className="rounded-2xl border p-5"
              style={{ background: card.bg, borderColor: card.border }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: card.color }}>
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
