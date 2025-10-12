/**
 * Test mode utilities for E2E testing
 * 
 * Test mode allows bypassing authentication and other checks
 * for automated testing purposes.
 */

/**
 * Check if application is running in test mode
 */
export function isTestMode(): boolean {
  // Check environment variables
  if (
    process.env.NEXT_PUBLIC_TEST_MODE === 'true' ||
    process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'
  ) {
    return true
  }

  // Check URL query parameter (client-side only)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('test') === 'true') {
      return true
    }
  }

  return false
}

/**
 * Get mock test user for test mode
 */
export function getTestUser() {
  if (!isTestMode()) return null

  return {
    id: 'test-user-id-12345',
    email: 'test@radly.test',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {
      full_name: 'Test User',
    },
    identities: [],
    factors: [],
    is_anonymous: false,
    phone: '',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    phone_confirmed_at: undefined,
    confirmed_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-01-01T00:00:00Z',
    is_sso_user: false,
    provider: 'email',
    providers: ['email'],
  }
}

/**
 * Get mock test session for test mode
 */
export function getTestSession() {
  if (!isTestMode()) return null

  const user = getTestUser()
  if (!user) return null

  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer' as const,
    user,
  }
}

/**
 * Log test mode status (development only)
 */
export function logTestModeStatus() {
  if (process.env.NODE_ENV === 'development') {
    const testMode = isTestMode()
    if (testMode) {
      console.log('🧪 Test mode is ENABLED - Authentication bypassed')
    }
  }
}
