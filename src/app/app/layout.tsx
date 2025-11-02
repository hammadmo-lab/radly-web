"use client"

import { useAuth } from '@/components/auth-provider'
import { AuthGuard } from '@/components/auth-guard'
import { DesktopNav, MobileNav, BottomNav } from '@/components/layout/Navigation'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { isTestMode } from '@/lib/test-mode'
import { Capacitor } from '@capacitor/core'
import { useState, useEffect } from 'react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const testMode = isTestMode()
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    // Detect Capacitor native at runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (typeof window !== 'undefined' ? (window as any).Capacitor : undefined)
    setIsNative(!!cap?.isNativePlatform?.())
  }, [])

  // Check if we're on the dashboard page in native mode
  const isNativeDashboard = isNative && pathname === '/app/dashboard'

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')

      // On native platforms, use Next.js router to stay in the app
      // On web, use full page navigation to clear session state
      if (Capacitor.isNativePlatform()) {
        router.push('/auth/signin')
      } else {
        window.location.assign('/')
      }
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-[var(--ds-text-primary)] overflow-x-hidden">
        {/* Test Mode Indicator */}
        {testMode && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 text-center text-sm text-yellow-200">
            🧪 Test Mode Active
          </div>
        )}

        {/* Header - Only show if not native dashboard */}
        {!isNativeDashboard && (
          <DesktopNav user={testMode ? { email: 'test@radly.test' } : user} onSignOut={handleSignOut} />
        )}

        {/* Mobile Navigation - Only show if not native dashboard */}
        {!isNativeDashboard && (
          <MobileNav user={testMode ? { email: 'test@radly.test' } : user} onSignOut={handleSignOut} />
        )}

        {/* Main Content - Adjust padding for native dashboard */}
        <main className={`container max-w-6xl mx-auto px-4 sm:px-6 neon-page-stack w-full ${
          isNativeDashboard ? 'py-0' : 'py-8 sm:py-12 pb-24 md:pb-12'
        }`}>
          <div className={`${isNativeDashboard ? '' : 'neon-shell p-6 sm:p-8 md:p-10 backdrop-blur-lg'}`}>
            {children}
          </div>
        </main>

        {/* Bottom Navigation for Mobile - Only show if not native dashboard */}
        {!isNativeDashboard && <BottomNav pathname={pathname} />}
      </div>
    </AuthGuard>
  )
}
