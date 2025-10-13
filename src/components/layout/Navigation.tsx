'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookTemplate, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Bell,
  ChevronDown
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

interface NavLinkProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive?: boolean
}

const NavLink = ({ href, icon: Icon, label, isActive }: NavLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
        "hover:bg-accent/10 hover:text-accent",
        isActive && "bg-accent/10 text-accent font-medium border-l-2 border-accent"
      )}
    >
      <Icon className={cn("w-4 h-4", isActive && "text-accent")} />
      <span className="hidden sm:inline">{label}</span>
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

  const navItems = [
    { href: '/app/templates', icon: BookTemplate, label: 'Templates' },
    { href: '/app/reports', icon: BarChart3, label: 'Reports' },
    { href: '/app/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
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
            className="relative w-80 max-w-[85vw] h-full bg-card border-r shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookTemplate className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary">Radly</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation items */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname.startsWith(item.href)}
                />
              ))}
            </nav>

            {/* User info and sign out */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.email || 'test@radly.test'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  onSignOut()
                  setIsOpen(false)
                }}
                className="w-full"
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

  const navItems = [
    { href: '/app/templates', icon: BookTemplate, label: 'Templates' },
    { href: '/app/reports', icon: BarChart3, label: 'Reports' },
    { href: '/app/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Enhanced Logo with gradient and animation */}
        <Link href="/app/templates" className="flex items-center gap-3 group">
          <div className="relative">
            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Logo container */}
            <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <BookTemplate className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gradient">
              Radly
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">
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
                  "flex items-center gap-2 text-sm font-medium",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {/* Animated underline for active state */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Menu and Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell (placeholder) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hidden sm:flex"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </Button>

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
  const navItems = [
    { href: '/app/templates', icon: BookTemplate, label: 'Templates' },
    { href: '/app/reports', icon: BarChart3, label: 'Reports' },
    { href: '/app/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50 z-40 safe-area-inset-bottom shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative group"
            >
              {/* Top indicator for active state */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {/* Icon container with scale animation */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary/10" 
                    : "group-active:bg-gray-100 dark:group-active:bg-gray-800"
                )}
              >
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
                  )} 
                />
              </motion.div>
              
              {/* Label */}
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-gray-500 dark:text-gray-400"
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
