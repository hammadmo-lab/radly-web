/**
 * Auth Origin Storage
 *
 * Handles storing and retrieving the origin URL for multi-environment auth redirects.
 * Uses cookies so the origin is accessible server-side in the callback handler.
 */

const AUTH_ORIGIN_COOKIE = 'auth_origin'
const COOKIE_MAX_AGE = 600 // 10 minutes (enough time for auth flow)

/**
 * Store the current origin before starting auth flow
 * This will be used by the callback handler to redirect back to the correct environment
 */
export function storeAuthOrigin(): void {
  if (typeof window === 'undefined') return

  const origin = window.location.origin

  // Store in cookie (accessible server-side)
  document.cookie = `${AUTH_ORIGIN_COOKIE}=${encodeURIComponent(origin)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`

  console.log('🔐 Stored auth origin:', origin)
}

/**
 * Get the stored origin from cookie
 * Used by the callback handler to determine where to redirect
 */
export function getStoredAuthOrigin(cookieHeader?: string): string | null {
  // Server-side: parse from cookie header
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim())
    const authCookie = cookies.find(c => c.startsWith(`${AUTH_ORIGIN_COOKIE}=`))
    if (authCookie) {
      const value = authCookie.split('=')[1]
      return decodeURIComponent(value)
    }
    return null
  }

  // Client-side: parse from document.cookie
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const authCookie = cookies.find(c => c.startsWith(`${AUTH_ORIGIN_COOKIE}=`))
    if (authCookie) {
      const value = authCookie.split('=')[1]
      return decodeURIComponent(value)
    }
  }

  return null
}

/**
 * Clear the stored origin after successful redirect
 */
export function clearAuthOrigin(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${AUTH_ORIGIN_COOKIE}=; path=/; max-age=0`
  }
}

/**
 * Get the default origin fallback
 * Used when no origin is stored (shouldn't happen in normal flow)
 */
export function getDefaultOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://radly.app'
}
