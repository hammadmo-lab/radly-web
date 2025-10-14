export function sanitizeNext(raw: string | null | undefined): string {
  // Accept only same-origin internal paths. Default to dashboard.
  if (!raw) return '/app/dashboard';
  try {
    // Support absolute URLs by parsing against current origin
    const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://radly.app');
    // Internal only
    if (u.origin !== (typeof window !== 'undefined' ? window.location.origin : 'https://radly.app')) {
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
