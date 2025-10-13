'use client'

import { FileText, Search, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  type: 'search' | 'error' | 'loading' | 'empty'
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-12 h-12 text-muted-foreground" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-error" />
      case 'loading':
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />
      case 'empty':
      default:
        return <FileText className="w-12 h-12 text-muted-foreground" />
    }
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center",
      className
    )}>
      <div className="mb-6">
        {getIcon()}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  )
}