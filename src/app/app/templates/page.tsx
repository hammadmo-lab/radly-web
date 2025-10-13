'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { httpGet } from '@/lib/http'
import { fetchTemplates } from '@/lib/templates'

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => await fetchTemplates(httpGet),
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* HEADER - BOLD AND READABLE */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Templates
            </h1>
            <p className="text-lg text-gray-600">
              Select a template to generate your medical report
            </p>
          </div>
          <Button 
            onClick={() => router.push('/app/generate')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-6 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Report
          </Button>
        </div>

        {/* SEARCH BAR - WHITE BACKGROUND, NOT DARK! */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search templates by name, modality, or body system..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base border-2 border-gray-200 rounded-xl focus:border-emerald-500 bg-white text-gray-900"
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-2 border-gray-200 h-11 rounded-lg hover:border-emerald-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Modality
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-gray-200 h-11 rounded-lg hover:border-emerald-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Body System
            </Button>
          </div>
        </div>

        {/* TEMPLATE CARDS - MODERN DESIGN */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template: { id: string; title?: string; name?: string; modality?: string | null; description?: string }) => (
            <Card 
              key={template.id}
              className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
              onClick={() => router.push(`/app/generate?templateId=${template.id}`)}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Badges */}
              {template.modality && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                  {template.modality}
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {template.title || template.name || 'Untitled Template'}
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
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
