/**
 * Enhanced Empty State Component
 *
 * Displays helpful empty state UI with icon, title, description, and CTA.
 * Used when a list/section has no items to show.
 *
 * @example
 * ```tsx
 * <EnhancedEmptyState
 *   icon="reports"
 *   title="No reports yet"
 *   description="Your generated reports will appear here after generation completes."
 *   ctaText="Generate Your First Report"
 *   onCta={() => router.push('/app/templates')}
 * />
 * ```
 */

import React from 'react'
import { LucideIcon, FileText, BookTemplate, Search, Inbox, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EnhancedEmptyStateProps {
  /** Icon type or custom icon */
  icon?: 'reports' | 'templates' | 'search' | 'inbox' | 'error' | React.ComponentType<React.SVGProps<SVGSVGElement>>
  /** Main heading text */
  title: string
  /** Description text (optional) */
  description?: string
  /** CTA button text (optional) */
  ctaText?: string
  /** CTA button callback (optional) */
  onCta?: () => void
  /** CTA button variant */
  ctaVariant?: 'default' | 'outline' | 'destructive'
  /** Additional className */
  className?: string
}

const IconMap: Record<string, LucideIcon> = {
  reports: FileText,
  templates: BookTemplate,
  search: Search,
  inbox: Inbox,
  error: AlertCircle,
}

export function EnhancedEmptyState({
  icon = 'inbox',
  title,
  description,
  ctaText,
  onCta,
  ctaVariant = 'default',
  className,
}: EnhancedEmptyStateProps) {
  let IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>> | null = null

  if (typeof icon === 'string' && icon in IconMap) {
    IconComponent = IconMap[icon]
  } else if (typeof icon === 'function') {
    IconComponent = icon
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center space-y-6',
        className
      )}
    >
      {/* Icon */}
      {IconComponent && (
        <div className="w-16 h-16 rounded-full bg-[rgba(75,142,255,0.12)] border border-[rgba(75,142,255,0.25)] flex items-center justify-center">
          <IconComponent className="w-8 h-8 text-[#4B8EFF]" />
        </div>
      )}

      {/* Content */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm sm:text-base text-[rgba(207,207,207,0.65)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* CTA */}
      {ctaText && onCta && (
        <Button
          onClick={onCta}
          variant={ctaVariant}
          className="mt-4 min-h-[44px]"
        >
          {ctaText}
        </Button>
      )}
    </div>
  )
}
