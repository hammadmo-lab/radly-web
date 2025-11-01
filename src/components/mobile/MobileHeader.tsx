'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

interface MobileHeaderProps {
  title?: string | ReactNode
  backHref?: string
  rightAction?: ReactNode
  onBackClick?: () => void
  className?: string
}

/**
 * Mobile Header Component
 *
 * Fixed header for mobile screens with:
 * - Back button (navigates to previous screen or specified href)
 * - Title/heading
 * - Optional right action button
 * - Safe area padding for notches
 *
 * Usage:
 * ```tsx
 * <MobileHeader
 *   title="Reports"
 *   backHref="/app/dashboard"
 *   rightAction={<SettingsButton />}
 * />
 * ```
 */
export function MobileHeader({
  title,
  backHref,
  rightAction,
  onBackClick,
  className = '',
}: MobileHeaderProps) {
  const showBackButton = backHref || onBackClick

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-40
        bg-[var(--ds-bg-gradient)] border-b border-white/10
        ${className}
      `}
      style={{
        paddingTop: 'var(--safe-area-top)',
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Back Button or Spacer */}
        <div className="flex-shrink-0 w-10">
          {showBackButton ? (
            backHref ? (
              <Link
                href={backHref}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation"
                aria-label="Go back"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
            ) : (
              <button
                onClick={onBackClick}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation"
                aria-label="Go back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )
          ) : null}
        </div>

        {/* Title */}
        {title && (
          <div className="flex-1 text-center px-4">
            {typeof title === 'string' ? (
              <h1 className="text-lg font-semibold truncate">{title}</h1>
            ) : (
              title
            )}
          </div>
        )}

        {/* Right Action or Spacer */}
        <div className="flex-shrink-0 w-10">
          {rightAction ? rightAction : null}
        </div>
      </div>
    </header>
  )
}

/**
 * Header Spacer Component
 *
 * Add this after MobileHeader to create space for fixed header
 * Use when MobileLayout is not being used
 */
export function MobileHeaderSpacer() {
  return (
    <div
      className="h-16"
      style={{
        paddingTop: 'var(--safe-area-top)',
      }}
    />
  )
}
