/**
 * Helpers to build auth callback URLs for web and mobile.
 *
 * Mobile default is Universal Links (https) which works across email clients.
 * Set NEXT_PUBLIC_MOBILE_MAGIC_SCHEME=capacitor to switch back to capacitor://.
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

export function getUniversalCallbackUrl(): string {
  // Prefer explicit universal URL if provided
  let base = process.env.NEXT_PUBLIC_UNIVERSAL_SITE_URL
    || process.env.NEXT_PUBLIC_SITE_URL
    || 'https://radly.app'

  // If base points to localhost, fall back to production domain to make email links work on devices
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(base)) {
    base = 'https://radly.app'
  }

  return `${stripTrailingSlash(base)}/auth/callback`
}

export function getCapacitorCallbackUrl(): string {
  return 'capacitor://localhost/auth/callback'
}

export function getMobileMagicRedirectUrl(): string {
  const mode = (process.env.NEXT_PUBLIC_MOBILE_MAGIC_SCHEME || 'universal').toLowerCase()
  return mode === 'capacitor' ? getCapacitorCallbackUrl() : getUniversalCallbackUrl()
}

export function getWebCallbackUrl(): string {
  const fallback = getUniversalCallbackUrl()
  if (typeof window === 'undefined') return fallback
  const origin = window.location.origin
  if (origin.startsWith('http://') || origin.startsWith('https://')) {
    return `${stripTrailingSlash(origin)}/auth/callback`
  }
  return fallback
}
