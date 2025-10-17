"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from './AdminAuthProvider'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('AdminGuard: isAuthenticated =', isAuthenticated)
    if (!isAuthenticated) {
      console.log('AdminGuard: Redirecting to /admin/login')
      router.push('/admin/login')
    }
  }, [isAuthenticated, router])

  console.log('AdminGuard: Rendering, isAuthenticated =', isAuthenticated)

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return <>{children}</>
}
