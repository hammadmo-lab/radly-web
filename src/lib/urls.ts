export function getAuthRedirect(): string {
  // Prefer runtime origin on the client
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/auth/callback`;
  }
  // SSR/edge fallback → use configured site URL
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/auth/callback`;
}
