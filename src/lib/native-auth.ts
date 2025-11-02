/**
 * Native Social Auth Integration
 *
 * Handles native sign-in for iOS using Capgo's social login plugin v7.x
 * Exchanges native provider tokens for Supabase sessions.
 */

import { SocialLogin } from '@capgo/capacitor-social-login'
import { getSupabaseClient } from '@/lib/supabase-singleton'
import { Capacitor } from '@capacitor/core'
import { jwtDecode } from 'jwt-decode'
import RadlyGoogleAuth from '@/plugins/radly-google-auth'

const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_SERVICE_ID || 'com.radly.app.signin'
const APPLE_TEAM_ID = process.env.NEXT_PUBLIC_APPLE_TEAM_ID || ''

// Track if social login has been initialized
let socialLoginInitialized = false

// Type for social login response from Capgo
interface SocialLoginResponse {
  provider?: string
  result?: {
    id_token?: string
    identityToken?: string
    nonce?: string
    idToken?: string
    accessToken?: {
      idToken?: string
      token?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  id_token?: string
  identityToken?: string
  nonce?: string
  idToken?: string
  accessToken?: {
    idToken?: string
    token?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}


/**
 * Initialize Capgo Social Login plugin
 * Call this once on app startup
 */
export async function initializeSocialLogin() {
  if (socialLoginInitialized) return

  try {
    console.log('🔐 Initializing Capgo Social Login...')

    await SocialLogin.initialize({
      apple: {
        clientId: APPLE_CLIENT_ID,
      },
      google: {
        webClientId: '590422684479-qjrih3fq3086q1gh6o3qj0maj0lnf9m0.apps.googleusercontent.com', // Web/Server Client ID (Supabase)
        iOSClientId: '590422684479-22888vk8gimtopgpl0hnkiimqs03v9qo.apps.googleusercontent.com', // iOS Client ID
        iOSServerClientId: '590422684479-qjrih3fq3086q1gh6o3qj0maj0lnf9m0.apps.googleusercontent.com', // Same as web client ID
        mode: 'online',
      },
    })

    socialLoginInitialized = true
    console.log('🔐 Social Login initialized')
  } catch (error) {
    console.error('🔐 Failed to initialize Social Login:', error)
  }
}

/**
 * Native Apple Sign-In
 *
 * Triggers native Apple Sign-In sheet on iOS.
 * Exchanges the returned ID token for a Supabase session.
 *
 * @returns Promise with user session data
 * @throws Error if sign-in fails or token exchange fails
 */
export async function signInWithAppleNative() {
  try {
    console.log('🍎 Starting native Apple Sign-In...')

    // Add Xcode-visible logging
    if (typeof window !== 'undefined' && window.console) {
      window.console.log('🍎 APPLE SIGN-IN: Starting...')
    }

    // Validate environment variables
    if (!APPLE_TEAM_ID) {
      throw new Error('NEXT_PUBLIC_APPLE_TEAM_ID is not set. Please add it to .env.local')
    }

    // Initialize if not already done
    if (!socialLoginInitialized) {
      await initializeSocialLogin()
    }

    // Trigger native Apple Sign-In using login method with provider
    const result = (await SocialLogin.login({
      provider: 'apple',
      options: {
        scopes: ['email', 'name'],
      },
    })) as unknown as SocialLoginResponse

    console.log('🍎 Apple Sign-In successful')

    // Capgo v7 response structure: { provider, result: { profile, accessToken, idToken(?) } }
    const authData = result.result || result

    console.log('🍎 Auth data keys:', Object.keys(authData))
    console.log('🍎 Full auth data:', JSON.stringify(authData, null, 2))

    // Extract idToken from the various possible paths
    let idToken: string | undefined
    if (authData.idToken && typeof authData.idToken === 'string') {
      idToken = authData.idToken
      console.log('🍎 Found idToken at authData.idToken')
    }
    // Path 2: accessToken.idToken (some Capgo versions)
    else if (authData.accessToken && typeof authData.accessToken === 'object' && 'idToken' in authData.accessToken) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const at = authData.accessToken as any
      idToken = at.idToken
      console.log('🍎 Found idToken at authData.accessToken.idToken')
    }
    // Path 3: identityToken (Apple's native property name)
    else if (authData.identityToken && typeof authData.identityToken === 'string') {
      idToken = authData.identityToken
      console.log('🍎 Found idToken at authData.identityToken')
    }
    // Path 4: Check if accessToken.token might be the JWT
    else if (authData.accessToken?.token) {
      // Check if it looks like a JWT
      if (authData.accessToken.token.includes('.')) {
        idToken = authData.accessToken.token
        console.log('🍎 Using accessToken.token as idToken (JWT detected)')
      }
    }

    console.log('🍎 Extracted idToken:', !!idToken)
    console.log('🍎 idToken type:', typeof idToken)

    if (!idToken) {
      console.error('🍎 ERROR: idToken not found in any expected location')
      console.error('🍎 Full response object:', JSON.stringify(result, null, 2))
      throw new Error('No ID token received from Apple Sign-In. idToken not found in response.')
    }

    console.log('🍎 Token extracted successfully:', idToken.substring(0, 50) + '...')

    // Extract nonce if available (optional but recommended)
    const nonce = authData.nonce || result?.nonce
    console.log('🍎 Nonce extracted:', !!nonce)

    // Use direct Supabase integration like Google Sign-In - much simpler and more reliable!
    const supabase = await getSupabaseClient()

    console.log('🍎 Exchanging Apple token directly with Supabase...')

    // Add Xcode-visible logging for critical steps
    if (typeof window !== 'undefined' && window.console) {
      window.console.log('🍎 APPLE SIGN-IN: Using direct Supabase integration')
    }

    // Direct Supabase integration - same pattern as Google Sign-In
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: idToken,
      ...(nonce && { nonce }),
    })

    if (error) {
      console.error('🍎 Apple token exchange failed:', error)
      throw error
    }

    console.log('🍎 Apple token exchange successful! User:', data.user?.email)
    console.log('🍎 Session created directly in Supabase client')

    // Force refresh of auth state to ensure session is immediately available
    await supabase.auth.refreshSession()

    // Verify session was saved properly
    const { data: sessionCheck } = await supabase.auth.getSession()
    console.log('🍎 Session verification after refresh:', {
      hasSession: !!sessionCheck.session,
      email: sessionCheck.session?.user?.email,
      expiresAt: sessionCheck.session?.expires_at
    })

    // Force session persistence check
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences')
      const keys = ['supabase.auth.token', 'supabase.auth.refreshToken']
      for (const key of keys) {
        const { value } = await Preferences.get({ key })
        console.log(`🍎 Native storage check ${key}:`, value ? '✅ found' : '❌ missing')
      }
    }

    return data
  } catch (error) {
    console.error('🍎 Apple Sign-In error:', error)
    throw error
  }
}

/**
 * Native Google Sign-In
 *
 * Triggers native Google Sign-In on iOS.
 * Exchanges the returned ID token for a Supabase session.
 * Handles nonce extraction from Google ID token to prevent Supabase validation errors.
 *
 * @returns Promise with user session data
 * @throws Error if sign-in fails or token exchange fails
 */
export async function signInWithGoogleNative() {
  try {
    console.log('🔵 Starting native Google Sign-In with custom plugin...')

    // Use our custom Google plugin that forces account selection
    const result = await RadlyGoogleAuth.signIn()

    console.log('🔵 Native plugin returned keys:', Object.keys(result))
    console.log('🔵 Native nonce (raw):', result.nonce)
    // Some plugins may include a hashed nonce; it's optional and not required here

    if (!result.idToken) {
      throw new Error('Google ID token not found in response')
    }

    console.log('🔵 Google Sign-In successful')

    // Decode the ID token to extract nonce (prevents nonce mismatch)
    const decodedToken = jwtDecode<{ nonce?: string }>(result.idToken)
    console.log('🔵 Token has nonce:', !!decodedToken.nonce)

    const rawNonce = result.nonce || decodedToken.nonce
    console.log('🔵 Raw nonce available:', rawNonce)

    // Exchange Google ID token for Supabase session
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: result.idToken,
      // Pass access token if available
      ...(result.accessToken && { access_token: result.accessToken }),
      // Pass nonce to Supabase if it exists in the Google token (prevents mismatch)
      ...(rawNonce && { nonce: rawNonce }),
    })

    if (error) {
      console.error('🔵 Token exchange failed:', error)
      throw error
    }

    console.log('🔵 Token exchange successful! User:', data.user?.email)

    // Force refresh of auth state to ensure session is immediately available
    await supabase.auth.refreshSession()

    return data
  } catch (error) {
    console.error('🔵 Google Sign-In error:', error)
    throw error
  }
}
