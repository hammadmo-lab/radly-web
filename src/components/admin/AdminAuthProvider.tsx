"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AdminAuthContext } from '@/types/admin'
import { toast } from 'sonner'

const AdminAuthContextInstance = createContext<AdminAuthContext | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminKey, setAdminKey] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    try {
      // Load from localStorage on mount
      const storedAdminKey = localStorage.getItem('admin_key')
      const storedApiKey = localStorage.getItem('api_key')
      
      console.log('AdminAuthProvider: Loading from localStorage', { storedAdminKey: !!storedAdminKey, storedApiKey: !!storedApiKey })
      
      if (storedAdminKey && storedApiKey) {
        setAdminKey(storedAdminKey)
        setApiKey(storedApiKey)
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const login = (newAdminKey: string, newApiKey: string) => {
    setAdminKey(newAdminKey)
    setApiKey(newApiKey)
    
    // Only set localStorage on client side
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('admin_key', newAdminKey)
        localStorage.setItem('api_key', newApiKey)
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }

  const logout = useCallback(() => {
    console.log('Admin logout called')
    
    try {
      setAdminKey(null)
      setApiKey(null)
      
      // Only remove from localStorage on client side
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_key')
        localStorage.removeItem('api_key')
      }
      // Don't remove username if "remember me" was checked
      
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }, [])

  const isAuthenticated = Boolean(adminKey && apiKey)
  
  console.log('AdminAuthProvider: Current state', { adminKey: !!adminKey, apiKey: !!apiKey, isAuthenticated })

  return (
    <AdminAuthContextInstance.Provider value={{
      adminKey,
      apiKey,
      isAuthenticated,
      isInitialized,
      login,
      logout,
    }}>
      {children}
    </AdminAuthContextInstance.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContextInstance)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
