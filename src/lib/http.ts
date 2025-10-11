'use client';

import { API_BASE, RADLY_CLIENT_KEY } from '@/lib/config';
import { getAccessToken } from '@/utils/supabase/client';

type Opts = RequestInit & { json?: any };

async function authHeaders(init?: RequestInit) {
  const token = await getAccessToken().catch(() => null);
  const h = new Headers(init?.headers);
  h.set('content-type', 'application/json');
  h.set('x-client-key', RADLY_CLIENT_KEY);
  if (token) h.set('authorization', `Bearer ${token}`);
  return h;
}

export async function httpGet<T>(path: string, init?: RequestInit): Promise<T> {
  if (!path.startsWith('/')) path = `/${path}`;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: await authHeaders(init),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function httpPost<T>(path: string, opts?: Opts): Promise<T> {
  if (!path.startsWith('/')) path = `/${path}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: await authHeaders(opts),
    body: opts?.json !== undefined ? JSON.stringify(opts.json) : opts?.body,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}
