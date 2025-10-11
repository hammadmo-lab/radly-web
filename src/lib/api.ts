// src/lib/api.ts
"use client";

import { createSupabaseBrowser } from "@/utils/supabase/browser";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY!;

export async function apiFetch(path: string, init: RequestInit = {}) {
  const supabase = createSupabaseBrowser();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(init.headers || {});
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  headers.set("x-client-key", CLIENT_KEY);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/v1${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  // If unauthorized, surface 401 to caller for redirect
  if (res.status === 401) {
    const text = await res.text().catch(() => "");
    throw new Error(`401 Unauthorized: ${text || "missing/invalid token"}`);
  }

  return res;
}