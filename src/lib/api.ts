import { supabase } from './supabase'
import { GenReq, EnqueueResp, JobStatus, StrictReport, PatientBlock } from './types'

// Ensure BASE_URL has no trailing slash
const EDGE_BASE_URL = process.env.NEXT_PUBLIC_EDGE_BASE!.replace(/\/$/, '')
const CLIENT_KEY = process.env.NEXT_PUBLIC_PUBLIC_CLIENT_KEY!

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeoutMs?: number
  retry?: number
}

interface ApiResponse<T = unknown> {
  data: T | null
  error?: {
    status: number
    message: string
    body?: string
  }
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

// Helper function to normalize paths and add /v1/ prefix
function normalizePath(path: string): string {
  // Remove leading slash if present
  let normalized = path.startsWith('/') ? path.slice(1) : path
  
  // Add /v1/ prefix for reports and jobs if not already present
  if ((normalized === 'reports' || normalized === 'jobs' || normalized.startsWith('reports/') || normalized.startsWith('jobs/')) && !normalized.startsWith('v1/')) {
    normalized = `v1/${normalized}`
  }
  
  // Convert double slashes to single slashes
  normalized = normalized.replace(/\/+/g, '/')
  
  // Ensure leading slash
  return normalized.startsWith('/') ? normalized : `/${normalized}`
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

  const normalizedEndpoint = normalizePath(endpoint)
  const url = `${EDGE_BASE_URL}${normalizedEndpoint}`
  
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
        
        return {
          data: null,
          error: {
            status: response.status,
            message: errorMessage,
            body: text
          },
          status: response.status,
        }
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
  return {
    data: null,
    error: {
      status: lastError instanceof ApiError ? lastError.status : 0,
      message: lastError?.message || 'Request failed',
    },
    status: lastError instanceof ApiError ? lastError.status : 0,
  }
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

// Helper function for JSON requests with path normalization
export async function getJson<T>(path: string): Promise<ApiResponse<T>> {
  return api.get<T>(path)
}

export const jobs = {
  enqueue: (body: GenReq) => api.post<EnqueueResp>('/v1/generate/async', body),
  get: (id: string) => api.get<JobStatus>(`/v1/jobs/${id}`),
}

export { ApiError }

export function extractFilenameFromCD(cd: string): string | null {
  const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i.exec(cd || '');
  const raw = (m?.[1] || m?.[2] || '').trim();
  if (!raw) return null;
  try { return decodeURIComponent(raw); } catch { return raw; }
}

export async function exportDocxDirect(payload: {
  report: StrictReport;
  patient?: PatientBlock;
  include_identifiers?: boolean;
  filename?: string;
}): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_EDGE_BASE}/v1/export/docx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-key': process.env.NEXT_PUBLIC_PUBLIC_CLIENT_KEY ?? '',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Export failed ${res.status}: ${errText}`);
  }

  const ct = res.headers.get('content-type') || '';
  // Ensure we didn't get HTML/JSON error back
  if (!ct.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
    const preview = await res.text().catch(() => '');
    throw new Error(`Unexpected content-type: ${ct}. Body: ${preview.slice(0,300)}`);
  }

  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const fallback = (payload.filename || `${payload.report.title || 'report'}.docx`).replace(/\//g, '_');
  const name = extractFilenameFromCD(cd) || fallback;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportDocxLink(payload: {
  report: StrictReport;
  patient?: PatientBlock;
  include_identifiers?: boolean;
  filename?: string;
}): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_EDGE_BASE}/v1/export/docx/link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-key': process.env.NEXT_PUBLIC_PUBLIC_CLIENT_KEY ?? '',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Export link failed ${res.status}: ${errText}`);
  }

  const data = await res.json().catch(() => null);
  const url = data?.presigned_url as string | undefined;
  if (!url) throw new Error('No presigned_url in response');
  window.location.href = url;
}
