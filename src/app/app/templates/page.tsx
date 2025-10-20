'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter, ChevronDown, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { httpGet } from '@/lib/http'
import { fetchTemplates } from '@/lib/templates'
import { TemplateCardSkeleton } from '@/components/loading/TemplateCardSkeleton'
import { CustomizeTemplateModal } from '@/components/features/CustomizeTemplateModal'

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModality, setSelectedModality] = useState<string | null>(null)
  const [selectedAnatomy, setSelectedAnatomy] = useState<string | null>(null)
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string } | null>(null)

  // Clear selected anatomy when modality changes
  const handleModalityChange = (modality: string | null) => {
    setSelectedModality(modality)
    // Clear anatomy selection if it's not available for the new modality
    if (modality && selectedAnatomy) {
      const availableAnatomies = templates?.filter(t => t.modality === modality).map(t => t.anatomy) || []
      if (!availableAnatomies.includes(selectedAnatomy)) {
        setSelectedAnatomy(null)
      }
    }
  }

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => await fetchTemplates(httpGet),
  })

  // Get unique modalities and anatomies for filter options
  const { modalities, anatomies } = useMemo(() => {
    if (!templates) return { modalities: [], anatomies: [] }
    
    const modalitySet = new Set<string>()
    const anatomySet = new Set<string>()
    
    templates.forEach(template => {
      if (template.modality) modalitySet.add(template.modality)
      // Only add anatomy if no modality is selected, or if it matches the selected modality
      if (template.anatomy && (!selectedModality || template.modality === selectedModality)) {
        anatomySet.add(template.anatomy)
      }
    })
    
    return {
      modalities: Array.from(modalitySet).sort(),
      anatomies: Array.from(anatomySet).sort()
    }
  }, [templates, selectedModality])

  // Filter templates based on search query and selected filters
  const filteredTemplates = useMemo(() => {
    if (!templates) return []
    
    return templates.filter(template => {
      // Search filter
      const searchMatch = !searchQuery || 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.modality && template.modality.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (template.anatomy && template.anatomy.toLowerCase().includes(searchQuery.toLowerCase()))
      
      // Modality filter
      const modalityMatch = !selectedModality || template.modality === selectedModality
      
      // Anatomy filter
      const anatomyMatch = !selectedAnatomy || template.anatomy === selectedAnatomy
      
      return searchMatch && modalityMatch && anatomyMatch
    })
  }, [templates, searchQuery, selectedModality, selectedAnatomy])

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* HEADER - BOLD AND READABLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Templates
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Select a template to generate your medical report
            </p>
          </div>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-6 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Report
          </Button>
        </div>

        {/* CUSTOM INSTRUCTIONS BANNER */}
        <div className="bg-gradient-to-r from-orange-50 to-purple-50 border-2 border-orange-300 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                💡 Save Time with Custom Instructions
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Click the <span className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-white border border-gray-300 rounded">
                  <Settings className="w-3 h-3 text-gray-600" />
                </span> <span className="font-semibold">Settings</span> icon on any template to add your preferences (like &quot;always mention lymphadenopathy&quot;). Radly will remember them forever and apply them to every report you generate with that template!
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR - WHITE BACKGROUND, NOT DARK! */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm">
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search templates by name, modality, or body system..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 sm:h-14 text-base border-2 border-gray-200 rounded-xl focus:border-emerald-500 bg-white text-gray-900"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`border-2 h-11 rounded-lg hover:border-emerald-500 w-full sm:w-auto ${
                    selectedModality ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Modality
                  {selectedModality && (
                    <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                      {selectedModality}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => handleModalityChange(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filter
                </DropdownMenuItem>
                {modalities.map((modality) => (
                  <DropdownMenuItem 
                    key={modality}
                    onClick={() => handleModalityChange(modality)}
                    className={selectedModality === modality ? 'bg-emerald-50' : ''}
                  >
                    {modality}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`border-2 h-11 rounded-lg hover:border-emerald-500 w-full sm:w-auto ${
                    selectedAnatomy ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  } ${!selectedModality ? 'opacity-60' : ''}`}
                  disabled={!selectedModality}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Body System
                  {!selectedModality && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-400 text-white text-xs rounded-full">
                      Select modality first
                    </span>
                  )}
                  {selectedAnatomy && (
                    <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                      {selectedAnatomy}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => setSelectedAnatomy(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filter
                </DropdownMenuItem>
                {anatomies.map((anatomy) => (
                  <DropdownMenuItem 
                    key={anatomy}
                    onClick={() => setSelectedAnatomy(anatomy)}
                    className={selectedAnatomy === anatomy ? 'bg-emerald-50' : ''}
                  >
                    {anatomy}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* TEMPLATE CARDS - MODERN DESIGN */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 6 }).map((_, index) => (
              <TemplateCardSkeleton key={index} />
            ))
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedModality || selectedAnatomy
                  ? 'Try adjusting your search or filters'
                  : 'No templates available'
                }
              </p>
              {(searchQuery || selectedModality || selectedAnatomy) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    handleModalityChange(null)
                    setSelectedAnatomy(null)
                  }}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-xl transition-all relative"
              >
                {/* Customize Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate({ id: template.id, name: template.title || 'Untitled Template' });
                    setCustomizeModalOpen(true);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all z-10"
                  title="Add custom instructions - Set your preferences and Radly will remember them!"
                >
                  <Settings className="w-4 h-4 text-gray-600 hover:text-purple-600" />
                </button>

                <div
                  className="cursor-pointer"
                  onClick={() => router.push(`/app/generate?templateId=${template.id}`)}
                >
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {template.modality && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {template.modality}
                      </div>
                    )}
                    {template.anatomy && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                        {template.anatomy}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {template.title || 'Untitled Template'}
                  </h3>

                  {/* Description */}
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Action */}
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg h-11 group-hover:shadow-lg transition-all"
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Customize Template Modal */}
        {selectedTemplate && (
          <CustomizeTemplateModal
            templateId={selectedTemplate.id}
            templateName={selectedTemplate.name}
            isOpen={customizeModalOpen}
            onClose={() => {
              setCustomizeModalOpen(false);
              setSelectedTemplate(null);
            }}
            onSaved={() => {
              // Optionally refetch templates or show indicator
            }}
          />
        )}
      </div>
    </div>
  )
}
