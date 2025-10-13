'use client'
import { motion } from 'framer-motion'
import { Plus, BookTemplate, FileText, BarChart3, Settings, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  type: 'templates' | 'reports' | 'settings' | 'search'
  title?: string
  description?: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

const emptyStateConfig = {
  templates: {
    icon: BookTemplate,
    title: "No templates yet",
    description: "Templates help you generate consistent, professional reports quickly. Create your first template to get started.",
    action: {
      label: "Create your first template",
      href: "/app/templates/new"
    }
  },
  reports: {
    icon: FileText,
    title: "No reports generated",
    description: "Generate your first medical report using one of your templates. Reports are automatically saved and can be exported.",
    action: {
      label: "Generate report",
      href: "/app/generate"
    }
  },
  settings: {
    icon: Settings,
    title: "Settings",
    description: "Configure your account preferences, default templates, and notification settings.",
    action: {
      label: "Configure settings",
      href: "/app/settings"
    }
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or filters to find what you're looking for.",
    action: {
      label: "Clear search",
      href: "#"
    }
  }
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center py-16 px-4 ${className || ''}`}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6"
      >
        <Icon className="w-8 h-8 text-muted-foreground" />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-md"
      >
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {title || config.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {description || config.description}
        </p>
        
        {/* Action Button */}
        {(action || config.action) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button asChild size="lg" className="min-h-[44px] px-6">
              <Link href={action?.href || config.action.href}>
                <Plus className="w-4 h-4 mr-2" />
                {action?.label || config.action.label}
              </Link>
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.5 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
      </motion.div>
    </motion.div>
  )
}

// Specialized empty states for specific contexts
export function TemplatesEmptyState() {
  return (
    <Card className="border-dashed border-2 border-muted">
      <CardContent className="p-8">
        <EmptyState type="templates" />
      </CardContent>
    </Card>
  )
}

export function ReportsEmptyState() {
  return (
    <Card className="border-dashed border-2 border-muted">
      <CardContent className="p-8">
        <EmptyState type="reports" />
      </CardContent>
    </Card>
  )
}

export function SearchEmptyState({ query }: { query?: string }) {
  return (
    <div className="py-12">
      <EmptyState 
        type="search"
        title={query ? `No results for "${query}"` : "No results found"}
        description={query 
          ? `We couldn't find anything matching "${query}". Try different keywords or check your spelling.`
          : "Try adjusting your search terms or filters to find what you're looking for."
        }
      />
    </div>
  )
}
