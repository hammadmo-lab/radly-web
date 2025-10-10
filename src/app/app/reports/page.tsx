"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { getJson } from '@/lib/api'
import { toast } from 'sonner'
import { Search, FileText, Plus, Calendar, User, AlertCircle, Copy } from 'lucide-react'

type Job = {
  job_id?: string;
  template_id?: string;
  created_at?: string;
  status?: string;
};

type RecentJobsResponse = {
  jobs?: Job[];
  count: number;
};

type ReportSummary = {
  id: string;
  title: string;
  status: string;
  createdAt?: Date | null;
};

function mapJobsToReports(jobs: Job[] = []): ReportSummary[] {
  return jobs.map((job) => ({
    id: job.job_id ?? crypto.randomUUID(),
    title: job.template_id ?? "Report",
    status: job.status ?? "done",
    createdAt: job.created_at ? new Date(job.created_at) : null,
  }));
}

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredReports, setFilteredReports] = useState<ReportSummary[]>([])

  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await getJson<RecentJobsResponse>('/v1/jobs/recent?limit=50')
      return response
    },
  })

  // Extract data and error from API response
  const jobs = apiResponse?.data?.jobs
  const apiError = apiResponse?.error
  const reports = jobs ? mapJobsToReports(jobs) : []

  // Filter reports based on search term
  React.useEffect(() => {
    if (reports) {
      const filtered = reports.filter(report =>
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredReports(filtered)
    }
  }, [reports, searchTerm])

  // Handle retry
  const handleRetry = () => {
    refetch()
  }

  // Copy error details to clipboard
  const copyErrorDetails = () => {
    const errorText = `Status: ${apiError?.status}\nMessage: ${apiError?.message}${apiError?.body ? `\nBody: ${apiError.body}` : ''}`
    navigator.clipboard.writeText(errorText)
    toast.success('Error details copied to clipboard')
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

      {/* Error Display */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Failed to load reports</h3>
              <p className="text-sm text-red-700 mt-1">
                Status: {apiError.status} - {apiError.message}
              </p>
              <div className="mt-3 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  Retry
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyErrorDetails}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Error Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
      ) : !jobs || jobs.length === 0 ? (
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
                      {report.title || 'Untitled Report'}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{report.createdAt ? report.createdAt.toLocaleDateString() : 'Unknown date'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Status: {report.status || 'Unknown'}</span>
                      </span>
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
                    <p className="text-sm font-medium text-muted-foreground">Job ID</p>
                    <p className="text-foreground text-sm line-clamp-2">
                      {report.id || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-foreground text-sm line-clamp-3">
                      {report.status || 'Unknown'}
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
