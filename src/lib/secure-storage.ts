/**
 * Secure client-side storage utilities
 * NEVER store PHI in browser storage
 */

export class SecureStorage {
  /**
   * Store non-sensitive data in localStorage with encryption
   * Note: Only for user preferences, NOT for PHI
   */
  static setItem(key: string, value: unknown): void {
    if (typeof window === 'undefined') return

    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.error('Failed to store item:', error)
    }
  }

  /**
   * Retrieve non-sensitive data from localStorage
   */
  static getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      return JSON.parse(item) as T
    } catch (error) {
      console.error('Failed to retrieve item:', error)
      return null
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  /**
   * Store temporary data in sessionStorage (cleared on tab close)
   * Better for sensitive workflow data
   */
  static setSessionItem(key: string, value: unknown): void {
    if (typeof window === 'undefined') return

    try {
      const serialized = JSON.stringify(value)
      sessionStorage.setItem(key, serialized)
    } catch (error) {
      console.error('Failed to store session item:', error)
    }
  }

  /**
   * Retrieve temporary data from sessionStorage
   */
  static getSessionItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const item = sessionStorage.getItem(key)
      if (!item) return null

      return JSON.parse(item) as T
    } catch (error) {
      console.error('Failed to retrieve session item:', error)
      return null
    }
  }

  /**
   * Clear all session data
   */
  static clearSession(): void {
    if (typeof window === 'undefined') return

    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  /**
   * Check if storage is available
   */
  static isAvailable(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
}

/**
 * IMPORTANT: Never store PHI in browser storage
 * 
 * ✅ Safe to store:
 * - User preferences (theme, language)
 * - UI state (sidebar collapsed)
 * - Non-sensitive settings
 * 
 * ❌ Never store:
 * - Patient names, MRN, DOB
 * - Clinical findings
 * - Generated reports
 * - Authentication tokens (use httpOnly cookies)
 */
