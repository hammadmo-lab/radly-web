/**
 * Helpers to build auth callback URLs for the web experience.
 *
 * We rely exclusively on universal HTTPS links so magic links work across email clients
 * on both desktop and mobile browsers.
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

export function getMobileMagicRedirectUrl(): string {
  return getUniversalCallbackUrl()
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
