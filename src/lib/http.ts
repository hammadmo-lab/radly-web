import type { ApiError } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY!;

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
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'x-client-key': CLIENT_KEY,
    },
    credentials: 'include',
    cache: 'no-store',
  });
  return handle<T>(res);
}

export async function httpPost<TBody, TResp = unknown>(path: string, body: TBody): Promise<TResp> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-client-key': CLIENT_KEY,
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handle<TResp>(res);
}

export async function httpPut<TBody, TResp = unknown>(path: string, body: TBody): Promise<TResp> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'x-client-key': CLIENT_KEY,
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handle<TResp>(res);
}
