// src/lib/edge.ts
'use client';

import { supabase } from '@/utils/supabase/client';

const EDGE_BASE =
  process.env.NEXT_PUBLIC_EDGE_BASE?.replace(/\/+$/, '') || 'https://edge.radly.app';

const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY || '';

function assertPublicKey() {
  if (!CLIENT_KEY) {
    // Fail fast so we don't silently hit origin without key
    throw new Error('Missing NEXT_PUBLIC_RADLY_CLIENT_KEY');
  }
}

export async function edgeFetch<T = unknown>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  assertPublicKey();

  const url = `${EDGE_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  // Grab Supabase access token if requested (defaults to true)
  const wantAuth = init.auth !== false;
  let authHeader: Record<string, string> = {};
  if (wantAuth) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) authHeader = { Authorization: `Bearer ${token}` };
  }

  const res = await fetch(url, {
    method: init.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-client-key': CLIENT_KEY,
      ...authHeader,
      ...(init.headers as Record<string, string>),
    },
    body: init.body,
    cache: 'no-store',
    credentials: 'omit',
    mode: 'cors',
    redirect: 'follow',
    // Note: keep it simple; the worker handles CORS
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // Attach status+text to help pages show a clear message
    const err = new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    // @ts-expect-error attach fields for callers to access error details
    err.status = res.status;
    // @ts-expect-error attach response body for debugging
    err.body = text;
    throw err;
  }

  // Support empty 204 responses
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as T;
}
