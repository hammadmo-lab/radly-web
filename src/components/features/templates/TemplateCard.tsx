'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { FileText, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TemplateCardProps {
  template: {
    template_id: string
    title: string
    name?: string
    modality?: string
    body_system?: string
    description?: string
    updated_at?: string
  }
}

export const TemplateCard = memo(function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter()
  const templateName = template.title || template.name || 'Untitled Template'
  const updatedDate = template.updated_at 
    ? formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })
    : 'Recently updated'

  const handleUseTemplate = () => {
    router.push(`/app/generate?templateId=${template.template_id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Badges */}
              {(template.modality || template.body_system) && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {template.modality && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
                    >
                      {template.modality}
                    </Badge>
                  )}
                  {template.body_system && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {template.body_system}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Title */}
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2">
                {templateName}
              </CardTitle>
            </div>
            
            {/* Icon */}
            <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          {/* Description */}
          {template.description && (
            <CardDescription className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {template.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="relative">
          <div className="flex items-center justify-between gap-4">
            {/* Update timestamp */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{updatedDate}</span>
            </div>
            
            {/* Action button */}
            <Button 
              size="sm" 
              onClick={handleUseTemplate}
              className="group-hover:bg-primary group-hover:text-white transition-all shadow-md group-hover:shadow-lg"
            >
              Use Template
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
