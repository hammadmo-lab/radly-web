'use client'

import { ReactNode } from 'react'
import { BottomTabs } from '@/components/mobile/BottomTabs'
import { MobileHeader } from '@/components/mobile/MobileHeader'

interface MobileLayoutProps {
  children: ReactNode
  showHeader?: boolean
  headerTitle?: string
  headerBackHref?: string
}

/**
 * Mobile Layout Component
 *
 * Provides a native mobile app experience with:
 * - Top header with back button and title
 * - Main content area with safe area padding
 * - Bottom tab navigation
 * - Proper spacing for safe areas (notches on iOS)
 *
 * Usage:
 * ```tsx
 * <MobileLayout headerTitle="Reports">
 *   <ReportList />
 * </MobileLayout>
 * ```
 */
export function MobileLayout({
  children,
  showHeader = true,
  headerTitle,
  headerBackHref,
}: MobileLayoutProps) {
  return (
    <div className="mobile-layout flex flex-col h-screen bg-[var(--ds-bg-gradient)] text-white overflow-hidden">
      {/* Top Header */}
      {showHeader && (
        <MobileHeader
          title={headerTitle}
          backHref={headerBackHref}
        />
      )}

      {/* Main Content Area */}
      {/*
        - pb-24: Bottom padding for mobile (accounts for navigation + safe area)
        - sm:pb-12: Reduced padding on tablets/desktop
        - overflow-y-auto: Allow vertical scrolling
        - flex-1: Take remaining space
      */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden pb-24 sm:pb-12 mobile-smooth-scroll"
        style={{
          paddingBottom: `calc(80px + var(--safe-area-bottom))`,
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation - only on mobile */}
      <div className="hidden sm:block fixed bottom-0 left-0 right-0 bg-[var(--ds-bg-gradient)] border-t border-white/10">
        {/* Spacer for safe area on desktop - not needed since hidden */}
      </div>

      {/* Mobile Bottom Tabs */}
      <BottomTabs />
    </div>
  )
}

/**
 * Safe Area View Component
 *
 * Handles safe area insets for notches and rounded corners
 * Automatically adjusts padding based on device orientation
 */
export function SafeAreaView({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`safe-area-px ${className}`}
      style={{
        paddingLeft: 'max(var(--safe-area-left), 16px)',
        paddingRight: 'max(var(--safe-area-right), 16px)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Mobile Content Container
 *
 * Standard container for page content with proper spacing
 */
export function MobileContentContainer({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto w-full ${className}`}>
      {children}
    </div>
  )
}

