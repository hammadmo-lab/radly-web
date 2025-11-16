import type { ApiError } from '@/types/api';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { API_BASE, RADLY_CLIENT_KEY } from '@/lib/config';

const BASE_URL = API_BASE;
const CLIENT_KEY = RADLY_CLIENT_KEY;

// Default timeout for API requests (30 seconds)
const DEFAULT_TIMEOUT_MS = 30000;

// Token cache to avoid hitting Supabase on every request
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get authentication token from Supabase session
 * Caches token with 5-minute buffer before expiry to avoid frequent SDK calls
 * @returns Promise that resolves to JWT token or null if not authenticated
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const now = Date.now();

    // Return cached token if still valid (5 minute buffer before expiry)
    if (cachedToken && tokenExpiry > now + 5 * 60 * 1000) {
      return cachedToken;
    }

    // Server guard
    if (typeof window === 'undefined') {
      return null
    }

    const supabase = createBrowserSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();

    // Handle Supabase errors explicitly
    if (error) {
      console.error('Supabase getSession error:', error);
      // Clear cache on error to avoid serving stale tokens
      cachedToken = null;
      tokenExpiry = 0;
      // Don't throw - allow requests to proceed without auth
      // The backend will return 401 if auth is required
      return null;
    }

    const accessToken = session?.access_token || null
    const expiresAt = session?.expires_at ? session.expires_at * 1000 : 0

    // Cache the token and expiry
    cachedToken = accessToken;
    tokenExpiry = expiresAt;

    return cachedToken;
  } catch (error) {
    // Catch unexpected errors (network failures, SDK bugs, etc.)
    console.error('Unexpected error getting auth token:', error);
    // Clear cache on error
    cachedToken = null;
    tokenExpiry = 0;
    // Log to Sentry if available
    if (typeof window !== 'undefined') {
      const sentryGlobal = (window as { Sentry?: { captureException: (error: unknown, options?: unknown) => void } }).Sentry;
      if (sentryGlobal) {
        sentryGlobal.captureException(error, {
          tags: { context: 'getAuthToken' }
        });
      }
    }
    return null;
  }
}

/**
 * Clear authentication token cache
 * Useful for sign out or when token becomes invalid
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = 0;
}

/**
 * Fetch with timeout using AbortController
 * @param url - Request URL
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default: 30 seconds)
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    // Check if error is due to abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError: ApiError = new Error(`Request timeout after ${timeoutMs}ms`) as ApiError;
      timeoutError.status = 408; // Request Timeout
      timeoutError.body = 'Request timed out';
      throw timeoutError;
    }
    throw error;
  }
}

/**
 * Process HTTP response and handle errors
 * @param res - The fetch Response object
 * @returns Parsed JSON data or undefined
 * @throws ApiError on non-2xx status codes
 */
async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err: ApiError = new Error(`${res.status} ${res.statusText}`) as ApiError;
    err.status = res.status;
    err.body = body;
    throw err;
  }
  // If the response has no body (204), return undefined as T
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

/**
 * Build common HTTP headers for API requests
 * @param token - Optional authentication token
 * @param contentType - Content-Type header value (default: application/json)
 * @returns Headers object
 */
function buildHeaders(token: string | null, contentType: string = 'application/json'): Record<string, string> {
  const headers: Record<string, string> = {
    'x-client-key': CLIENT_KEY,
    'X-Request-Id': crypto.randomUUID(),
  };

  if (contentType) {
    headers['content-type'] = contentType;
  }

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Make HTTP request with timeout and authentication
 * @param path - API endpoint path
 * @param options - Request options (method, body, etc.)
 * @returns Promise that resolves to parsed response data
 */
async function makeRequest<T>(path: string, options: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const headers = buildHeaders(token, options.body ? 'application/json' : '');

  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  return handle<T>(res);
}

/**
 * Make GET request to API endpoint
 * @param path - API endpoint path
 * @returns Promise that resolves to response data
 */
export async function httpGet<T = unknown>(path: string): Promise<T> {
  return makeRequest<T>(path, {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Make POST request to API endpoint
 * @param path - API endpoint path
 * @param body - Request body
 * @returns Promise that resolves to response data
 */
export async function httpPost<TBody, TResp = unknown>(path: string, body: TBody): Promise<TResp> {
  return makeRequest<TResp>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Make PUT request to API endpoint
 * @param path - API endpoint path
 * @param body - Request body
 * @returns Promise that resolves to response data
 */
export async function httpPut<TBody, TResp = unknown>(path: string, body: TBody): Promise<TResp> {
  return makeRequest<TResp>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
