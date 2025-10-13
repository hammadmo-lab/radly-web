'use client'

import { ReactNode } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { LucideIcon } from 'lucide-react'

interface CollapsibleFormSectionProps {
  id: string
  title: string
  description: string
  icon: LucideIcon
  children: ReactNode
  defaultOpen?: boolean
}

export function CollapsibleFormSection({
  id,
  title,
  description,
  icon: Icon,
  children,
  defaultOpen = false,
}: CollapsibleFormSectionProps) {
  return (
    <Accordion 
      type="single" 
      collapsible 
      defaultValue={defaultOpen ? id : undefined}
    >
      <AccordionItem 
        value={id} 
        className="border-2 border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
      >
        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors [&[data-state=open]]:bg-gray-50 dark:[&[data-state=open]]:bg-gray-800/50">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2">
          <div className="space-y-4">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
