'use client'

import { useState } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TemplateFiltersProps {
  onFilterChange?: (filters: {
    searchQuery: string
    modality?: string
    bodySystem?: string
  }) => void
}

export function TemplateFilters({ onFilterChange }: TemplateFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModality, setSelectedModality] = useState<string>()
  const [selectedBodySystem, setSelectedBodySystem] = useState<string>()

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFilterChange?.({
      searchQuery: value,
      modality: selectedModality,
      bodySystem: selectedBodySystem,
    })
  }

  const handleModalityChange = (value: string) => {
    const newValue = value === selectedModality ? undefined : value
    setSelectedModality(newValue)
    onFilterChange?.({
      searchQuery,
      modality: newValue,
      bodySystem: selectedBodySystem,
    })
  }

  const handleBodySystemChange = (value: string) => {
    const newValue = value === selectedBodySystem ? undefined : value
    setSelectedBodySystem(newValue)
    onFilterChange?.({
      searchQuery,
      modality: selectedModality,
      bodySystem: newValue,
    })
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedModality(undefined)
    setSelectedBodySystem(undefined)
    onFilterChange?.({
      searchQuery: '',
      modality: undefined,
      bodySystem: undefined,
    })
  }

  const hasActiveFilters = searchQuery || selectedModality || selectedBodySystem

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Search templates by name, modality, or body system..."
          className="pl-12 pr-10 h-12 text-base border-2 focus:border-primary transition-colors rounded-xl"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedModality} onValueChange={handleModalityChange}>
          <SelectTrigger className="w-[180px] border-2 h-10">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Modality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CT">CT Scan</SelectItem>
            <SelectItem value="MRI">MRI</SelectItem>
            <SelectItem value="X-Ray">X-Ray</SelectItem>
            <SelectItem value="Ultrasound">Ultrasound</SelectItem>
            <SelectItem value="PET">PET Scan</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedBodySystem} onValueChange={handleBodySystemChange}>
          <SelectTrigger className="w-[180px] border-2 h-10">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Body System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chest">Chest</SelectItem>
            <SelectItem value="abdomen">Abdomen</SelectItem>
            <SelectItem value="neuro">Neurological</SelectItem>
            <SelectItem value="msk">Musculoskeletal</SelectItem>
            <SelectItem value="cardiac">Cardiac</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-600 hover:text-error h-10"
          >
            Clear Filters
            <X className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedModality && (
            <Badge 
              variant="secondary" 
              className="px-3 py-1.5 text-sm bg-primary/10 text-primary border-primary/20"
            >
              {selectedModality}
              <button
                onClick={() => handleModalityChange(selectedModality)}
                className="ml-2 hover:text-error transition-colors"
                aria-label={`Remove ${selectedModality} filter`}
                title={`Remove ${selectedModality} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedBodySystem && (
            <Badge 
              variant="secondary" 
              className="px-3 py-1.5 text-sm bg-secondary/10 text-secondary border-secondary/20"
            >
              {selectedBodySystem}
              <button
                onClick={() => handleBodySystemChange(selectedBodySystem)}
                className="ml-2 hover:text-error transition-colors"
                aria-label={`Remove ${selectedBodySystem} filter`}
                title={`Remove ${selectedBodySystem} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
