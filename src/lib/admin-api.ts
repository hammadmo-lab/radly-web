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
import {
  ApiKey,
  ApiKeyListParams,
  ApiKeyListResponse,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  UpdateApiKeyRequest,
  DeleteApiKeyResponse
} from '@/types/api-keys'

// Admin endpoints go directly to api.radly.app, bypassing the edge proxy
// This is because admin endpoints are protected by RADLY_ADMIN_KEYS (server-side)
// and don't need user JWT or edge rate limiting
const ADMIN_API_BASE = 'https://api.radly.app'

export class AdminApiClient {
  private credentials: AdminCredentials
  private baseUrl: string

  constructor(credentials: AdminCredentials) {
    this.credentials = credentials
    this.baseUrl = ADMIN_API_BASE
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-admin-key': this.credentials.adminKey,
      'x-api-key': this.credentials.apiKey,
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
      credentials: 'omit',
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
      credentials: 'omit',
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
      credentials: 'omit',
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
      credentials: 'omit',
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
      credentials: 'omit',
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
      credentials: 'omit',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async getUserEmails(userIds: string[]): Promise<Record<string, string>> {
    if (!userIds || userIds.length === 0) {
      return {}
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/v1/admin/users/emails`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(userIds),
        }
      )

      if (!response.ok) {
        console.error('Failed to fetch user emails:', response.status)
        return {}
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching user emails:', error)
      return {}
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'omit',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async changeTier(userId: string, tierName: string, region: string = 'egypt'): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/v1/admin/users/${userId}/tier`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tier_name: tierName, region }),
      credentials: 'omit',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  // ==================== API Keys ====================

  async listApiKeys(params?: ApiKeyListParams): Promise<ApiKeyListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.user_id) searchParams.set('user_id', params.user_id)

    const queryString = searchParams.toString()
    const url = `${this.baseUrl}/v1/admin/api-keys${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'omit',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async getApiKey(id: number): Promise<ApiKey> {
    const response = await fetch(`${this.baseUrl}/v1/admin/api-keys/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'omit',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    const response = await fetch(`${this.baseUrl}/v1/admin/api-keys`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'omit',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async updateApiKey(id: number, data: UpdateApiKeyRequest): Promise<ApiKey> {
    const response = await fetch(`${this.baseUrl}/v1/admin/api-keys/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'omit',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async deleteApiKey(id: number): Promise<DeleteApiKeyResponse> {
    const response = await fetch(`${this.baseUrl}/v1/admin/api-keys/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'omit',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const errorMessage = this.getErrorMessage(response.status, errorText)
      throw new Error(errorMessage)
    }

    return response.json()
  }
}
