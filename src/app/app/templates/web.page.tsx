'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter, ChevronDown, X, Settings, Star } from 'lucide-react'
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
import { useFavoriteTemplates } from '@/hooks/useFavoriteTemplates'

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModality, setSelectedModality] = useState<string | null>(null)
  const [selectedAnatomy, setSelectedAnatomy] = useState<string | null>(null)
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string } | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const { isFavorite, toggleFavorite, count: favoriteCount } = useFavoriteTemplates()

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

    // Deduplicate templates by ID to avoid React key conflicts
    const seen = new Set<string>()
    const uniqueTemplates = templates.filter(template => {
      if (seen.has(template.id)) {
        return false
      }
      seen.add(template.id)
      return true
    })

    return uniqueTemplates.filter(template => {
      // Favorites filter
      const favoritesMatch = !showFavoritesOnly || isFavorite(template.id)

      // Search filter
      const searchMatch = !searchQuery ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.modality && template.modality.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (template.anatomy && template.anatomy.toLowerCase().includes(searchQuery.toLowerCase()))

      // Modality filter
      const modalityMatch = !selectedModality || template.modality === selectedModality

      // Anatomy filter
      const anatomyMatch = !selectedAnatomy || template.anatomy === selectedAnatomy

      return favoritesMatch && searchMatch && modalityMatch && anatomyMatch
    })
  }, [templates, searchQuery, selectedModality, selectedAnatomy, showFavoritesOnly, isFavorite])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white">Templates</h1>
          <p className="text-sm sm:text-base text-[rgba(207,207,207,0.65)]">
            Select a template to generate your medical report.
          </p>
        </div>
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="h-12 px-6 bg-[linear-gradient(90deg,#E5C478_0%,#F5D791_100%)] text-white shadow-[0_10px_24px_rgba(245,215,145,0.35)] hover:shadow-[0_16px_28px_rgba(245,215,145,0.45)]"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Report
        </Button>
      </div>

      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[linear-gradient(135deg,#F8B74D,#FF6B6B)] shadow-lg flex items-center justify-center flex-shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="space-y-2 min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-white">Save time with custom instructions</h3>
            <p className="text-xs sm:text-sm text-[rgba(207,207,207,0.75)] leading-relaxed">
              Tap the{' '}
              <span className="inline-flex items-center px-2 py-1 rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] gap-1.5 align-middle">
                <Settings className="w-3 h-3 text-[#E5C478]" />
                <span className="text-xs font-medium uppercase tracking-wider text-[rgba(207,207,207,0.85)]">Settings</span>
              </span>{' '}
              icon on any template to add preferences (e.g. &quot;always mention lymphadenopathy&quot;). The AI remembers them for every future report.
            </p>
          </div>
        </div>
      </div>

      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 md:p-7 space-y-5">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(207,207,207,0.45)]" />
            <Input
              type="search"
              placeholder="Search templates by name, modality, or body system..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 sm:h-13 bg-[rgba(18,22,36,0.85)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgba(207,207,207,0.45)] focus-visible:ring-[#F5D791]"
            />
          </div>

          {/* Favorites Tab */}
          {favoriteCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-3 h-10 rounded-lg border transition-colors ${
                  showFavoritesOnly
                    ? 'border-[#FFB800] bg-[rgba(255,184,0,0.12)] text-[#FFD700]'
                    : 'border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.75)] hover:border-[rgba(255,184,0,0.4)] hover:text-white'
                }`}
              >
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Favorites</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-[rgba(255,184,0,0.2)] text-[#FFD700]">
                  {favoriteCount}
                </span>
              </button>
              {showFavoritesOnly && (
                <button
                  onClick={() => setShowFavoritesOnly(false)}
                  className="text-xs text-[rgba(207,207,207,0.65)] hover:text-white underline"
                >
                  Show All
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`h-11 rounded-lg border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] text-white hover:border-[#F5D791]/40 hover:text-white ${
                  selectedModality ? 'border-[#F5D791]/40 bg-[rgba(245,215,145,0.12)]' : ''
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Modality
                {selectedModality && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[rgba(245,215,145,0.2)] text-[#E8DCC8]">
                    {selectedModality}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-[rgba(12,14,24,0.95)] border border-[rgba(255,255,255,0.12)] text-white">
              <DropdownMenuItem onClick={() => handleModalityChange(null)}>
                <X className="w-4 h-4 mr-2" />
                Clear Filter
              </DropdownMenuItem>
              {modalities.map((modality) => (
                <DropdownMenuItem
                  key={modality}
                  onClick={() => handleModalityChange(modality)}
                  className={selectedModality === modality ? 'bg-[rgba(245,215,145,0.18)] text-[#E8DCC8]' : ''}
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
                className={`h-11 rounded-lg border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] text-white hover:border-[#F5D791]/40 hover:text-white ${
                  selectedAnatomy ? 'border-[#F5D791]/40 bg-[rgba(245,215,145,0.12)]' : ''
                } ${!selectedModality ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={!selectedModality}
              >
                <Filter className="w-4 h-4 mr-2" />
                Body System
                {selectedAnatomy && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[rgba(245,215,145,0.2)] text-[#E8DCC8]">
                    {selectedAnatomy}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-[rgba(12,14,24,0.95)] border border-[rgba(255,255,255,0.12)] text-white">
              <DropdownMenuItem onClick={() => setSelectedAnatomy(null)}>
                <X className="w-4 h-4 mr-2" />
                Clear Filter
              </DropdownMenuItem>
              {anatomies.map((anatomy) => (
                <DropdownMenuItem
                  key={anatomy}
                  onClick={() => setSelectedAnatomy(anatomy)}
                  className={selectedAnatomy === anatomy ? 'bg-[rgba(245,215,145,0.18)] text-[#E8DCC8]' : ''}
                >
                  {anatomy}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => <TemplateCardSkeleton key={index} />)
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full aurora-card border border-[rgba(255,255,255,0.08)] py-12 text-center space-y-4">
            <div className="text-[rgba(207,207,207,0.45)]">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white">No templates found</h3>
            <p className="text-sm text-[rgba(207,207,207,0.65)] max-w-md mx-auto">
              {searchQuery || selectedModality || selectedAnatomy
                ? 'Try adjusting your search or filters.'
                : 'Templates will appear here as soon as they are available.'}
            </p>
            {(searchQuery || selectedModality || selectedAnatomy) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  handleModalityChange(null)
                  setSelectedAnatomy(null)
                }}
                className="mt-4 h-10 px-5 text-[rgba(207,207,207,0.85)] border-[rgba(255,255,255,0.12)] hover:text-white"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="aurora-card group relative border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 cursor-pointer active:scale-[0.98] transition-transform duration-150 flex flex-col h-full"
              onClick={() => router.push(`/app/generate?templateId=${template.id}`)}
            >
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleFavorite(template.id)
                  }}
                  className="min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center rounded-lg bg-[rgba(18,22,36,0.95)] border border-[rgba(255,255,255,0.15)] text-[rgba(207,207,207,0.75)] hover:text-white hover:border-[rgba(255,184,0,0.45)] active:scale-95 transition-colors touch-manipulation"
                  aria-label={isFavorite(template.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-5 h-5 ${isFavorite(template.id) ? 'fill-[#FFD700] text-[#FFD700]' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedTemplate({ id: template.id, name: template.title || 'Untitled Template' })
                    setCustomizeModalOpen(true)
                  }}
                  className="min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center rounded-lg bg-[rgba(18,22,36,0.95)] border border-[rgba(255,255,255,0.15)] text-[rgba(207,207,207,0.75)] hover:text-white hover:border-[rgba(143,130,255,0.45)] active:scale-95 transition-colors touch-manipulation"
                  aria-label="Customize template settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {template.modality && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[rgba(245,215,145,0.18)] text-[#E8DCC8]">
                      {template.modality}
                    </span>
                  )}
                  {template.anatomy && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[rgba(245,215,145,0.18)] text-[#E8DCC8]">
                      {template.anatomy}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  {template.title || 'Untitled Template'}
                </h3>

                {template.description && (
                  <p className="text-sm text-[rgba(207,207,207,0.65)] line-clamp-2">
                    {template.description}
                  </p>
                )}
              </div>

              <div className="mt-auto pt-3">
                <Button
                  className="w-full h-10 sm:h-11 bg-[#E5C478] text-white hover:bg-[#F5D791]"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/app/generate?templateId=${template.id}`)
                  }}
                >
                  Use Template
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {selectedTemplate && (
        <CustomizeTemplateModal
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
          isOpen={customizeModalOpen}
          onClose={() => {
            setCustomizeModalOpen(false)
            setSelectedTemplate(null)
          }}
          onSaved={() => {
            // Optionally refetch templates or show indicator
          }}
        />
      )}
    </div>
  )
}
