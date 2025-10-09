"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Report } from '@/types'
import { toast } from 'sonner'
import { Search, FileText, Plus, Calendar, User } from 'lucide-react'

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredReports, setFilteredReports] = useState<Report[]>([])

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await api.get<Report[]>('/v1/reports')
      return response.data
    },
  })

  // Filter reports based on search term
  React.useEffect(() => {
    if (reports) {
      const filtered = reports.filter(report =>
        report.indication.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.findings_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.patient?.mrn?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredReports(filtered)
    }
  }, [reports, searchTerm])

  if (error) {
    toast.error('Failed to load reports')
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load reports. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your generated medical reports
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
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
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
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No reports found' : 'No reports yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Generate your first medical report to get started'
            }
          </p>
          {!searchTerm && (
            <Link href="/app/generate">
              <Button variant="default" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create First Report</span>
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:bg-muted/60 transition border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {report.patient?.name || 'Unnamed Patient'}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </span>
                      {report.patient?.mrn && (
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>MRN: {report.patient.mrn}</span>
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Link href={`/app/report/${report.id}`}>
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Indication</p>
                    <p className="text-foreground text-sm line-clamp-2">
                      {report.indication}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Findings</p>
                    <p className="text-foreground text-sm line-clamp-3">
                      {report.findings_text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
