"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateCard } from '@/components/features/templates/TemplateCard'
import { TemplateFilters } from '@/components/features/templates/TemplateFilters'
import { TemplateCardSkeleton } from '@/components/loading/TemplateCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { fetchTemplates } from '@/lib/templates'
import { httpGet } from '@/lib/http'

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  const [filters, setFilters] = useState({
    searchQuery: '',
    modality: undefined as string | undefined,
    bodySystem: undefined as string | undefined,
  })

  const handleFilterChange = (newFilters: {
    searchQuery: string
    modality?: string | undefined
    bodySystem?: string | undefined
  }) => {
    setFilters({
      searchQuery: newFilters.searchQuery,
      modality: newFilters.modality,
      bodySystem: newFilters.bodySystem,
    })
  }
  const router = useRouter()

  const { data: templates, isLoading, error, refetch } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      try {
        const items = await fetchTemplates(httpGet)
        return items
      } catch (err) {
        console.error('Failed to fetch templates:', err)
        throw err
      }
    },
  })

  // Filter templates based on search and filters
  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = !filters.searchQuery || 
      template.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      template.modality?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      template.anatomy?.toLowerCase().includes(filters.searchQuery.toLowerCase())
    
    const matchesModality = !filters.modality || 
      template.modality?.toLowerCase() === filters.modality.toLowerCase()
    
    const matchesBodySystem = !filters.bodySystem || 
      template.anatomy?.toLowerCase() === filters.bodySystem.toLowerCase()
    
    return matchesSearch && matchesModality && matchesBodySystem
  })

  if (error) {
    return (
      <div className="space-y-8 pb-24 md:pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Choose from our collection of medical report templates
            </p>
          </div>
        </div>
        
        <EmptyState
          type="error"
          title="Couldn't load templates"
          description="There was an error loading the templates. Please try again."
          action={{
            label: "Retry",
            onClick: () => refetch()
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select a template to generate your medical report
          </p>
        </div>
        <Button 
          size="lg"
          className="shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => router.push('/app/generate')}
        >
          <Plus className="w-5 h-5 mr-2" />
          New Report
        </Button>
      </div>

      {/* Filters */}
      <TemplateFilters onFilterChange={handleFilterChange} />

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <TemplateCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={{
                template_id: template.id,
                title: template.title,
                modality: template.modality || undefined,
                body_system: template.anatomy || undefined,
                description: undefined, // template.description doesn't exist on TemplateListItem
                updated_at: template.updatedAt || undefined
              }} 
            />
          ))}
        </div>
      ) : (
        <EmptyState
          type="search"
          title="No templates found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      )}
    </div>
  )
}
