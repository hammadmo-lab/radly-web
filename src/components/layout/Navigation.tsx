'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useSafeClickHandler } from '@/hooks/useButtonResponsiveness'
import { triggerHaptic } from '@/utils/haptics'
import {
  BookTemplate,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  Activity,
  Plus,
  FileText,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { NotificationCenter } from '@/components/layout/NotificationCenter'

interface NavLinkProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive?: boolean
}

const NavLink = ({ href, icon: Icon, label, isActive }: NavLinkProps) => {
  const handleNavClick = () => {
    triggerHaptic('light')
  }

  return (
    <Link
      href={href}
      onClick={handleNavClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-95",
        "min-h-[44px] touch-manipulation text-[rgba(207,207,207,0.7)] bg-[rgba(12,16,28,0.72)] hover:border-[rgba(212,180,131,0.32)] hover:bg-[rgba(212,180,131,0.12)] hover:text-white hover:shadow-[0_14px_30px_rgba(168,159,145,0.35)]",
        isActive &&
        "border-[rgba(212,180,131,0.45)] bg-[rgba(212,180,131,0.16)] text-white shadow-[0_18px_42px_rgba(168,159,145,0.4)]"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.7)] transition-colors",
          isActive && "border-[rgba(212,180,131,0.35)] bg-[rgba(212,180,131,0.2)] text-[#E8DCC8]"
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span>{label}</span>
    </Link>
  )
}

interface MobileNavProps {
  user?: { email?: string } | null
  onSignOut: () => void
}

export function MobileNav({ user, onSignOut }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated: isAdmin } = useAdminAuth()

  const handleMenuToggle = (open: boolean) => {
    setIsOpen(open)
    triggerHaptic('light')
  }

  const navItems = [
    { href: '/app/dashboard', icon: Activity, label: 'Dashboard' },
    { href: '/app/templates', icon: BookTemplate, label: 'Templates' },
    { href: '/app/reports', icon: FileText, label: 'Reports' },
  ]

  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({
      href: '/admin',
      icon: Shield,
      label: 'Admin',
    })
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden active:scale-95 transition-transform"
        onClick={() => handleMenuToggle(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile navigation overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 md:hidden"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Side panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative h-full w-80 max-w-[88vw] bg-[rgba(8,12,22,0.96)] border-r border-[rgba(212,180,131,0.25)] shadow-[0_30px_80px_rgba(10,14,24,0.75)] safe-area-inset-top"
          >
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] p-4 safe-area-pt">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#D4B483_0%,#E3C99E_60%,#B89666_100%)] shadow-[0_18px_42px_rgba(168,159,145,0.42)]">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm uppercase tracking-[0.24em] text-[rgba(207,207,207,0.45)]">
                    Radly
                  </span>
                  <span className="text-xl font-semibold text-white">Assistant</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMenuToggle(false)}
                aria-label="Close navigation menu"
                className="text-[rgba(207,207,207,0.7)] hover:text-white active:scale-95 transition-transform"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation items */}
            <nav className="space-y-3 p-4">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  onClick={() => handleMenuToggle(false)}
                >
                  <NavLink
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={pathname.startsWith(item.href)}
                  />
                </div>
              ))}
            </nav>

            {/* User info and sign out */}
            <div className="absolute inset-x-0 bottom-0 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(6,10,18,0.95)] p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.7)]">
                  <UserIcon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.email || 'test@radly.test'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  onSignOut()
                  setIsOpen(false)
                }}
                className="w-full justify-center rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.72)] text-[rgba(207,207,207,0.75)] hover:border-[rgba(255,107,107,0.35)] hover:bg-[rgba(255,107,107,0.16)] hover:text-[#FFD1D1]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

interface DesktopNavProps {
  user?: { email?: string } | null
  onSignOut: () => void
}

export function DesktopNav({ user, onSignOut }: DesktopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated: isAdmin } = useAdminAuth()

  const handleNewReport = useSafeClickHandler(() => {
    router.push('/app/templates')
  })

  const navItems = [
    { href: '/app/dashboard', icon: Activity, label: 'Dashboard' },
    { href: '/app/templates', icon: BookTemplate, label: 'Templates' },
    { href: '/app/reports', icon: FileText, label: 'Reports' },
  ]

  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({
      href: '/admin',
      icon: Shield,
      label: 'Admin',
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[rgba(26,21,16,0.85)] border-b border-[rgba(255,255,255,0.05)] shadow-[0_1px_2px_rgba(212,180,131,0.05)] safe-area-inset-top">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 safe-area-px">
        {/* Enhanced Logo with gradient and animation */}
        <Link href="/app/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#D4B483_0%,rgba(12,12,14,0)_65%)] rounded-xl blur-sm opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Logo container */}
            <div className="relative w-10 h-10 bg-[linear-gradient(135deg,rgba(212,180,131,0.9)0%,rgba(168,159,145,0.9)100%)] rounded-xl flex items-center justify-center shadow-[0_8px_24px_rgba(212,180,131,0.45)] overflow-hidden">
              <Image
                src="/radly-logo-icon.png"
                alt="Radly Logo"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gradient-brand">
              Radly
            </span>
            <span className="text-xs text-[var(--ds-text-muted)] hidden sm:block">
              Medical Reporting
            </span>
          </div>
        </Link>

        {/* Navigation Links with animated underline */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-lg transition-all duration-200",
                  "flex items-center gap-2 text-sm font-medium text-[var(--ds-text-secondary)]",
                  isActive
                    ? "text-[#D4B483] bg-[rgba(212,180,131,0.12)]"
                    : "hover:text-white hover:bg-[rgba(255,255,255,0.06)]"
                )}
              >
                <item.icon className={cn("w-4 h-4 text-[var(--ds-text-secondary)]", isActive && "text-[#D4B483]")} />
                <span>{item.label}</span>
                {/* Animated underline for active state */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4B483]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Menu and Actions */}
        <div className="flex items-center gap-3">
          {/* New Report Button */}
          <Button
            onClick={handleNewReport}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>

          <NotificationCenter />

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-10 px-3"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-medium">
                  {user?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/app/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onSignOut}
                className="text-error focus:text-error focus:bg-error/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

interface BottomNavProps {
  pathname: string
}

export function BottomNav({ pathname }: BottomNavProps) {
  const { isAuthenticated: isAdmin } = useAdminAuth()

  const navItems = [
    { href: '/app/dashboard', icon: Activity, label: 'Home' },
    { href: '/app/templates', icon: BookTemplate, label: 'Templates' },
    { href: '/app/reports', icon: FileText, label: 'Reports' },
  ]

  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({
      href: '/admin',
      icon: Shield,
      label: 'Admin',
    })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-[rgba(12,12,14,0.94)] backdrop-blur-lg border-t border-[rgba(255,255,255,0.06)] z-40 safe-area-inset-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.45)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const handleNavClick = () => {
            triggerHaptic('light')
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative group active:opacity-75 transition-opacity"
            >
              {/* Top indicator for active state */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#D4B483] rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Icon container with scale animation and minimum touch target */}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "p-3 rounded-xl transition-all duration-200",
                  "min-w-[44px] min-h-[44px] flex items-center justify-center",
                  isActive
                    ? "bg-[rgba(212,180,131,0.16)]"
                    : "group-active:bg-[rgba(255,255,255,0.08)]"
                )}
              >
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-[#D4B483]" : "text-[rgba(207,207,207,0.7)]"
                  )}
                />
              </motion.div>

              {/* Label */}
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive
                  ? "text-[#D4B483]"
                  : "text-[rgba(207,207,207,0.7)]"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
