import type { ApiError } from '@/types/api';
import { createBrowserSupabase } from '@/lib/supabase/client';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY!;

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

    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    console.log('🔍 getAuthToken:', {
      hasSession: !!session,
      hasToken: !!session?.access_token,
      tokenPreview: session?.access_token ? `${session.access_token.substring(0, 20)}...` : 'null'
    });

    // Cache the token and expiry
    cachedToken = session?.access_token || null;
    tokenExpiry = session?.expires_at ? session.expires_at * 1000 : 0;

    return cachedToken;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Export function to clear token cache (useful for sign out)
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = 0;
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
  
  console.log('🔍 httpGet:', { path, hasToken: !!token, tokenPreview: token ? `${token.substring(0, 20)}...` : 'null' });
  
  const headers: Record<string, string> = {
    'x-client-key': CLIENT_KEY,
    'X-Request-Id': crypto.randomUUID(),
  };
  
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store',
  });
  
  console.log('🔍 httpGet response:', { path, status: res.status, ok: res.ok });
  
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
  
  const res = await fetch(`${BASE_URL}${path}`, {
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
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handle<TResp>(res);
}
