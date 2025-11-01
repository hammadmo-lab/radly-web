"use client"

import { useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { AuthGuard } from '@/components/auth-guard'
import { DesktopNav, MobileNav, BottomNav } from '@/components/layout/Navigation'
import { NotificationHandler } from '@/components/notifications/NotificationHandler'
import { NotificationPermissionPrompt } from '@/components/notifications/NotificationPermissionPrompt'
import { SupabaseProvider } from '@/providers/supabase-provider'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { isTestMode } from '@/lib/test-mode'
import { useRevenueCatInit } from '@/hooks/useRevenueCat'
import { initializeSocialLogin } from '@/lib/native-auth'
import { useIsNativeApp } from '@/hooks/usePlatform'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const testMode = isTestMode()
  const isNative = useIsNativeApp()

  // Initialize social login for mobile native authentication
  useEffect(() => {
    if (!isNative) return

    initializeSocialLogin().catch(error => {
      console.error('Failed to initialize social login:', error)
    })
  }, [isNative])

  // Initialize RevenueCat for mobile IAP
  const { isInitialized, error: revenueCatError } = useRevenueCatInit(user?.id)

  // Log RevenueCat initialization status
  if (revenueCatError) {
    console.error('[AppLayout] RevenueCat initialization error:', revenueCatError)
  } else if (isInitialized) {
    console.log('[AppLayout] RevenueCat initialized successfully')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      window.location.href = 'https://radly.app'
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <SupabaseProvider>
      <AuthGuard>
        <div
          className={
            isNative
              ? 'min-h-screen bg-[#0A0E1A] text-white overflow-x-hidden'
              : 'min-h-screen bg-[var(--ds-bg-gradient)] text-[var(--ds-text-primary)] overflow-x-hidden'
          }
        >
          {/* Test Mode Indicator */}
          {testMode && (
            <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 text-center text-sm text-yellow-200">
              🧪 Test Mode Active
            </div>
          )}

          {/* Header */}
          {!isNative && (
            <>
              <DesktopNav
                user={testMode ? { email: 'test@radly.test' } : user}
                onSignOut={handleSignOut}
              />

              {/* Mobile Navigation */}
              <MobileNav
                user={testMode ? { email: 'test@radly.test' } : user}
                onSignOut={handleSignOut}
              />
            </>
          )}

          {/* Main Content */}
          <main
            className={
              isNative
                ? 'flex min-h-screen w-screen flex-col bg-[#0A0E1A] overflow-hidden'
                : 'container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 md:pb-12 neon-page-stack w-full'
            }
            style={isNative ? { minHeight: '100dvh' } : {}}
          >
            {isNative ? (
              children
            ) : (
              <div className="neon-shell p-6 sm:p-8 md:p-10 backdrop-blur-lg">
                {children}
              </div>
            )}
          </main>

          {/* Bottom Navigation for Mobile */}
          {!isNative && <BottomNav pathname={pathname} />}

          {/* Push Notification Handler (Native Apps Only) */}
          <NotificationHandler autoRegister={true} showInAppNotifications={true} />

          {/* Notification Permission Prompt (Native Apps Only) */}
          <NotificationPermissionPrompt
            onPermissionGranted={(fcmToken) => {
              console.log('Notification permission granted:', fcmToken)
            }}
            onPermissionDenied={() => {
              console.log('Notification permission denied')
            }}
          />
        </div>
      </AuthGuard>
    </SupabaseProvider>
  )
}
