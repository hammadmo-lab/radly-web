'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ReactNode } from 'react'
import {
  Home,
  FileText,
  Plus,
  User,
  Settings,
} from 'lucide-react'

/**
 * Tab Definition
 */
interface Tab {
  id: string
  label: string
  href: string
  icon: ReactNode
  isActive?: (pathname: string) => boolean
}

/**
 * Default Navigation Tabs
 *
 * Customize by passing different tabs array to BottomTabs component
 */
const DEFAULT_TABS: Tab[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/app/dashboard',
    icon: <Home className="w-6 h-6" />,
    isActive: (pathname) => pathname === '/app/dashboard' || pathname === '/app',
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/app/reports',
    icon: <FileText className="w-6 h-6" />,
    isActive: (pathname) => pathname.startsWith('/app/reports'),
  },
  {
    id: 'generate',
    label: 'Generate',
    href: '/app/generate',
    icon: <Plus className="w-6 h-6" />,
    isActive: (pathname) => pathname === '/app/generate',
  },
  {
    id: 'account',
    label: 'Account',
    href: '/app/account',
    icon: <User className="w-6 h-6" />,
    isActive: (pathname) => pathname === '/app/account',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/app/settings',
    icon: <Settings className="w-6 h-6" />,
    isActive: (pathname) => pathname === '/app/settings',
  },
]

interface BottomTabsProps {
  tabs?: Tab[]
  className?: string
}

/**
 * Bottom Navigation Tabs Component
 *
 * Native mobile-style bottom tab navigation.
 * Features:
 * - 4-5 tabs at the bottom of the screen
 * - Icons + labels
 * - Active tab highlighting
 * - Safe area padding on iOS
 * - Touch-friendly (44pt minimum targets)
 * - Fixed positioning
 *
 * Usage:
 * ```tsx
 * // Use default tabs
 * <BottomTabs />
 *
 * // Use custom tabs
 * <BottomTabs tabs={customTabs} />
 * ```
 */
export function BottomTabs({ tabs = DEFAULT_TABS, className = '' }: BottomTabsProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Fixed Bottom Navigation - only on mobile */}
      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-[var(--ds-bg-gradient)] border-t border-white/10
          hidden sm:block sm:h-0 sm:opacity-0 sm:pointer-events-none
          ${className}
        `}
        style={{
          paddingBottom: 'var(--safe-area-bottom)',
        }}
        aria-label="Mobile navigation"
      >
        {/* Tab List */}
        <div className="flex h-20 items-center justify-around">
          {tabs.map((tab) => {
            const isActive = tab.isActive ? tab.isActive(pathname) : pathname === tab.href

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
                  flex flex-col items-center justify-center
                  w-16 h-20 min-h-[44px] min-w-[44px]
                  gap-1 transition-colors touch-manipulation
                  ${
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/80'
                  }
                `}
                aria-label={tab.label}
                title={tab.label}
              >
                {/* Icon */}
                <div className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {tab.icon}
                </div>

                {/* Label */}
                <span className="text-xs font-medium truncate w-full text-center">
                  {tab.label}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Safe Area Overlay (bottom padding for notch) */}
      <div
        className="hidden sm:block sm:h-0 fixed bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 'var(--safe-area-bottom)',
        }}
      />
    </>
  )
}

/**
 * Mobile Bottom Tabs for Web/Desktop
 *
 * This component is hidden on desktop (sm:hidden) so web layout doesn't show it.
 * The desktop layout uses top navigation instead.
 *
 * The `hidden sm:block sm:h-0 sm:opacity-0` classes ensure:
 * - Mobile: Block, visible, full height
 * - Desktop (sm+): Hidden from display
 */
