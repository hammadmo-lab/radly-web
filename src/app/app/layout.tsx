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
      window.location.href = 'https://radly.app'
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        {/* Test Mode Indicator */}
        {testMode && (
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
            🧪 Test Mode Active
          </div>
        )}
        
        {/* Header */}
        <DesktopNav user={testMode ? { email: 'test@radly.test' } : user} onSignOut={handleSignOut} />
        
        {/* Mobile Navigation */}
        <MobileNav user={testMode ? { email: 'test@radly.test' } : user} onSignOut={handleSignOut} />

        {/* Main Content */}
        <main className="container max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
          {children}
        </main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav pathname={pathname} />
      </div>
    </AuthGuard>
  )
}
