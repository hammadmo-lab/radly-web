// src/lib/config.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, '') ||
  (() => { throw new Error('NEXT_PUBLIC_API_BASE is missing'); })();

export const RADLY_CLIENT_KEY =
  process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY ||
  (() => { throw new Error('NEXT_PUBLIC_RADLY_CLIENT_KEY is missing'); })();

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (() => { throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing'); })();

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (() => { throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing'); })();
