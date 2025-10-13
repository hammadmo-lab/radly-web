'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookTemplate, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
                  <User className="w-4 h-4 text-muted-foreground" />
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

  const navItems = [
    { href: '/app/templates', icon: BookTemplate, label: 'Templates' },
    { href: '/app/reports', icon: BarChart3, label: 'Reports' },
    { href: '/app/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="hidden md:flex items-center justify-between w-full">
      {/* Logo */}
      <Link href="/app/templates" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <BookTemplate className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-primary">Radly</span>
      </Link>

      {/* Navigation */}
      <nav className="flex space-x-6">
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
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          {user?.email || 'test@radly.test'}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onSignOut}
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
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
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border z-40">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] justify-center",
                "hover:bg-accent/10",
                isActive && "bg-accent/10 text-accent"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-accent")} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 w-8 h-1 bg-accent rounded-t-full -translate-x-1/2"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
