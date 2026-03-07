"use client"

import { Button } from '@/components/ui/button'

interface UsersNearLimitPanelProps {
  users: Array<{ user_id: string; usage_percentage: number }>
  isLoading: boolean
  onFindUser: (userId: string) => void
}

export function UsersNearLimitPanel({ users, isLoading, onFindUser }: UsersNearLimitPanelProps) {
  if (isLoading || users.length === 0) return null

  return (
    <section className="aurora-card border border-[rgba(248,183,77,0.28)] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(248,183,77,0.75)]">
          Attention Needed
        </p>
        <h2 className="text-lg font-semibold text-white">Users Near Limit</h2>
      </div>

      <div className="space-y-3">
        {users.map((user, i) => {
          const pct = Math.min(100, user.usage_percentage)
          const barColor =
            pct >= 90 ? '#FF6B6B' : pct >= 75 ? '#F8B74D' : '#3FBF8C'

          return (
            <div key={`${i}-${user.user_id}`} className="flex items-center gap-4">
              <span
                className="min-w-0 flex-1 font-mono text-xs text-[rgba(207,207,207,0.85)]"
                title={user.user_id}
              >
                {user.user_id ? `${user.user_id.slice(0, 8)}…` : '—'}
              </span>

              <div className="flex w-36 shrink-0 items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>
                <span className="w-9 text-right text-xs text-[rgba(207,207,207,0.65)]">
                  {pct.toFixed(0)}%
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFindUser(user.user_id)}
                className="h-8 shrink-0 border border-[rgba(248,183,77,0.32)] px-3 text-[rgba(248,183,77,0.9)] hover:border-[rgba(248,183,77,0.48)] hover:bg-[rgba(248,183,77,0.08)]"
              >
                Find
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
