"use client"

import { useAuth } from '@/components/auth-provider'
import { AuthGuard } from '@/components/auth-guard'
import { DesktopNav, MobileNav, BottomNav } from '@/components/layout/Navigation'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { isTestMode } from '@/lib/test-mode'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const testMode = isTestMode()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')

      window.location.assign('/')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-[var(--ds-text-primary)] overflow-x-hidden safe-area-inset-top">
        {/* Test Mode Indicator */}
        {testMode && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 text-center text-sm text-yellow-200">
            🧪 Test Mode Active
          </div>
        )}

        {/* Header */}
        <DesktopNav user={testMode ? { email: 'test@radly.test' } : user} onSignOut={handleSignOut} />

        {/* Mobile Navigation */}
        <MobileNav user={testMode ? { email: 'test@radly.test' } : user} onSignOut={handleSignOut} />

        {/* Main Content */}
        <main className="container max-w-6xl mx-auto px-4 sm:px-6 neon-page-stack w-full py-8 sm:py-12 pb-24 md:pb-12">
          <div className="neon-shell p-6 sm:p-8 md:p-10 md:backdrop-blur-lg">
            {children}
          </div>
        </main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav pathname={pathname} />
      </div>
    </AuthGuard>
  )
}
