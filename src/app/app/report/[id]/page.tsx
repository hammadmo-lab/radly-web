"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { jobs, exportDocxDirect, exportDocxLink } from '@/lib/api'
import { JobStatus, JobDoneResult } from '@/lib/types'
import { toast } from 'sonner'
import { ArrowLeft, Copy, Download, FileText, Plus, AlertCircle, Loader2 } from 'lucide-react'
import ReportRenderer from '@/components/ReportRenderer'

interface ReportPageProps {
  params: {
    id: string
  }
}

export default function ReportPage({ params }: ReportPageProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [cachedResult, setCachedResult] = useState<JobDoneResult | null>(null)

  // Check for cached result first
  useEffect(() => {
    const cached = sessionStorage.getItem('radly:lastResult')
    if (cached) {
      try {
        setCachedResult(JSON.parse(cached))
      } catch (e) {
        console.warn('Failed to parse cached result:', e)
      }
    }
  }, [])

  const { data: jobStatus, isLoading, error } = useQuery({
    queryKey: ['job', params.id],
    queryFn: async () => {
      const response = await jobs.get(params.id)
      return response.data
    },
    refetchInterval: (query) => {
      // Keep polling if job is still running
      const data = query.state.data as JobStatus | undefined
      if (data?.status === 'queued' || data?.status === 'running') {
        return 2500
      }
      return false
    },
  })

  const handleCopyReport = async () => {
    const result = jobStatus?.status === 'done' ? jobStatus.result : cachedResult
    if (!result?.report) return
    
    try {
      const reportText = [
        result.report.title && `# ${result.report.title}`,
        result.report.technique && `## Technique\n${result.report.technique}`,
        result.report.findings && `## Findings\n${result.report.findings}`,
        result.report.impression && `## Impression\n${result.report.impression}`,
        result.report.recommendations && `## Recommendations\n${result.report.recommendations}`,
      ].filter(Boolean).join('\n\n')
      
      await navigator.clipboard.writeText(reportText)
      toast.success('Report copied to clipboard!')
    } catch {
      toast.error('Failed to copy report')
    }
  }

  const handleExportDocx = async () => {
    const result = jobStatus?.status === 'done' ? jobStatus.result : cachedResult
    if (!result?.report) return
    
    setIsExporting(true)
    try {
      const includePatient = !!(result.patient && Object.keys(result.patient).length > 0)
      await exportDocxDirect({
        report: result.report,
        patient: result.patient || {},
        include_identifiers: includePatient,
        filename: `${result.report.title || 'report'}.docx`,
      })
      toast.success('Report exported successfully!')
    } catch (err: unknown) {
      console.error('Export failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Failed to export report: ${errorMessage}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportViaLink = async () => {
    const result = jobStatus?.status === 'done' ? jobStatus.result : cachedResult
    if (!result?.report) return
    
    setIsExporting(true)
    try {
      const includePatient = !!(result.patient && Object.keys(result.patient).length > 0)
      await exportDocxLink({
        report: result.report,
        patient: result.patient || {},
        include_identifiers: includePatient,
        filename: `${result.report.title || 'report'}.docx`,
      })
    } catch (err: unknown) {
      console.error('Export link failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Failed to get download link: ${errorMessage}`)
    } finally {
      setIsExporting(false)
    }
  }

  // Show loading state while job is running
  if (isLoading || (jobStatus?.status === 'queued' || jobStatus?.status === 'running')) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {jobStatus?.status === 'queued' ? 'Job Queued' : 
           jobStatus?.status === 'running' ? 'Processing Report' : 'Loading...'}
        </h2>
        <p className="text-muted-foreground">
          {jobStatus?.status === 'queued' ? 'Your report is in the queue' :
           jobStatus?.status === 'running' ? 'Please wait while we generate your report' :
           'Loading report details...'}
        </p>
      </div>
    )
  }

  // Show error state
  if (error || jobStatus?.status === 'error') {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Report Error
        </h2>
        <p className="text-muted-foreground mb-6">
          {jobStatus?.status === 'error' ? jobStatus.error : 'There was an error loading the report'}
        </p>
        {cachedResult && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-4">
              We have a cached version of this report available.
            </p>
            <Button onClick={() => setCachedResult(cachedResult)}>
              Use Cached Result
            </Button>
          </div>
        )}
        <Link href="/app/reports">
          <Button variant="default">Back to Reports</Button>
        </Link>
      </div>
    )
  }

  // Get the result to display
  const result = jobStatus?.status === 'done' ? jobStatus.result : cachedResult
  
  if (!result?.report) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Report Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          The requested report could not be found or you don&apos;t have permission to view it.
        </p>
        <Link href="/app/reports">
          <Button variant="default">Back to Reports</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/app/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medical Report</h1>
            <p className="text-muted-foreground">
              {result.elapsed_ms ? `Generated in ${Math.round(result.elapsed_ms / 1000)}s` : 'Generated report'}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleCopyReport}
            className="flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </Button>
          <Button
            variant="default"
            onClick={handleExportDocx}
            disabled={isExporting}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Download (.docx)'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportViaLink}
            disabled={isExporting}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>{isExporting ? 'Getting link...' : 'Get download link'}</span>
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <ReportRenderer report={result.report} patient={result.patient} />

      {/* Actions */}
      <div className="flex justify-center space-x-4 pt-6">
        <Link href="/app/templates">
          <Button variant="default" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Back to Templates</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
