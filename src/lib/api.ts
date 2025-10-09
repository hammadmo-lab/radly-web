import { supabase } from './supabase'
import { GenReq, EnqueueResp, JobStatus } from './types'

const EDGE_BASE_URL = process.env.NEXT_PUBLIC_EDGE_BASE!
const CLIENT_KEY = process.env.NEXT_PUBLIC_PUBLIC_CLIENT_KEY!

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeoutMs?: number
  retry?: number
}

interface ApiResponse<T = unknown> {
  data: T
  error?: string
  status: number
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = 120000,
    retry = 1,
  } = options

  const url = `${EDGE_BASE_URL}${endpoint}`
  
  // Get session for authorization
  const { data: { session } } = await supabase.auth.getSession()
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add client key if present
  if (CLIENT_KEY) {
    requestHeaders['x-client-key'] = CLIENT_KEY
  }

  // Add authorization header if session exists
  if (session?.access_token) {
    requestHeaders['Authorization'] = `Bearer ${session.access_token}`
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    cache: 'no-store',
  }

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body)
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      const response = await fetchWithTimeout(url, requestOptions, timeoutMs)
      
      let data: T
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text() as unknown as T
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        const errorMessage = typeof data === 'object' && data && 'error' in data 
          ? (data as { error: string }).error 
          : `HTTP ${response.status}: ${response.statusText}${text ? ` — ${text}` : ''}`
        
        console.warn(`API Error ${response.status}: ${errorMessage}`)
        throw new ApiError(errorMessage, response.status, response)
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      lastError = error as Error
      
      if (attempt < retry) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        continue
      }
      
      break
    }
  }

  // If we get here, all retries failed
  if (lastError instanceof ApiError) {
    throw lastError
  }

  throw new ApiError(
    lastError?.message || 'Request failed',
    0
  )
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
  
  put: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
  
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
  
  delete: <T = unknown>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
}

export const jobs = {
  enqueue: (body: GenReq) => api.post<EnqueueResp>('/v1/generate/async', body),
  get: (id: string) => api.get<JobStatus>(`/v1/jobs/${id}`),
}

export { ApiError }
