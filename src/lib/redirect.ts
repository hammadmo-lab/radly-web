export function sanitizeNext(raw: string | null | undefined): string {
  // Accept only same-origin internal paths. Default to templates.
  if (!raw) return '/app/templates';
  try {
    // Support absolute URLs by parsing against current origin
    const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://radly.app');
    // Internal only
    if (u.origin !== (typeof window !== 'undefined' ? window.location.origin : 'https://radly.app')) {
      return '/app/templates';
    }
    // Prevent redirecting to root assets or api
    const p = u.pathname + (u.search || '');
    return p.startsWith('/') ? p : '/app/templates';
  } catch {
    return '/app/templates';
  }
}

export function buildSigninWithNext(currentPathAndQuery: string): string {
  const next = encodeURIComponent(currentPathAndQuery || '/app/templates');
  return `/signin?next=${next}`;
}
