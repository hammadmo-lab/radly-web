"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { generateFormSchema, GenerateFormValues } from '@/lib/schemas'
import { apiFetch } from '@/lib/api'
import { enqueueJob } from '@/lib/jobs'
import { GenReq } from '@/lib/types'
import { toast } from 'sonner'
import { ArrowLeft, FileText, User, Calendar, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic';
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'

export default function GeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: template } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null
      try {
        const template = await apiFetch(`/v1/templates/${templateId}`)
        return template
      } catch (err: unknown) {
        // If unauthenticated, redirect to login
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/login')
          return null
        }
        throw err
      }
    },
    enabled: !!templateId,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      templateId: templateId || '',
      includePatient: false,
      patient: { name: '', mrn: '', age: undefined, dob: '', sex: '', history: '' },
      indication: '',
      findings: '',
      technique: '',
      signature: {
        date: new Date().toLocaleDateString(),
      },
    },
  })

  const includePatient = watch('includePatient')


  const onSubmit = async (data: GenerateFormValues) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Build patient object based on includePatient toggle
      const patient = data.includePatient
        ? {
            name: data.patient.name || undefined,
            mrn: data.patient.mrn || undefined,
            age: data.patient.age ?? undefined,
            dob: data.patient.dob || undefined,
            sex: data.patient.sex || undefined,
            history: data.patient.history || undefined,
          }
        : {} // empty object -> backend treats as "no patient block"

      // Build GenReq from form data
      const genReq: GenReq = {
        template_id: templateId || data.templateId,
        patient, // {} or filled
        findings_text: data.findings,
        history: data.indication,
        technique: data.technique || undefined,
        options: {},
      }

      console.debug('Enqueuing job with:', genReq)
      
      // Enqueue the job using new typed helper
      const enqueueResp = await enqueueJob(genReq)
      const jobId = enqueueResp.job_id
      
      console.debug('Job enqueued with ID:', jobId)
      
      // Add optimistic row to localStorage
      try {
        const local = JSON.parse(localStorage.getItem('radly_recent_jobs_local') || '[]')
        local.unshift({
          job_id: jobId,
          status: 'queued',
          template_id: genReq.template_id,
          title: 'Generating…',
          created_at: Date.now()
        })
        localStorage.setItem('radly_recent_jobs_local', JSON.stringify(local))
      } catch (e) {
        console.warn('Failed to update localStorage:', e)
      }
      
      // Store job ID in session storage
      sessionStorage.setItem('radly:lastJobId', jobId)

      // Navigate to the report detail page
      toast.success('Report generation started!')
      router.push(`/app/report/${jobId}`)

    } catch (err: unknown) {
      console.error('Generate error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to start report generation'
      
      // If unauthenticated, redirect to login
      if (errorMessage.includes('401')) {
        router.push('/login')
        return
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div>
              <h3 className="text-sm font-medium text-destructive">Error</h3>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </div>
      )}

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
                <Label htmlFor="templateId">Select Template</Label>
                <Input
                  id="templateId"
                  {...register('templateId')}
                  placeholder="Enter template ID"
                />
                {errors.templateId && (
                  <p className="text-sm text-destructive">{errors.templateId.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Data Toggle */}
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <Label className="font-medium">Include patient data in report</Label>
            <p className="text-sm text-muted-foreground">Toggle to include name/age/sex/MRN/history in the generated report and DOCX.</p>
          </div>
          <Switch checked={includePatient} onCheckedChange={(v) => setValue('includePatient', v)} />
        </div>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Patient Information</span>
            </CardTitle>
            <CardDescription>
              Provide patient details if available
            </CardDescription>
          </CardHeader>
          <CardContent className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${includePatient ? '' : 'opacity-50 pointer-events-none'}`}>
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
              <Label htmlFor="patient.dob">Date of Birth</Label>
              <Input
                id="patient.dob"
                {...register('patient.dob')}
                placeholder="01/01/1980"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient.sex">Sex</Label>
              <Input
                id="patient.sex"
                {...register('patient.sex')}
                placeholder="Male/Female"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="patient.history">Patient History (optional)</Label>
              <Textarea
                id="patient.history"
                rows={3}
                {...register('patient.history')}
                placeholder="Relevant past history..."
              />
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
              <Label htmlFor="indication">Indication / Clinical history (required)</Label>
              <Textarea
                id="indication"
                {...register('indication')}
                placeholder="Reason for study..."
                rows={3}
              />
              {errors.indication && (
                <p className="text-sm text-destructive">{errors.indication.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="findings">Findings (required)</Label>
              <Textarea
                id="findings"
                {...register('findings')}
                placeholder="- Bullet 1\n- Bullet 2\nor free text..."
                rows={6}
              />
              {errors.findings && (
                <p className="text-sm text-destructive">{errors.findings.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="technique">Technique (optional)</Label>
              <Input
                id="technique"
                {...register('technique')}
                placeholder="Portal venous phase..."
              />
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </form>

    </div>
  )
}
