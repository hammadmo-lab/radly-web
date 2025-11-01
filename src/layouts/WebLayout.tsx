'use client'

import { ReactNode } from 'react'

interface WebLayoutProps {
  children: ReactNode
}

/**
 * Web Layout Component
 *
 * Provides the desktop/web experience with:
 * - Top navigation (handled by existing Navigation component)
 * - Full-width content area
 * - Desktop-optimized spacing
 * - No bottom navigation (top nav handles navigation)
 *
 * Usage:
 * ```tsx
 * <WebLayout>
 *   <Dashboard />
 * </WebLayout>
 * ```
 */
export function WebLayout({ children }: WebLayoutProps) {
  return (
    <div className="web-layout min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      {/* Main Content Area - full height, no bottom padding needed */}
      <main className="overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}

/**
 * Web Content Container
 *
 * Standard container for page content with proper spacing for desktop
 */
export function WebContentContainer({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-6xl mx-auto w-full ${className}`}>
      {children}
    </div>
  )
}
