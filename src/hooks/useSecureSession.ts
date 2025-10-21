/**
 * Secure session management hook with automatic token refresh
 */
import { useEffect, useState } from 'react'
import { AuthSecurity } from '@/lib/auth-security'
import { useRouter } from 'next/navigation'

export function useSecureSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      const token = await AuthSecurity.getSecureToken()
      setIsAuthenticated(!!token)
      setIsLoading(false)
    }

    checkAuth()

    // Set up token refresh interval (every 4 minutes)
    const refreshInterval = setInterval(async () => {
      const refreshed = await AuthSecurity.refreshTokenIfNeeded()
      
      if (!refreshed) {
        // Token refresh failed, redirect to login
        setIsAuthenticated(false)
        router.push('/sign-in')
      }
    }, 4 * 60 * 1000) // 4 minutes

    return () => clearInterval(refreshInterval)
  }, [router])

  const logout = async () => {
    await AuthSecurity.secureLogout()
    setIsAuthenticated(false)
    // Redirect to home page (works on any domain)
    window.location.href = '/'
  }

  return {
    isAuthenticated,
    isLoading,
    logout,
  }
}
