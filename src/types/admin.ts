export interface Subscription {
  subscription_id: string
  user_id: string
  tier_name: string
  tier_display_name: string
  region: string
  price_paid: number
  currency: string
  reports_used_current_period: number
  reports_limit: number
  period_start: string
  period_end: string
  status: 'active' | 'cancelled' | 'expired'
  platform: string
  payment_provider: string
  created_at: string
  updated_at: string
  cancelled_at: string | null
}

export interface SubscriptionListParams {
  status?: string
  tier?: string
  region?: string
  search?: string
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface SubscriptionListResponse {
  total: number
  limit: number
  offset: number
  has_more: boolean
  filters: {
    status?: string
    tier?: string
    region?: string
    search?: string
  }
  sorting: {
    sort_by: string
    sort_order: string
  }
  subscriptions: Subscription[]
}

export interface UserSubscriptionResponse {
  user_email: string
  user_id: string
  subscription: Subscription
}

export interface UserSubscriptionDetails {
  user: {
    user_id: string
    email?: string  // Optional since it's from Supabase
    created_at?: string
  } | null
  subscription: Subscription | null
  note?: string  // "User details available via Supabase API"
}

export interface ActivateSubscriptionData {
  user_email: string
  tier_name: string
  region: string
  payment_proof?: string
}

export interface CancelSubscriptionData {
  user_email: string
  reason?: string
  refund_amount?: number
}

export interface UsageAnalytics {
  average_reports_per_user: number
  users_near_limit: Array<{
    user_id: string
    usage_percentage: number
  }>
  usage_by_tier: Record<string, number>
}

export interface RevenueAnalytics {
  total_revenue: number
  mrr: number
  revenue_by_tier: Record<string, number>
  revenue_by_region: Record<string, number>
  churn_rate: number
}

export interface AdminCredentials {
  adminKey: string
  apiKey: string
}

export interface AdminAuthContext {
  adminKey: string | null
  apiKey: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (adminKey: string, apiKey: string) => void
  logout: () => void
}

export interface RecentJob {
  job_id: string
  template_id: string
  status: 'done' | 'failed' | 'processing' | 'queued'
  created_at: string
  processing_time_ms: number
}

export interface RecentJobsResponse {
  jobs: RecentJob[]
}

export interface SecurityEvent {
  event_type: string
  event_count: number
  last_occurrence: string
}

export interface SecurityStatsResponse {
  failed_auth_count: number
  unique_ips: number
  security_events: SecurityEvent[]
}

export interface DatabaseStats {
  size: { total_size: string }
  counts: { job_history: number; subscriptions: number }
  active_jobs: number
}

export interface CacheStats {
  enabled: boolean
  keyspace_hits: number
  keyspace_misses: number
  keys_count: number
}

export interface TierInfo {
  name: string
  display_name: string
  reports_limit: number
  price: number
  currency: string
  features: string[]
}

export interface RegionInfo {
  name: string
  display_name: string
  currency: string
  exchange_rate?: number
}
