import { 
  AdminCredentials, 
  SubscriptionListParams, 
  SubscriptionListResponse,
  UserSubscriptionResponse,
  ActivateSubscriptionData,
  CancelSubscriptionData,
  UsageAnalytics,
  RevenueAnalytics
} from '@/types/admin'

export class AdminApiClient {
  private credentials: AdminCredentials
  private baseUrl: string

  constructor(credentials: AdminCredentials) {
    this.credentials = credentials
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-admin-key': this.credentials.adminKey,
      'Authorization': `Bearer ${this.credentials.apiKey}`,
    }
  }

  private getErrorMessage(status: number, errorText: string): string {
    switch (status) {
      case 401:
        return 'Authentication failed. Please check your admin credentials.'
      case 403:
        return 'Access forbidden. You do not have permission to perform this action.'
      case 404:
        return 'Endpoint not found. The requested resource does not exist.'
      case 503:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return `Request failed with status ${status}: ${errorText}`
    }
  }

  async listSubscriptions(params: SubscriptionListParams): Promise<SubscriptionListResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.status) searchParams.set('status', params.status)
    if (params.tier) searchParams.set('tier', params.tier)
    if (params.region) searchParams.set('region', params.region)
    if (params.search) searchParams.set('search', params.search)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())
    if (params.sort_by) searchParams.set('sort_by', params.sort_by)
    if (params.sort_order) searchParams.set('sort_order', params.sort_order)

    const response = await fetch(`${this.baseUrl}/v1/admin/subscriptions/list?${searchParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async getUserSubscription(userId: string): Promise<UserSubscriptionResponse> {
    const response = await fetch(`${this.baseUrl}/v1/admin/subscriptions/user-id/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async activateSubscription(data: ActivateSubscriptionData): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/v1/admin/subscriptions/activate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async cancelSubscription(data: CancelSubscriptionData): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/v1/admin/subscriptions/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async getUsageAnalytics(days: number = 30): Promise<UsageAnalytics> {
    const response = await fetch(`${this.baseUrl}/v1/admin/analytics/usage?days=${days}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async getRevenueAnalytics(days: number = 30): Promise<RevenueAnalytics> {
    const response = await fetch(`${this.baseUrl}/v1/admin/analytics/revenue?days=${days}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }
}
