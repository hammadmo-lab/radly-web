"use client"

import { useAuth } from '@/components/auth-provider'
import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { FileText, Settings, LogOut, BookTemplate, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { isTestMode } from '@/lib/test-mode'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const testMode = isTestMode()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Test Mode Indicator */}
        {testMode && (
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
            🧪 Test Mode Active
          </div>
        )}
        
        {/* Header */}
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link href="/app/templates" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-primary">Radly</span>
                </Link>

                <nav className="hidden md:flex space-x-6">
                  <Link
                    href="/app/templates"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <BookTemplate className="w-4 h-4" />
                    <span>Templates</span>
                  </Link>
                  <Link
                    href="/app/reports"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Reports</span>
                  </Link>
                  <Link
                    href="/app/settings"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {testMode ? 'test@radly.test' : user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
