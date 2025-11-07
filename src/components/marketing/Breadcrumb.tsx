'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  url: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  // Build BreadcrumbList JSON-LD schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      'item': `https://radly.app${item.url}`
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav
        aria-label="breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-[rgba(207,207,207,0.72)]"
      >
        {items.map((item, index) => (
          <div key={item.url} className="flex items-center gap-2">
            <Link
              href={item.url}
              className="text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline transition-colors"
            >
              {item.label}
            </Link>
            {index < items.length - 1 && (
              <ChevronRight className="h-4 w-4 text-[rgba(207,207,207,0.45)]" aria-hidden />
            )}
          </div>
        ))}
      </nav>
    </>
  )
}
