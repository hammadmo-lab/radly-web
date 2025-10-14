'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Keyboard
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
  category: 'navigation' | 'actions' | 'forms' | 'general'
}

interface KeyboardShortcutsProps {
  onClose: () => void
}

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'G + H',
      description: 'Go to Home',
      action: () => router.push('/app/dashboard'),
      category: 'navigation'
    },
    {
      key: 'G + T',
      description: 'Go to Templates',
      action: () => router.push('/app/templates'),
      category: 'navigation'
    },
    {
      key: 'G + R',
      description: 'Go to Reports',
      action: () => router.push('/app/reports'),
      category: 'navigation'
    },
    {
      key: 'G + S',
      description: 'Go to Settings',
      action: () => router.push('/app/settings'),
      category: 'navigation'
    },
    {
      key: '←',
      description: 'Go Back',
      action: () => router.back(),
      category: 'navigation'
    },
    {
      key: '→',
      description: 'Go Forward',
      action: () => window.history.forward(),
      category: 'navigation'
    },

    // Actions
    {
      key: 'N',
      description: 'New Report',
      action: () => router.push('/app/generate'),
      category: 'actions'
    },
    {
      key: 'S',
      description: 'Search',
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement
        searchInput?.focus()
      },
      category: 'actions'
    },
    {
      key: 'E',
      description: 'Export Report',
      action: () => {
        const exportButton = document.querySelector('[data-testid="export-button"]') as HTMLButtonElement
        exportButton?.click()
      },
      category: 'actions'
    },

    // Forms
    {
      key: 'Tab',
      description: 'Next Field',
      action: () => {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement) {
          const nextElement = activeElement.nextElementSibling as HTMLElement
          nextElement?.focus()
        }
      },
      category: 'forms'
    },
    {
      key: 'Shift + Tab',
      description: 'Previous Field',
      action: () => {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement) {
          const prevElement = activeElement.previousElementSibling as HTMLElement
          prevElement?.focus()
        }
      },
      category: 'forms'
    },
    {
      key: 'Enter',
      description: 'Submit Form',
      action: () => {
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
        submitButton?.click()
      },
      category: 'forms'
    },

    // General
    {
      key: 'Esc',
      description: 'Close Modal/Dialog',
      action: () => {
        const modal = document.querySelector('[role="dialog"]') as HTMLElement
        const closeButton = modal?.querySelector('[aria-label*="close" i], [aria-label*="Close" i]') as HTMLButtonElement
        closeButton?.click()
      },
      category: 'general'
    },
    {
      key: '?',
      description: 'Show Shortcuts',
      action: () => {}, // This will be handled by the parent
      category: 'general'
    }
  ]

  const categories = {
    navigation: shortcuts.filter(s => s.category === 'navigation'),
    actions: shortcuts.filter(s => s.category === 'actions'),
    forms: shortcuts.filter(s => s.category === 'forms'),
    general: shortcuts.filter(s => s.category === 'general')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(categories).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {category}
                </h3>
                <div className="grid gap-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Hook for managing keyboard shortcuts
export function useKeyboardShortcuts() {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const key = e.key.toLowerCase()
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      // Global shortcuts
      if (key === '?' && !isCtrlOrCmd && !isShift) {
        e.preventDefault()
        setShowShortcuts(true)
        return
      }

      if (key === 'escape') {
        setShowShortcuts(false)
        return
      }

      // Navigation shortcuts
      if (isCtrlOrCmd && key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement
        searchInput?.focus()
        return
      }

      if (isCtrlOrCmd && key === 'n') {
        e.preventDefault()
        router.push('/app/generate')
        return
      }

      // Single key shortcuts (only when not in input)
      if (!isCtrlOrCmd && !isShift) {
        switch (key) {
          case 'h':
            router.push('/app/dashboard')
            break
          case 't':
            router.push('/app/templates')
            break
          case 'r':
            router.push('/app/reports')
            break
          case 's':
            router.push('/app/settings')
            break
          case 'n':
            router.push('/app/generate')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return {
    showShortcuts,
    setShowShortcuts
  }
}

// ARIA Live Region Component
interface AriaLiveRegionProps {
  message: string
  priority?: 'polite' | 'assertive'
  className?: string
}

export function AriaLiveRegion({ message, priority = 'polite', className }: AriaLiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className || ''}`}
    >
      {message}
    </div>
  )
}

// Focus Management Hook
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null)

  const setFocus = (element: HTMLElement | null) => {
    focusRef.current = element
  }

  const focusElement = () => {
    if (focusRef.current) {
      focusRef.current.focus()
    }
  }

  const focusFirstFocusable = (container?: HTMLElement) => {
    const target = container || document.body
    const focusableElements = target.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    firstElement?.focus()
  }

  const focusLastFocusable = (container?: HTMLElement) => {
    const target = container || document.body
    const focusableElements = target.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    lastElement?.focus()
  }

  return {
    setFocus,
    focusElement,
    focusFirstFocusable,
    focusLastFocusable
  }
}

// Skip Link Component
interface SkipLinkProps {
  href: string
  children: React.ReactNode
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
    >
      {children}
    </a>
  )
}

// Screen Reader Only Text
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// Keyboard Shortcuts Button Component
interface KeyboardShortcutsButtonProps {
  className?: string
}

export function KeyboardShortcutsButton({ className }: KeyboardShortcutsButtonProps) {
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts()

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowShortcuts(true)}
        className={className}
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4 mr-2" />
        Shortcuts
      </Button>

      <AnimatePresence>
        {showShortcuts && (
          <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
