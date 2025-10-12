/**
 * Secure authentication utilities for client-side auth handling
 */
import { createBrowserSupabase } from '@/lib/supabase/client'

export class AuthSecurity {
  /**
   * Securely retrieve auth token (never from localStorage directly)
   */
  static async getSecureToken(): Promise<string | null> {
    try {
      const supabase = createBrowserSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch (error) {
      console.error('Failed to get secure token:', error)
      return null
    }
  }

  /**
   * Validate token format before use
   */
  static isValidTokenFormat(token: string): boolean {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Each part should be base64url encoded
    try {
      parts.forEach(part => {
        if (!part || part.length === 0) throw new Error('Invalid part')
        // Basic base64url validation
        if (!/^[A-Za-z0-9_-]+$/.test(part)) throw new Error('Invalid encoding')
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if token is expired (without decoding on client)
   */
  static async isTokenExpired(): Promise<boolean> {
    try {
      const supabase = createBrowserSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return true
      
      const expiresAt = session.expires_at
      if (!expiresAt) return true
      
      // Check if expires in next 5 minutes
      const now = Math.floor(Date.now() / 1000)
      return expiresAt - now < 300
    } catch {
      return true
    }
  }

  /**
   * Safely refresh authentication token
   */
  static async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const isExpired = await this.isTokenExpired()
      
      if (isExpired) {
        const supabase = createBrowserSupabase()
        const { data, error } = await supabase.auth.refreshSession()
        
        if (error) {
          console.error('Token refresh failed:', error)
          return false
        }
        
        return !!data.session
      }
      
      return true
    } catch (error) {
      console.error('Token refresh check failed:', error)
      return false
    }
  }

  /**
   * Clear all authentication data (secure logout)
   */
  static async secureLogout(): Promise<void> {
    try {
      const supabase = createBrowserSupabase()
      await supabase.auth.signOut()
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        sessionStorage.clear()
        // Don't clear localStorage entirely (may have user preferences)
      }
    } catch (error) {
      console.error('Secure logout failed:', error)
    }
  }
}
