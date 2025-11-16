export function sanitizeNext(raw: string | null | undefined): string {
  // Accept only same-origin internal paths. Default to dashboard.
  if (!raw) return '/app/dashboard';
  try {
    // Get current origin dynamically
    const currentOrigin = typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

    // Support absolute URLs by parsing against current origin
    const u = new URL(raw, currentOrigin);

    // Internal only - must match current origin
    if (u.origin !== currentOrigin) {
      return '/app/dashboard';
    }

    // Prevent redirecting to root assets or api
    const p = u.pathname + (u.search || '');
    return p.startsWith('/') ? p : '/app/dashboard';
  } catch {
    return '/app/dashboard';
  }
}

export function buildSigninWithNext(currentPathAndQuery: string): string {
  const next = encodeURIComponent(currentPathAndQuery || '/app/dashboard');
  return `/signin?next=${next}`;
}