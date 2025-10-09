"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { generateFormSchema, GenerateFormData } from '@/lib/schemas'
import { api } from '@/lib/api'
import { Template } from '@/types'
import { toast } from 'sonner'
import { ArrowLeft, FileText, User, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function GeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')
  const [isGenerating, setIsGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)

  const { data: template } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null
      const response = await api.get<Template>(`/v1/templates/${templateId}`)
      return response.data
    },
    enabled: !!templateId,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      template_id: templateId || '',
      signature: {
        date: new Date().toLocaleDateString(),
      },
    },
  })

  // Poll for job completion
  useEffect(() => {
    if (!jobId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get<{ status: string; report_id?: string; error?: string }>(`/v1/generate/${jobId}`)
        const { status, report_id, error } = response.data

        if (status === 'completed' && report_id) {
          clearInterval(pollInterval)
          setIsGenerating(false)
          toast.success('Report generated successfully!')
          router.push(`/app/report/${report_id}`)
        } else if (status === 'failed') {
          clearInterval(pollInterval)
          setIsGenerating(false)
          toast.error(error || 'Report generation failed')
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2500) // Poll every 2.5 seconds

    return () => clearInterval(pollInterval)
  }, [jobId, router])

  const onSubmit = async (data: GenerateFormData) => {
    setIsGenerating(true)
    try {
      const response = await api.post<{ job_id: string }>('/v1/generate', data)
      setJobId(response.data.job_id)
      toast.success('Report generation started!')
    } catch (error) {
      setIsGenerating(false)
      toast.error('Failed to start report generation')
      console.error('Generate error:', error)
    }
  }

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-primary text-primary-foreground flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-foreground mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Generating Report</h2>
          <p className="text-lg opacity-90">
            Please wait while we process your medical report...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/app/templates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generate Report</h1>
          <p className="text-muted-foreground">
            {template ? `Using template: ${template.name}` : 'Create a new medical report'}
          </p>
        </div>
      </div>

      {/* Template Selection Banner */}
      {!templateId && (
        <div className="bg-muted border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium text-foreground">No template selected</h3>
              <p className="text-sm text-muted-foreground">
                Choose a template from the Templates page to get started with a pre-filled form.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Selection */}
        {!templateId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Template</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="template_id">Select Template</Label>
                <Input
                  id="template_id"
                  {...register('template_id')}
                  placeholder="Enter template ID"
                />
                {errors.template_id && (
                  <p className="text-sm text-destructive">{errors.template_id.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Patient Information (Optional)</span>
            </CardTitle>
            <CardDescription>
              Provide patient details if available
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient.name">Patient Name</Label>
              <Input
                id="patient.name"
                {...register('patient.name')}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient.mrn">Medical Record Number</Label>
              <Input
                id="patient.mrn"
                {...register('patient.mrn')}
                placeholder="MRN123456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient.age">Age</Label>
              <Input
                id="patient.age"
                type="number"
                {...register('patient.age', { valueAsNumber: true })}
                placeholder="45"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient.sex">Sex</Label>
              <select
                id="patient.sex"
                {...register('patient.sex')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select...</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Information</CardTitle>
            <CardDescription>
              Provide the clinical details for the report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="indication">Indication *</Label>
              <Textarea
                id="indication"
                {...register('indication')}
                placeholder="Describe the clinical indication for this examination..."
                rows={3}
              />
              {errors.indication && (
                <p className="text-sm text-destructive">{errors.indication.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="findings_text">Findings *</Label>
              <Textarea
                id="findings_text"
                {...register('findings_text')}
                placeholder="Describe the clinical findings in detail..."
                rows={6}
              />
              {errors.findings_text && (
                <p className="text-sm text-destructive">{errors.findings_text.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Signature (Optional)</span>
            </CardTitle>
            <CardDescription>
              Add signature information to the report
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signature.name">Signature Name</Label>
              <Input
                id="signature.name"
                {...register('signature.name')}
                placeholder="Dr. Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signature.date">Date</Label>
              <Input
                id="signature.date"
                {...register('signature.date')}
                placeholder={new Date().toLocaleDateString()}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/app/templates">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </form>
    </div>
  )
}
