/**
 * Capacitor Storage Bridge for Supabase
 *
 * Provides synchronous storage interface for Supabase while persisting
 * to Capacitor Preferences asynchronously in the background.
 */

import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

/**
 * Storage bridge that syncs memory cache with Capacitor Preferences
 */
class CapacitorStorageBridge {
  private static instance: CapacitorStorageBridge
  private cache = new Map<string, string>()
  private initialized = false
  private initializationPromise: Promise<void> | null = null
  private readonly STORAGE_PREFIX = 'sb-' // Supabase keys prefix

  static getInstance(): CapacitorStorageBridge {
    if (!CapacitorStorageBridge.instance) {
      CapacitorStorageBridge.instance = new CapacitorStorageBridge()
    }
    return CapacitorStorageBridge.instance
  }

  /**
   * Initialize storage bridge by loading existing keys from Preferences
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('📦 Storage bridge already initialized')
      return
    }

    // Prevent concurrent initialization
    if (this.initializationPromise) {
      console.log('⏳ Waiting for storage bridge initialization...')
      return this.initializationPromise
    }

    this.initializationPromise = this._doInitialize()
    return this.initializationPromise
  }

  private async _doInitialize(): Promise<void> {
    try {
      console.log('📦 Initializing Capacitor storage bridge...')

      if (!Capacitor.isNativePlatform()) {
        console.log('🌐 Not on native platform, skipping Capacitor storage')
        this.initialized = true
        return
      }

      // Get all keys from Preferences
      const { keys } = await Preferences.keys()
      const supabaseKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX))

      console.log(`📋 Found ${supabaseKeys.length} Supabase keys in Preferences`)

      // Load all Supabase keys into memory cache
      for (const fullKey of supabaseKeys) {
        try {
          const { value } = await Preferences.get({ key: fullKey })
          if (value) {
            // Remove prefix for cache key (Supabase expects keys without prefix)
            const cacheKey = fullKey.substring(this.STORAGE_PREFIX.length)
            this.cache.set(cacheKey, value)
            console.log(`  ✓ Loaded: ${cacheKey}`)
          }
        } catch (error) {
          console.error(`  ❌ Failed to load key ${fullKey}:`, error)
        }
      }

      this.initialized = true
      console.log(`✅ Storage bridge initialized with ${this.cache.size} keys`)

    } catch (error) {
      console.error('❌ Storage bridge initialization failed:', error)
      this.initialized = true // Prevent infinite retry
    }
  }

  /**
   * Synchronous getItem for Supabase compatibility
   */
  getItem(key: string): string | null {
    if (!this.initialized) {
      console.warn('⚠️ Storage bridge not initialized, returning null for key:', key)
      return null
    }

    const value = this.cache.get(key) || null
    console.log(`📖 Storage GET ${key}: ${value ? 'FOUND' : 'NULL'}`)
    return value
  }

  /**
   * Synchronous setItem with async persistence
   */
  setItem(key: string, value: string): void {
    if (!this.initialized) {
      console.warn('⚠️ Storage bridge not initialized, cannot set key:', key)
      return
    }

    console.log(`💾 Storage SET ${key}: ${value.substring(0, 50)}...`)

    // Update cache immediately (synchronous)
    this.cache.set(key, value)

    // Persist to Preferences asynchronously in background
    this._persistToStorage(key, value).catch(error => {
      console.error(`❌ Failed to persist ${key} to storage:`, error)
    })
  }

  /**
   * Synchronous removeItem with async removal
   */
  removeItem(key: string): void {
    if (!this.initialized) {
      console.warn('⚠️ Storage bridge not initialized, cannot remove key:', key)
      return
    }

    console.log(`🗑️ Storage REMOVE ${key}`)

    // Remove from cache immediately (synchronous)
    this.cache.delete(key)

    // Remove from Preferences asynchronously in background
    this._removeFromStorage(key).catch(error => {
      console.error(`❌ Failed to remove ${key} from storage:`, error)
    })
  }

  /**
   * Async persistence to Capacitor Preferences
   */
  private async _persistToStorage(key: string, value: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return // Not on native platform, skip persistence
    }

    const fullKey = this.STORAGE_PREFIX + key
    try {
      await Preferences.set({ key: fullKey, value })
      console.log(`  ✓ Persisted to Preferences: ${key}`)
    } catch (error) {
      console.error(`  ❌ Preferences.set failed for ${key}:`, error)
      throw error
    }
  }

  /**
   * Async removal from Capacitor Preferences
   */
  private async _removeFromStorage(key: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return // Not on native platform, skip removal
    }

    const fullKey = this.STORAGE_PREFIX + key
    try {
      await Preferences.remove({ key: fullKey })
      console.log(`  ✓ Removed from Preferences: ${key}`)
    } catch (error) {
      console.error(`  ❌ Preferences.remove failed for ${key}:`, error)
      throw error
    }
  }

  /**
   * Clear all storage (for logout scenarios)
   */
  async clear(): Promise<void> {
    console.log('🧹 Clearing all storage bridge data')

    // Clear cache
    this.cache.clear()

    // Clear Preferences
    if (Capacitor.isNativePlatform()) {
      try {
        const { keys } = await Preferences.keys()
        const supabaseKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX))

        for (const fullKey of supabaseKeys) {
          await Preferences.remove({ key: fullKey })
        }

        console.log(`  ✓ Cleared ${supabaseKeys.length} keys from Preferences`)
      } catch (error) {
        console.error('❌ Failed to clear Preferences:', error)
      }
    }
  }

  /**
   * Get debug information
   */
  getDebugInfo(): {
    initialized: boolean
    cacheSize: number
    cachedKeys: string[]
    platform: string
    prefix: string
  } {
    return {
      initialized: this.initialized,
      cacheSize: this.cache.size,
      cachedKeys: Array.from(this.cache.keys()),
      platform: Capacitor.isNativePlatform() ? 'capacitor' : 'web',
      prefix: this.STORAGE_PREFIX,
    }
  }
}

/**
 * Create storage adapter for Supabase
 */
export function createCapacitorStorageAdapter() {
  const bridge = CapacitorStorageBridge.getInstance()

  // Initialize bridge (fire and forget, but keep the promise for debugging)
  bridge.initialize().catch(error => {
    console.error('❌ Storage bridge initialization failed:', error)
  })

  return {
    getItem: (key: string) => bridge.getItem(key),
    setItem: (key: string, value: string) => bridge.setItem(key, value),
    removeItem: (key: string) => bridge.removeItem(key),
  }
}

/**
 * Get storage bridge instance (for direct access)
 */
export function getStorageBridge(): CapacitorStorageBridge {
  return CapacitorStorageBridge.getInstance()
}

/**
 * Debug function to inspect storage state
 */
export async function debugStorageState(): Promise<void> {
  console.log('=== CAPACITOR STORAGE DEBUG ===')

  const bridge = getStorageBridge()
  const debugInfo = bridge.getDebugInfo()

  console.log('Bridge Info:', debugInfo)

  if (Capacitor.isNativePlatform()) {
    try {
      const { keys } = await Preferences.keys()
      const allKeys = keys.filter(key => key.startsWith('sb-'))

      console.log(`\nPreferences Keys (${allKeys.length}):`)
      for (const fullKey of allKeys) {
        const { value } = await Preferences.get({ key: fullKey })
        const preview = value ? `${value.substring(0, 100)}...` : 'null'
        console.log(`  ${fullKey}: ${preview}`)
      }
    } catch (error) {
      console.error('Failed to read Preferences:', error)
    }
  }

  console.log('==============================')
}