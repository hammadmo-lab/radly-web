/**
 * Auth Origin Storage
 *
 * Handles storing and retrieving the origin URL and destination path for multi-environment auth redirects.
 * Uses cookies so the data is accessible server-side in the callback handler.
 */

const AUTH_ORIGIN_COOKIE = 'auth_origin'
const AUTH_NEXT_COOKIE = 'auth_next'
const COOKIE_MAX_AGE = 600 // 10 minutes (enough time for auth flow)

/**
 * Store the current origin and next path before starting auth flow
 * This will be used by the callback handler to redirect back to the correct environment
 */
export function storeAuthOrigin(nextPath: string = '/app/dashboard'): void {
  if (typeof window === 'undefined') return

  const origin = window.location.origin

  // Store origin and next path in separate cookies (accessible server-side)
  document.cookie = `${AUTH_ORIGIN_COOKIE}=${encodeURIComponent(origin)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(nextPath)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`

  console.log('🔐 Stored auth data:', { origin, nextPath })
}

/**
 * Get the stored auth data from cookies
 * Used by the callback handler to determine where to redirect
 */
export function getStoredAuthData(cookieHeader?: string): { origin: string | null; next: string | null } {
  const getCookie = (name: string): string | null => {
    // Server-side: parse from cookie header
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim())
      const cookie = cookies.find(c => c.startsWith(`${name}=`))
      if (cookie) {
        const value = cookie.split('=')[1]
        return decodeURIComponent(value)
      }
      return null
    }

    // Client-side: parse from document.cookie
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const cookie = cookies.find(c => c.startsWith(`${name}=`))
      if (cookie) {
        const value = cookie.split('=')[1]
        return decodeURIComponent(value)
      }
    }

    return null
  }

  return {
    origin: getCookie(AUTH_ORIGIN_COOKIE),
    next: getCookie(AUTH_NEXT_COOKIE)
  }
}

/**
 * Get the stored origin from cookie (for backwards compatibility)
 */
export function getStoredAuthOrigin(cookieHeader?: string): string | null {
  return getStoredAuthData(cookieHeader).origin
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
