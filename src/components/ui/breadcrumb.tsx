import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link
        href="/app/dashboard"
        className="flex items-center justify-center hover:text-foreground transition-colors"
        aria-label="Go to dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors whitespace-nowrap leading-none flex items-center"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`whitespace-nowrap leading-none flex items-center ${isLast ? 'text-foreground font-medium' : ''}`} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
