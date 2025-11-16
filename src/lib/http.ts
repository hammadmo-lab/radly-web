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

// Export function to clear token cache (useful for sign out)
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

export async function httpGet<T = unknown>(path: string): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'x-client-key': CLIENT_KEY,
    'X-Request-Id': crypto.randomUUID(),
  };

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  return handle<T>(res);
}

export async function httpPost<TBody, TResp = unknown>(path: string, body: TBody): Promise<TResp> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-client-key': CLIENT_KEY,
    'X-Request-Id': crypto.randomUUID(),
  };

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handle<TResp>(res);
}

export async function httpPut<TBody, TResp = unknown>(path: string, body: TBody): Promise<TResp> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-client-key': CLIENT_KEY,
    'X-Request-Id': crypto.randomUUID(),
  };

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handle<TResp>(res);
}
