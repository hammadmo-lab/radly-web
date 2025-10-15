"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { generateFormSchema, GenerateFormValues } from '@/lib/schemas'
import { httpGet } from '@/lib/http'
import { enqueueJob } from '@/lib/jobs'
import { buildSigninWithNext } from '@/lib/redirect'
import { toast } from 'sonner'
import { ArrowLeft, User, AlertCircle, FileText, Stethoscope, CheckCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { useAuthToken } from '@/hooks/useAuthToken';

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
  const { userId } = useAuthToken();
  const templateId = resolveTemplateId(searchParams);
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [intentionalSubmit, setIntentionalSubmit] = useState(false)

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
    formState: { errors, isValid, isSubmitting: formIsSubmitting },
  } = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    mode: 'onSubmit', // Only validate on submit, not on change
    reValidateMode: 'onSubmit', // Only re-validate on submit
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

  // Debug: Track form state changes
  useEffect(() => {
    console.log('Form state changed:', { isValid, formIsSubmitting, currentStep });
  }, [isValid, formIsSubmitting, currentStep]);

  const includePatient = watch('includePatient')

  // Debug: Track step changes
  useEffect(() => {
    console.log('Step changed to:', currentStep);
    // Reset intentional submit flag when step changes
    setIntentionalSubmit(false);
    if (currentStep === 4) {
      console.log('Reached step 4 - checking if form submission is triggered');
    }
  }, [currentStep]);

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep);
    if (currentStep < 4) {
      const newStep = currentStep + 1;
      console.log('Setting step to:', newStep);
      setCurrentStep(newStep);
    }
  }

  const handlePrevious = () => {
    console.log('handlePrevious called, currentStep:', currentStep);
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      console.log('Setting step to:', newStep);
      setCurrentStep(newStep);
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
    console.log('Form submitted!', { currentStep, data, intentionalSubmit });
    
    // Prevent submission if not on step 4 or not intentional
    if (currentStep !== 4 || !intentionalSubmit) {
      console.log('Preventing submission - not on step 4 or not intentional:', { currentStep, intentionalSubmit });
      return;
    }
    
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
      
      // Add optimistic row to localStorage with user-specific key
      try {
        if (userId) {
          const userJobsKey = `radly_recent_jobs_local_${userId}`;
          const local = JSON.parse(localStorage.getItem(userJobsKey) || '[]')
          local.unshift({
            job_id: jobId,
            status: 'queued',
            template_id: payload.templateId,
            title: 'Generating…',
            created_at: Date.now()
          })
          localStorage.setItem(userJobsKey, JSON.stringify(local))
        }
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



  const steps = [
    { id: 1, name: 'Template', icon: FileText },
    { id: 2, name: 'Patient Info', icon: User },
    { id: 3, name: 'Clinical Data', icon: Stethoscope },
    { id: 4, name: 'Review', icon: Eye },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/app/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Generate Report</h1>
        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Clean Step Indicator */}
      <Card className="bg-white border-2 border-gray-100">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 hidden sm:block">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-violet-500"
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Steps */}
            <div className="flex items-center justify-between w-full relative z-10">
              {steps.map((step) => {
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                return (
                  <div key={step.id} className="flex flex-col items-center gap-1 sm:gap-2">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive || isCompleted
                        ? "bg-gradient-to-br from-emerald-500 to-violet-500 text-white shadow-lg"
                        : "bg-white border-2 border-gray-300 text-gray-400"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium text-center ${
                      isActive || isCompleted ? "text-emerald-600" : "text-gray-500"
                    }`}>
                      {step.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-6"
        onKeyDown={(e) => {
          // Prevent form submission on Enter key unless it's the submit button
          if (e.key === 'Enter' && e.target !== e.currentTarget.querySelector('button[type="submit"]')) {
            e.preventDefault();
            console.log('Prevented Enter key form submission');
          }
        }}
      >
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
              <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Template Selection</h3>
                      <p className="text-sm text-gray-600">Confirm the template you&apos;re using for this report</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
                    <h3 className="font-bold text-emerald-700 text-xl mb-2">
                      {(template as { templateTitle?: string })?.templateTitle || "(Untitled Template)"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Template ID: {templateId}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Patient Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Patient Data Toggle */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Patient Data Settings</h3>
                        <p className="text-sm text-gray-600">Configure patient information inclusion</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium text-gray-900">Include patient data in report</Label>
                        <p className="text-sm text-gray-600">Toggle to include name/age/sex/MRN/history in the generated report and DOCX.</p>
                      </div>
                      <Switch checked={includePatient} onCheckedChange={(v) => setValue('includePatient', v)} />
                    </div>
                  </div>
                </div>

                {/* Patient Information Section */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Patient Information</h3>
                        <p className="text-sm text-gray-600">Provide patient details if available</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient.name" className="text-gray-900 font-medium">Patient Name</Label>
                        <Input
                          id="patient.name"
                          {...register('patient.name')}
                          placeholder="John Doe"
                          disabled={!includePatient}
                          className="border-2 border-gray-200 focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient.mrn" className="text-gray-900 font-medium">Medical Record Number</Label>
                        <Input
                          id="patient.mrn"
                          {...register('patient.mrn')}
                          placeholder="MRN123456"
                          disabled={!includePatient}
                          className="border-2 border-gray-200 focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient.age" className="text-gray-900 font-medium">Age</Label>
                        <Input
                          id="patient.age"
                          type="number"
                          {...register('patient.age', { valueAsNumber: true })}
                          placeholder="45"
                          disabled={!includePatient}
                          className="border-2 border-gray-200 focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient.dob" className="text-gray-900 font-medium">Date of Birth</Label>
                        <Input
                          id="patient.dob"
                          {...register('patient.dob')}
                          placeholder="01/01/1980"
                          disabled={!includePatient}
                          className="border-2 border-gray-200 focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient.sex" className="text-gray-900 font-medium">Sex</Label>
                        <Input
                          id="patient.sex"
                          {...register('patient.sex')}
                          placeholder="Male/Female"
                          disabled={!includePatient}
                          className="border-2 border-gray-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Clinical Data */}
            {currentStep === 3 && (
              <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Clinical Information</h3>
                      <p className="text-sm text-gray-600">Provide the clinical details for the report</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="indication" className="text-gray-900 font-medium">Indication / Clinical history (required)</Label>
                    <Textarea
                      id="indication"
                      {...register('indication')}
                      placeholder="Reason for study..."
                      rows={3}
                      className="border-2 border-gray-200 focus:border-emerald-500"
                    />
                    {errors.indication && (
                      <p className="text-sm text-red-600">{errors.indication.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="findings" className="text-gray-900 font-medium">Findings (required)</Label>
                    <Textarea
                      id="findings"
                      {...register('findings')}
                      placeholder="- Bullet 1\n- Bullet 2\nor free text..."
                      rows={6}
                      className="border-2 border-gray-200 focus:border-emerald-500"
                    />
                    {errors.findings && (
                      <p className="text-sm text-red-600">{errors.findings.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technique" className="text-gray-900 font-medium">Technique (optional)</Label>
                    <Input
                      id="technique"
                      {...register('technique')}
                      placeholder="Portal venous phase..."
                      className="border-2 border-gray-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Review & Submit</h3>
                        <p className="text-sm text-gray-600">Review your information before generating the report</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signature.name" className="text-gray-900 font-medium">Signature Name</Label>
                        <Input
                          id="signature.name"
                          {...register('signature.name')}
                          placeholder="Dr. Jane Smith"
                          className="border-2 border-gray-200 focus:border-emerald-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              console.log('Prevented Enter key submission in signature name');
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signature.date" className="text-gray-900 font-medium">Date</Label>
                        <Input
                          id="signature.date"
                          {...register('signature.date')}
                          placeholder={new Date().toLocaleDateString()}
                          className="border-2 border-gray-200 focus:border-emerald-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              console.log('Prevented Enter key submission in signature date');
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                      <h4 className="font-bold mb-4 text-gray-900 text-lg">Report Summary</h4>
                      <div className="text-sm space-y-2 text-gray-700">
                        <p><strong>Template:</strong> {(template as { templateTitle?: string })?.templateTitle || "(Untitled Template)"}</p>
                        <p><strong>Patient Data:</strong> {includePatient ? 'Included' : 'Not included'}</p>
                        <p><strong>Indication:</strong> {watch('indication') || 'Not provided'}</p>
                        <p><strong>Findings:</strong> {watch('findings') ? `${watch('findings').length} characters` : 'Not provided'}</p>
                      </div>
                    </div>
                    
                    {/* Ready to Generate Notice */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        <div>
                          <h4 className="font-bold text-emerald-900">Ready to Generate</h4>
                          <p className="text-sm text-emerald-700">
                            Review your information above and click the &quot;Generate Report&quot; button below to create your report.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
            className="flex items-center gap-2 border-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2"
                onClick={() => {
                  console.log('Generate Report button clicked - setting intentional submit');
                  setIntentionalSubmit(true);
                }}
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
