"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { Report } from '@/types'
import { toast } from 'sonner'
import { ArrowLeft, Copy, Download, FileText, Plus } from 'lucide-react'

interface ReportPageProps {
  params: {
    id: string
  }
}

export default function ReportPage({ params }: ReportPageProps) {
  const [isExporting, setIsExporting] = useState(false)

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', params.id],
    queryFn: async () => {
      const response = await api.get<Report>(`/v1/reports/${params.id}`)
      return response.data
    },
  })

  const handleCopyReport = async () => {
    if (!report) return
    
    try {
      await navigator.clipboard.writeText(report.generated_content)
      toast.success('Report copied to clipboard!')
    } catch {
      toast.error('Failed to copy report')
    }
  }

  const handleExportDocx = async () => {
    if (!report) return
    
    setIsExporting(true)
    try {
      let docxUrl = report.docx_url
      
      // If no docx_url exists, generate one
      if (!docxUrl) {
        const response = await api.post<{ docx_url: string }>(`/v1/export/docx`, {
          report_id: report.id
        })
        docxUrl = response.data.docx_url
      }

      // Download the file
      const link = document.createElement('a')
      link.href = docxUrl
      link.download = `report-${report.id}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Report exported successfully!')
    } catch {
      toast.error('Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!report) {
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
              Generated on {new Date(report.created_at).toLocaleDateString()}
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
            <span>{isExporting ? 'Exporting...' : 'Export DOCX'}</span>
          </Button>
        </div>
      </div>

      {/* Patient Information */}
      {report.patient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {report.patient.name && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-foreground">{report.patient.name}</p>
                </div>
              )}
              {report.patient.mrn && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">MRN</p>
                  <p className="text-foreground">{report.patient.mrn}</p>
                </div>
              )}
              {report.patient.age && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="text-foreground">{report.patient.age}</p>
                </div>
              )}
              {report.patient.sex && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sex</p>
                  <p className="text-foreground">{report.patient.sex}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Indication</p>
            <p className="text-foreground">{report.indication}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Findings</p>
            <p className="text-foreground whitespace-pre-wrap">{report.findings_text}</p>
          </div>
        </CardContent>
      </Card>

      {/* Generated Report */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Report</CardTitle>
          <CardDescription>
            AI-generated medical report based on the provided information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-foreground">
              {report.generated_content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature */}
      {report.signature && (
        <Card>
          <CardHeader>
            <CardTitle>Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              {report.signature.name && (
                <p className="text-foreground font-medium">{report.signature.name}</p>
              )}
              {report.signature.date && (
                <p className="text-muted-foreground">{report.signature.date}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4 pt-6">
        <Link href="/app/generate">
          <Button variant="default" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
