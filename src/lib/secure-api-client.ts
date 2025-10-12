/**
 * Secure API client with automatic authentication and signing
 */
import { AuthSecurity } from './auth-security'
import { RequestSigner } from './request-signing'

export interface SecureRequestOptions {
  requiresAuth?: boolean
  requiresSignature?: boolean
  method?: string
  headers?: Record<string, string>
  body?: BodyInit | Record<string, unknown> | null
}

export class SecureApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  /**
   * Make a secure API request with authentication and signing
   */
  async request<T>(
    endpoint: string,
    options: SecureRequestOptions = {}
  ): Promise<T> {
    const {
      requiresAuth = true,
      requiresSignature = false,
      headers = {},
      body,
      method = 'GET',
      ...fetchOptions
    } = options

    // Build headers
    let requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    // Add authentication if required
    if (requiresAuth) {
      const token = await AuthSecurity.getSecureToken()
      
      if (!token) {
        throw new Error('Authentication required but no token available')
      }

      if (!AuthSecurity.isValidTokenFormat(token)) {
        throw new Error('Invalid token format')
      }

      requestHeaders['Authorization'] = `Bearer ${token}`
    }

    // Add request signature if required
    if (requiresSignature && body) {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
      requestHeaders = await RequestSigner.addSignatureHeaders(
        bodyString,
        requestHeaders
      )
    }

    // Make request
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
        ...fetchOptions,
      })

      // Handle errors
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`
        }))
        throw new Error(error.message || 'Request failed')
      }

      // Parse response
      const data = await response.json()
      return data as T
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  /**
   * Convenience methods
   */
  async get<T>(endpoint: string, options?: SecureRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body: BodyInit | Record<string, unknown> | null, options?: SecureRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T>(endpoint: string, body: BodyInit | Record<string, unknown> | null, options?: SecureRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async delete<T>(endpoint: string, options?: SecureRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Export singleton instance
export const secureApi = new SecureApiClient()
