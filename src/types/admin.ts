export interface Subscription {
  subscription_id: string
  user_id: string
  email: string
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
  payment_provider: string
  created_at: string
  updated_at: string
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
  subscriptions: Subscription[]
  status_filter: string
}

export interface UserSubscriptionResponse {
  user_email: string
  user_id: string
  subscription: Subscription
}

export interface UserSubscriptionDetails {
  user: {
    user_id: string
    email: string
    created_at: string
  } | null
  subscription: {
    subscription_id: string
    user_id: string
    tier_name: string
    tier_display_name: string
    status: string
    reports_used_current_period: number
    reports_limit: number
    period_start: string
    period_end: string
    price_paid: number
    currency: string
    payment_provider: string
    created_at: string
    updated_at: string
  } | null
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
    email: string
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
  login: (adminKey: string, apiKey: string) => void
  logout: () => void
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
