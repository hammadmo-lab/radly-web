"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { AdminAuthContext } from '@/types/admin'

const AdminAuthContextInstance = createContext<AdminAuthContext | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminKey, setAdminKey] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)

  useEffect(() => {
    // Load from localStorage on mount
    const storedAdminKey = localStorage.getItem('admin_key')
    const storedApiKey = localStorage.getItem('api_key')
    
    if (storedAdminKey && storedApiKey) {
      setAdminKey(storedAdminKey)
      setApiKey(storedApiKey)
    }
  }, [])

  const login = (newAdminKey: string, newApiKey: string) => {
    setAdminKey(newAdminKey)
    setApiKey(newApiKey)
    localStorage.setItem('admin_key', newAdminKey)
    localStorage.setItem('api_key', newApiKey)
  }

  const logout = () => {
    setAdminKey(null)
    setApiKey(null)
    localStorage.removeItem('admin_key')
    localStorage.removeItem('api_key')
  }

  return (
    <AdminAuthContextInstance.Provider value={{
      adminKey,
      apiKey,
      isAuthenticated: Boolean(adminKey && apiKey),
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
