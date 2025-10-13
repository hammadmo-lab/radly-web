"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StepProgress } from '@/components/features/generate/StepProgress'
import { CollapsibleFormSection } from '@/components/features/generate/CollapsibleFormSection'
import { generateFormSchema, GenerateFormValues } from '@/lib/schemas'
import { httpGet } from '@/lib/http'
import { enqueueJob } from '@/lib/jobs'
import { buildSigninWithNext } from '@/lib/redirect'
import { toast } from 'sonner'
import { ArrowLeft, User, AlertCircle, FileText, Stethoscope, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

// Defensive template ID resolver to handle typos and legacy links
function resolveTemplateId(searchParams: URLSearchParams | Record<string, string | string[] | undefined>) {
  const get = (k: string) => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(k) || undefined;
    const v = (searchParams as Record<string, unknown>)[k];
    return Array.isArray(v) ? v[0] : v;
  };
  // accept common/typo variants
  const keys = ["template", "templateId", "template_id", "templated", "templte", "tid"];
  for (const k of keys) {
    const val = get(k);
    if (val) return String(val);
  }
  return undefined;
}

export default function GeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = resolveTemplateId(searchParams);
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: template } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null
      try {
        const data = await httpGet(`/v1/template/${templateId}`) as Record<string, unknown>;
        const templateTitle =
          (data && (data.title || data.name || data.display_name || data.label)) || "(Untitled Template)";
        return { ...data, templateTitle };
      } catch (err: unknown) {
        // If unauthenticated, redirect to signin with next parameter
        if (err instanceof Error && err.message.includes('401')) {
          const current = window.location.pathname + window.location.search
          window.location.href = buildSigninWithNext(current)
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
      patient: { name: '', mrn: '', age: undefined, dob: '', sex: '' },
      indication: '',
      findings: '',
      technique: '',
      signature: {
        date: new Date().toLocaleDateString(),
      },
    },
  })

  const includePatient = watch('includePatient')

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle missing template ID gracefully
  if (!templateId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Missing template id</h2>
        <p className="text-sm text-muted-foreground mt-2">
          The page URL must include ?template=&lt;id&gt;.
        </p>
        <a href="/app/templates" className="mt-4 inline-flex items-center px-3 py-2 rounded-lg bg-primary text-primary-foreground">
          Back to Templates
        </a>
      </div>
    );
  }


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
          }
        : {} // empty object -> backend treats as "no patient block"

      // Build payload for enqueueJob - flattened structure
      const payload = {
        templateId: templateId || data.templateId,
        indication: data.indication,
        findings: data.findings,
        impression: data.indication, // mapping indication to impression
        technique: data.technique,
        patient: data.includePatient ? patient : undefined,
        signature: data.signature,
      }

      console.debug('Creating job with:', payload)
      
      // Enqueue the job using new API helper
      const createResp = await enqueueJob(payload)
      const jobId = createResp.job_id
      
      console.debug('Job enqueued with ID:', jobId)
      
      // Add optimistic row to localStorage
      try {
        const local = JSON.parse(localStorage.getItem('radly_recent_jobs_local') || '[]')
        local.unshift({
          job_id: jobId,
          status: 'queued',
          template_id: payload.templateId,
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
      
      // Handle 401 errors with proper redirect to signin with next parameter
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 401) {
        toast.error('Session expired. Please sign in again.')
        const current = window.location.pathname + window.location.search
        window.location.href = buildSigninWithNext(current)
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to start report generation'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/app/templates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Generate Report</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Using template: {(template as { templateTitle?: string })?.templateTitle || "(Untitled Template)"}
          </p>
        </div>
      </div>

      {/* Progress Stepper */}
      <StepProgress 
        currentStep={currentStep} 
        onStepClick={setCurrentStep}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-error" />
            <div>
              <h3 className="text-sm font-medium text-error">Error</h3>
              <p className="text-sm text-error/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Template Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Template Selection</span>
                  </CardTitle>
                  <CardDescription>
                    Confirm the template you&apos;re using for this report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary">
                      {(template as { templateTitle?: string })?.templateTitle || "(Untitled Template)"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Template ID: {templateId}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Patient Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Patient Data Toggle */}
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <Label className="font-medium">Include patient data in report</Label>
                    <p className="text-sm text-muted-foreground">Toggle to include name/age/sex/MRN/history in the generated report and DOCX.</p>
                  </div>
                  <Switch checked={includePatient} onCheckedChange={(v) => setValue('includePatient', v)} />
                </div>

                <CollapsibleFormSection
                  id="patient-info"
                  title="Patient Information"
                  description="Provide patient details if available"
                  icon={User}
                  defaultOpen={includePatient}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient.name">Patient Name</Label>
                      <Input
                        id="patient.name"
                        {...register('patient.name')}
                        placeholder="John Doe"
                        disabled={!includePatient}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient.mrn">Medical Record Number</Label>
                      <Input
                        id="patient.mrn"
                        {...register('patient.mrn')}
                        placeholder="MRN123456"
                        disabled={!includePatient}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient.age">Age</Label>
                      <Input
                        id="patient.age"
                        type="number"
                        {...register('patient.age', { valueAsNumber: true })}
                        placeholder="45"
                        disabled={!includePatient}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient.dob">Date of Birth</Label>
                      <Input
                        id="patient.dob"
                        {...register('patient.dob')}
                        placeholder="01/01/1980"
                        disabled={!includePatient}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient.sex">Sex</Label>
                      <Input
                        id="patient.sex"
                        {...register('patient.sex')}
                        placeholder="Male/Female"
                        disabled={!includePatient}
                      />
                    </div>
                  </div>
                </CollapsibleFormSection>
              </div>
            )}

            {/* Step 3: Clinical Data */}
            {currentStep === 3 && (
              <CollapsibleFormSection
                id="clinical-data"
                title="Clinical Information"
                description="Provide the clinical details for the report"
                icon={Stethoscope}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="indication">Indication / Clinical history (required)</Label>
                    <Textarea
                      id="indication"
                      {...register('indication')}
                      placeholder="Reason for study..."
                      rows={3}
                    />
                    {errors.indication && (
                      <p className="text-sm text-error">{errors.indication.message}</p>
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
                      <p className="text-sm text-error">{errors.findings.message}</p>
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
                </div>
              </CollapsibleFormSection>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Review & Submit</span>
                    </CardTitle>
                    <CardDescription>
                      Review your information before generating the report
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Report Summary</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Template:</strong> {(template as { templateTitle?: string })?.templateTitle || "(Untitled Template)"}</p>
                        <p><strong>Patient Data:</strong> {includePatient ? 'Included' : 'Not included'}</p>
                        <p><strong>Indication:</strong> {watch('indication') || 'Not provided'}</p>
                        <p><strong>Findings:</strong> {watch('findings') ? `${watch('findings').length} characters` : 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? 'Generating...' : 'Generate Report'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
