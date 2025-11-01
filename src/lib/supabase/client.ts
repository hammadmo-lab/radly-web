'use client'

import { createBrowserClient } from '@supabase/ssr'

// Try to use AsyncStorage if available (Capacitor), otherwise use Capacitor Storage, otherwise use localStorage
let storageAdapter: { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<void>; removeItem: (key: string) => Promise<void> } | undefined

// First try AsyncStorage
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AsyncStorageModule = require('@react-native-async-storage/async-storage')
  const AsyncStorageInstance = AsyncStorageModule.default || AsyncStorageModule

  if (AsyncStorageInstance) {
    storageAdapter = {
      getItem: async (key: string) => {
        try {
          const value = await AsyncStorageInstance.getItem(key)
          console.log('🍎 AsyncStorage.getItem:', key, !!value)
          return value
        } catch (error) {
          console.error('🍎 AsyncStorage.getItem error:', error)
          return null
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          console.log('🍎 AsyncStorage.setItem:', key, value?.substring(0, 20) + '...')
          await AsyncStorageInstance.setItem(key, value)
        } catch (error) {
          console.error('🍎 AsyncStorage.setItem error:', error)
        }
      },
      removeItem: async (key: string) => {
        try {
          await AsyncStorageInstance.removeItem(key)
        } catch (error) {
          console.error('🍎 AsyncStorage.removeItem error:', error)
        }
      },
    }
  }
} catch {
  console.log('🍎 AsyncStorage not available, trying Capacitor Storage...')

  // Fallback to Capacitor Preferences
  try {
    // Dynamic import to avoid SSR issues
    const { Preferences } = await import('@capacitor/preferences')

    storageAdapter = {
      getItem: async (key: string) => {
        try {
          const { value } = await Preferences.get({ key })
          console.log('🍎 CapacitorPreferences.getItem:', key, !!value)
          return value
        } catch (error) {
          console.error('🍎 CapacitorPreferences.getItem error:', error)
          return null
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          console.log('🍎 CapacitorPreferences.setItem:', key, value?.substring(0, 20) + '...')
          await Preferences.set({ key, value })
        } catch (error) {
          console.error('🍎 CapacitorPreferences.setItem error:', error)
        }
      },
      removeItem: async (key: string) => {
        try {
          await Preferences.remove({ key })
        } catch (error) {
          console.error('🍎 CapacitorPreferences.removeItem error:', error)
        }
      },
    }
    console.log('🍎 Using Capacitor Preferences adapter')
  } catch {
    console.log('🍎 Capacitor Preferences not available, using default storage')
  }
}

const storageConfig = storageAdapter ? { storage: storageAdapter } : {}

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use AsyncStorage for native Capacitor app persistence if available
        ...storageConfig,
        // Disable automatic redirect URL validation
        // This allows redirectTo to work with any domain in the allowed list
        flowType: 'pkce',
        // Don't auto-detect redirect (causes issues on native)
        detectSessionInUrl: false,
        // Enable session persistence
        persistSession: true,
        // Auto-refresh tokens
        autoRefreshToken: true,
      },
    }
  )
}
