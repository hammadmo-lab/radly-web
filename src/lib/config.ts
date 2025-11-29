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

/**
 * Get the correct authentication header name based on environment
 *
 * Production (Cloudflare Worker at edge.radly.app):
 *   - Uses x-client-key header
 *
 * Staging/Development (Direct backend):
 *   - Uses x-api-key header
 *
 * @returns The header name to use for API authentication
 */
export function getAuthHeaderName(): 'x-client-key' | 'x-api-key' {
  // Normalize API_BASE by removing trailing slashes before checking
  const normalizedBase = API_BASE.replace(/\/+$/, '');

  // Check if API_BASE contains "edge.radly.app" (production via Cloudflare)
  if (normalizedBase.includes('edge.radly.app')) {
    return 'x-client-key';
  }

  // All other environments (staging, localhost) use direct backend
  return 'x-api-key';
}