"use client"

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { listTemplates } from '@/lib/templates'
import { Search, FileText, Plus, RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic';

// Types for raw API response
type ApiTemplate = {
  template_id: string;
  title: string;
  modality?: string;
  body_system?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

// Normalized UI template type
type UITemplate = {
  id: string;
  name: string;
  modality: string;
  bodySystem: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const { data: templates, isLoading, error, refetch } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      try {
        const raw = await listTemplates()
        
        // Normalize to UI shape that ALWAYS has .name
        const normalized: UITemplate[] = raw.map((t) => ({
          id: t.template_id ?? '',
          name: t.name ?? '',
          modality: '', // Add default values for missing fields
          bodySystem: '',
          description: '',
          created_at: '',
          updated_at: '',
        }))
        
        return normalized
      } catch (err) {
        console.error('Failed to fetch templates:', err)
        throw err
      }
    },
  })

  // Null-safe filtering with useMemo
  const filteredTemplates = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase()
    if (!q) return templates ?? []
    
    return (templates ?? []).filter(t => 
      (t.name || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.modality || '').toLowerCase().includes(q) ||
      (t.bodySystem || '').toLowerCase().includes(q)
    )
  }, [templates, searchTerm])

  const handleUseTemplate = (templateId: string) => {
    router.push(`/app/generate?templateId=${templateId}`)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Templates</h1>
            <p className="text-muted-foreground mt-2">
              Choose from our collection of medical report templates
            </p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Couldn&apos;t load templates
          </h3>
          <p className="text-muted-foreground mb-6">
            There was an error loading the templates. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="default" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground mt-2">
            Choose from our collection of medical report templates
          </p>
        </div>
        <Link href="/app/generate">
          <Button variant="default" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No templates found' : 'No templates available'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Templates will appear here once they are available'
            }
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:bg-muted/60 transition border-border">
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm text-accent font-medium">
                  {template.modality} • {template.bodySystem}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {template.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Updated {template.updated_at ? new Date(template.updated_at).toLocaleDateString() : 'Unknown'}
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
