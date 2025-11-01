# Capacitor Mobile Authentication Implementation

This document details the complete implementation of native mobile authentication (Apple Sign-In and Google Sign-In) for the Radly iOS app using Capacitor. The solution addresses session persistence issues in Next.js 15 with HMR and provides a seamless authentication experience on iOS devices.

## Problem Statement

**Initial Issue**: Mobile authentication (Apple Sign-In) worked successfully, but sessions didn't persist after sign-in. Users would see "Unable to load usage information" error on the dashboard despite successful native authentication.

**Root Cause**: Next.js 15's Hot Module Replacement (HMR) creates multiple Supabase client instances during development, causing session storage conflicts and timing issues with Capacitor's asynchronous storage system.

## Solution Overview

### Core Architecture

1. **Global Singleton Pattern** - Single Supabase client instance surviving HMR cycles
2. **Storage Bridge** - Synchronous cache with asynchronous persistence to Capacitor Preferences
3. **Platform Detection** - Mobile-specific behavior without affecting web app
4. **Direct Supabase Integration** - Native token exchange without backend intermediaries

### Key Components

- `src/lib/supabase-singleton.ts` - Global client management
- `src/lib/capacitor-storage.ts` - Storage bridge for Capacitor
- `src/lib/native-auth.ts` - Apple & Google Sign-In implementations
- `src/hooks/usePlatform.ts` - Platform detection utilities

## Implementation Details

### 1. Global Singleton Client (`src/lib/supabase-singleton.ts`)

```typescript
declare global {
  var __supabase_client: SupabaseClient | undefined
  var __supabase_client_initialized: boolean | undefined
}

export async function getSupabaseClient(): Promise<SupabaseClient> {
  // Prevent server-side execution
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient() can only be called on the client side')
  }

  // Return existing instance if available
  if (globalThis.__supabase_client && globalThis.__supabase_client_initialized) {
    return globalThis.__supabase_client
  }

  // Create new singleton instance
  globalThis.__supabase_client = createSupabaseClient()
  globalThis.__supabase_client_initialized = true

  return globalThis.__supabase_client
}
```

**Key Features**:
- Uses `globalThis` to survive HMR cycles
- Platform-specific storage (Capacitor vs Web)
- Initialization state tracking
- Server-side execution protection

### 2. Capacitor Storage Bridge (`src/lib/capacitor-storage.ts`)

```typescript
class CapacitorStorageBridge {
  private cache = new Map<string, string>()
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    // Pre-load all Supabase keys into cache
    const keys = [
      'supabase.auth.token',
      'supabase.auth.refreshToken',
      'supabase.auth.user'
    ]

    for (const key of keys) {
      const { value } = await Preferences.get({ key })
      if (value) {
        this.cache.set(key, value)
      }
    }

    this.initialized = true
  }

  getItem(key: string): string | null {
    if (!this.initialized) return null
    return this.cache.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.cache.set(key, value)
    // Async persistence in background
    this._persistToStorage(key, value)
  }
}
```

**Key Features**:
- Synchronous interface for Supabase compatibility
- Asynchronous persistence to Capacitor Preferences
- Pre-loading of authentication keys on initialization
- Background persistence to avoid blocking main thread

### 3. Native Apple Sign-In (`src/lib/native-auth.ts`)

```typescript
export async function signInWithAppleNative() {
  try {
    console.log('🍎 Starting native Apple Sign-In...')

    // Validate environment variables
    if (!APPLE_TEAM_ID) {
      throw new Error('NEXT_PUBLIC_APPLE_TEAM_ID is not set')
    }

    // Initialize Capgo Social Login
    await initializeSocialLogin()

    // Trigger native Apple Sign-In
    const result = await SocialLogin.login({
      provider: 'apple',
      options: { scopes: ['email', 'name'] },
    })

    // Extract ID token from multiple possible response structures
    const authData = result.result || result
    let idToken: string | undefined

    // Try multiple extraction paths for idToken
    if (authData.idToken) {
      idToken = authData.idToken
    } else if (authData.accessToken?.idToken) {
      idToken = authData.accessToken.idToken
    } else if (authData.identityToken) {
      idToken = authData.identityToken
    }

    if (!idToken) {
      throw new Error('No ID token received from Apple Sign-In')
    }

    // Direct Supabase integration
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: idToken,
      ...(nonce && { nonce }),
    })

    if (error) {
      throw error
    }

    // Force session refresh and persistence check
    await supabase.auth.refreshSession()

    return data
  } catch (error) {
    console.error('🍎 Apple Sign-In error:', error)
    throw error
  }
}
```

**Key Features**:
- Multiple token extraction paths for Capgo v7 compatibility
- Direct Supabase token exchange (no backend intermediate)
- Comprehensive error handling and logging
- Session refresh and persistence verification

### 4. Native Google Sign-In (`src/lib/native-auth.ts`)

```typescript
export async function signInWithGoogleNative() {
  try {
    console.log('🔵 Starting native Google Sign-In...')

    await initializeSocialLogin()

    const result = await SocialLogin.login({
      provider: 'google',
      options: { scopes: ['email', 'profile'] },
    })

    const authData = result.result || result
    const idToken = (authData as any).idToken || (authData as any).accessToken?.idToken

    if (!idToken) {
      throw new Error('No ID token received from Google Sign-In')
    }

    // Decode token to extract nonce for Supabase validation
    const decodedToken = jwtDecode<GoogleJwtPayload>(idToken)

    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      access_token: (authData as any).accessToken?.token,
      ...(decodedToken.nonce && { nonce: decodedToken.nonce }),
    })

    if (error) {
      throw error
    }

    await supabase.auth.refreshSession()
    return data
  } catch (error) {
    console.error('🔵 Google Sign-In error:', error)
    throw error
  }
}
```

**Key Features**:
- Nonce extraction and validation for Google tokens
- Access token passing for enhanced integration
- Same direct Supabase integration pattern as Apple

## Configuration

### 1. Environment Variables (`.env.local`)

```bash
# Native Social Login (Apple)
NEXT_PUBLIC_APPLE_SERVICE_ID=com.radly.app.signin
NEXT_PUBLIC_APPLE_TEAM_ID=5C282NCY69

# Native Social Login (Google)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=590422684479-22888vk8gimtopgpl0hnkiimqs03v9qo.apps.googleusercontent.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bsldtgivgtyzacwyvcfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Capacitor Configuration (`capacitor.config.ts`)

```typescript
plugins: {
  CapacitorSocialLogin: {
    iOSAppleLogin: true,
    iOSGoogleLogin: true,
    androidAppleLogin: true,
    androidGoogleLogin: true,
    appleClientId: 'com.radly.app.signin',
    appleServiceId: 'com.radly.app.signin',
    appleTeamId: '5C282NCY69',
    googleWebClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    googleiOSClientId: '590422684479-22888vk8gimtopgpl0hnkiimqs03v9qo.apps.googleusercontent.com',
    googleiOSServerClientId: '590422684479-qjrih3fq3086q1gh6o3qj0maj0lnf9m0.apps.googleusercontent.com',
  },
}
```

### 3. iOS Configuration (`ios/App/App/Info.plist`)

```xml
<!-- Google Sign-In Configuration -->
<key>GIDClientID</key>
<string>590422684479-22888vk8gimtopgpl0hnkiimqs03v9qo.apps.googleusercontent.com</string>
<key>GIDServerClientID</key>
<string>590422684479-qjrih3fq3086q1gh6o3qj0maj0lnf9m0.apps.googleusercontent.com</string>

<!-- URL Schemes for Google Sign-In -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.googleusercontent.apps.590422684479-22888vk8gimtopgpl0hnkiimqs03v9qo</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.590422684479-22888vk8gimtopgpl0hnkiimqs03v9qo</string>
    </array>
  </dict>
</array>
```

## Usage Implementation

### Sign-In Page Integration (`src/app/auth/signin/page.tsx`)

```typescript
import { signInWithAppleNative, signInWithGoogleNative } from '@/lib/native-auth'
import { getSupabaseClient } from '@/lib/supabase-singleton'
import { usePlatform } from '@/hooks/usePlatform'

function SignInContent() {
  const { isNative } = usePlatform()
  const supabase = getSupabaseClient()

  async function signInWithApple() {
    try {
      if (isNative) {
        // Native sign-in
        const signInResult = await signInWithAppleNative()

        // Wait for session persistence
        await new Promise(resolve => setTimeout(resolve, 2000))

        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push(next)
        }
      } else {
        // Web OAuth flow
        await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: { redirectTo: getRedirectUrl() },
        })
      }
    } catch (error) {
      setError(error.message)
    }
  }

  async function signInWithGoogle() {
    // Similar pattern to Apple Sign-In
  }
}
```

## Platform Detection

### Hook Implementation (`src/hooks/usePlatform.ts`)

```typescript
import { Capacitor } from '@capacitor/core'

export function usePlatform() {
  const isNative = Capacitor.isNativePlatform()
  const isIOS = Capacitor.getPlatform() === 'ios'
  const isAndroid = Capacitor.getPlatform() === 'android'
  const isWeb = !isNative

  return {
    isNative,
    isIOS,
    isAndroid,
    isWeb,
    platform: Capacitor.getPlatform() as 'ios' | 'android' | 'web'
  }
}
```

## Dependencies

### Required Packages

```bash
npm install @capgo/capacitor-social-login @capacitor/preferences @capacitor/core jwt-decode
```

### Package Versions

```json
{
  "@capgo/capacitor-social-login": "^7.3.0",
  "@capacitor/preferences": "^6.0.3",
  "@capacitor/core": "^6.1.2",
  "@capacitor/cli": "^6.1.2",
  "jwt-decode": "^4.0.0"
}
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. "Can't find variable: global" Error

**Problem**: Capacitor webview doesn't have `global` variable defined.

**Solution**: Add polyfill in singleton initialization:
```typescript
;(globalThis as any).global = globalThis
```

#### 2. "No active configuration. Make sure GIDClientID is set" Error

**Problem**: Google Client ID not configured in Info.plist.

**Solution**: Add to `ios/App/App/Info.plist`:
```xml
<key>GIDClientID</key>
<string>YOUR_IOS_CLIENT_ID</string>
```

#### 3. "Your app is missing support for URL schemes" Error

**Problem**: Google URL schemes not configured.

**Solution**: Add CFBundleURLTypes to Info.plist (see configuration above).

#### 4. "invalid_audience: Audience is not a valid client ID" Error

**Problem**: Wrong Google Client ID configuration.

**Solution**:
- Use iOS Client ID in Info.plist and Capacitor config
- Ensure web client ID is configured in Supabase dashboard
- Match client IDs exactly across all configurations

#### 5. "Passed nonce and nonce in id_token should either both exist or not" Error

**Problem**: Nonce mismatch between Google token and Supabase.

**Solution**: Extract nonce from Google ID token and pass to Supabase:
```typescript
const decodedToken = jwtDecode(idToken)
await supabase.auth.signInWithIdToken({
  token: idToken,
  ...(decodedToken.nonce && { nonce: decodedToken.nonce })
})
```

### Debugging Tools

#### Xcode Console Logging

Add Xcode-visible logging for critical steps:
```typescript
if (typeof window !== 'undefined' && window.console) {
  window.console.log('🍎 APPLE SIGN-IN: Critical step completed')
}
```

#### Session Persistence Verification

```typescript
// Check native storage
if (Capacitor.isNativePlatform()) {
  const { Preferences } = await import('@capacitor/preferences')
  const keys = ['supabase.auth.token', 'supabase.auth.refreshToken']
  for (const key of keys) {
    const { value } = await Preferences.get({ key })
    console.log(`🔐 Native storage ${key}:`, value ? '✅ found' : '❌ missing')
  }
}
```

## Testing

### Manual Testing Workflow

1. **Clean Build**: Remove app from device and reinstall
2. **Sign-In Flow**: Test both Apple and Google Sign-In
3. **Session Persistence**: Close and reopen app, verify session remains
4. **Cross-Platform**: Test on both simulator and physical device
5. **Web Compatibility**: Ensure web authentication still works

### Automated Testing

The implementation includes comprehensive logging and error handling to facilitate debugging during development and testing phases.

## Architecture Benefits

### 1. Mobile-Only Changes
- Uses platform detection to avoid affecting web app
- Graceful fallback to web OAuth on non-native platforms
- Maintains existing web authentication flow

### 2. Session Persistence
- Global singleton survives HMR cycles
- Storage bridge ensures reliable token storage
- Pre-loading of authentication keys prevents timing issues

### 3. Performance
- Direct Supabase integration reduces latency
- Asynchronous persistence doesn't block UI
- Singleton pattern reduces client initialization overhead

### 4. Reliability
- Multiple token extraction paths handle plugin variations
- Comprehensive error handling and logging
- Session verification and refresh mechanisms

## Future Considerations

### 1. Android Support
The implementation is structured to support Android with minimal changes:
- Add Android client IDs to configuration
- Test on Android devices
- Handle platform-specific UI differences

### 2. Additional Providers
The singleton and storage architecture can accommodate additional OAuth providers:
- Facebook, Twitter, Microsoft
- Enterprise SSO providers
- Custom authentication methods

### 3. Enhanced Security
- Token refresh optimization
- Biometric authentication integration
- Device-specific authentication policies

## Conclusion

This implementation successfully resolves mobile session persistence issues while maintaining web app compatibility. The solution is robust, performant, and extensible for future requirements.

**Key Success Metrics**:
- ✅ Apple Sign-In working with session persistence
- ✅ Google Sign-In working with session persistence
- ✅ Web authentication unchanged
- ✅ Comprehensive error handling and logging
- ✅ Platform-specific behavior without breaking changes

The implementation provides a solid foundation for mobile authentication in the Radly app and can be extended to support additional features and platforms as needed.