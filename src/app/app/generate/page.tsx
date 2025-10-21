"use client"

import { useState, useEffect, useCallback } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { generateFormSchema, GenerateFormValues } from '@/lib/schemas'
import { httpGet } from '@/lib/http'
import { enqueueJob } from '@/lib/jobs'
import { buildSigninWithNext } from '@/lib/redirect'
import { toast } from 'sonner'
import { ArrowLeft, User, AlertCircle, FileText, Stethoscope, CheckCircle, ChevronLeft, ChevronRight, Eye, RotateCcw } from 'lucide-react'
import { useAuthToken } from '@/hooks/useAuthToken';
import { useAuth } from '@/components/auth-provider';
import { fetchUserData, userDataQueryConfig } from '@/lib/user-data';
import { useFormDraft } from '@/hooks/useFormDraft';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { celebrateSuccess } from '@/lib/confetti';
import { VoiceInput } from '@/components/VoiceInput';
import { UpgradePromptModal } from '@/components/UpgradePromptModal';
import type { SubscriptionTier } from '@/types/transcription';

export const dynamic = 'force-dynamic';

// Usage data interface
interface UsageData {
  subscription: {
    reports_used: number;
    reports_limit: number;
  };
}

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
  const { user } = useAuth();
  const templateId = resolveTemplateId(searchParams);
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [intentionalSubmit, setIntentionalSubmit] = useState(false)

  // Voice dictation state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'trial_exhausted' | 'tier_blocked' | 'daily_limit'>('tier_blocked')
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free')

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

  // Fetch user profile for defaults
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const userProfile = await fetchUserData(user.id)
      return {
        ...userProfile,
        email: user.email || ''
      }
    },
    enabled: !!user,
    ...userDataQueryConfig
  })

  // Fetch usage data to check limits
  const { data: usage } = useQuery({
    queryKey: ['subscription-usage'],
    queryFn: () => httpGet<UsageData>('/v1/subscription/usage'),
    enabled: !!user,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isDirty, isSubmitting: formIsSubmitting },
  } = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    mode: 'onBlur', // Validate on blur for earlier feedback
    reValidateMode: 'onChange', // Re-validate on change after first blur
    defaultValues: {
      templateId: templateId || '',
      includePatient: true,
      patient: { name: '', mrn: '', age: undefined, sex: undefined },
      indication: '',
      findings: '',
      technique: '',
      signature: {
        name: '',
        date: new Date().toLocaleDateString(),
      },
    },
  })

  // Auto-save form draft to localStorage
  const { restoreDraft, clearDraft } = useFormDraft({
    key: `generate-${templateId || 'default'}`,
    watch,
    setValue,
    enabled: true,
  })

  // State for draft restoration
  const [showDraftNotification, setShowDraftNotification] = useState(false)
  const [draftData, setDraftData] = useState<Partial<GenerateFormValues> | null>(null)

  // Check for draft on mount
  useEffect(() => {
    const draft = restoreDraft()
    if (draft && draft.data) {
      setDraftData(draft.data)
      setShowDraftNotification(true)
    }
  }, [restoreDraft])

  // Update form defaults when profile loads
  useEffect(() => {
    if (profile) {
      const formattedDate = profile.default_signature_date_format 
        ? new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          }).replace(/\//g, profile.default_signature_date_format.includes('/') ? '/' : '-')
        : new Date().toLocaleDateString();

      console.log('Setting form defaults from profile:', {
        default_signature_name: profile.default_signature_name,
        default_signature_date_format: profile.default_signature_date_format,
        formattedDate
      });

      reset({
        templateId: templateId || '',
        includePatient: true,
        patient: { name: '', mrn: '', age: undefined, sex: undefined },
        indication: '',
        findings: '',
        technique: '',
        signature: {
          name: profile.default_signature_name || '',
          date: formattedDate,
        },
      });
    }
  }, [profile, reset, templateId]);

  // Debug: Track form state changes
  useEffect(() => {
    console.log('Form state changed:', { isValid, formIsSubmitting, currentStep });
  }, [isValid, formIsSubmitting, currentStep]);


  // Debug: Track step changes
  useEffect(() => {
    console.log('Step changed to:', currentStep);
    // Reset intentional submit flag when step changes
    setIntentionalSubmit(false);
    if (currentStep === 4) {
      console.log('Reached step 4 - checking if form submission is triggered');
    }
  }, [currentStep]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if form has unsaved changes and we haven't just submitted
      if (isDirty && !formIsSubmitting) {
        e.preventDefault()
        // Modern browsers ignore custom messages, but we still need to set returnValue
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, formIsSubmitting])

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

  // Memoized callback for voice transcript to prevent React error #185
  const handleVoiceTranscript = useCallback((text: string) => {
    const currentFindings = watch('findings') || '';
    const newFindings = currentFindings
      ? `${currentFindings} ${text}`
      : text;
    setValue('findings', newFindings, { shouldValidate: true });
  }, [watch, setValue]);

  // Memoized callback for voice error handling
  const handleVoiceError = useCallback((errorMsg: string) => {
    toast.error(errorMsg);

    // Check if we should show upgrade modal
    if (errorMsg.includes('trial') || errorMsg.includes('upgrade') || errorMsg.includes('Starter')) {
      // Determine upgrade reason from error message
      if (errorMsg.includes('trial')) {
        setUpgradeReason('trial_exhausted');
      } else if (errorMsg.includes('daily limit')) {
        setUpgradeReason('daily_limit');
      } else {
        setUpgradeReason('tier_blocked');
      }
      setShowUpgradeModal(true);
    }
  }, []);

  // Memoized callback for upgrade required
  const handleUpgradeRequired = useCallback((tier: SubscriptionTier) => {
    setCurrentTier(tier);
    setUpgradeReason('tier_blocked');
    setShowUpgradeModal(true);
  }, []);

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

    // Check usage limit before generating report
    if (usage?.subscription && usage.subscription.reports_used >= usage.subscription.reports_limit) {
      setError('You have reached your monthly report limit. Please upgrade your plan or wait for the next billing cycle.')
      toast.error('Usage limit reached. Please upgrade to continue generating reports.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Build patient object (always included now)
      const patient = {
        name: data.patient.name || undefined,
        mrn: data.patient.mrn || undefined,
        age: data.patient.age ?? undefined,
        sex: data.patient.sex || undefined, // Now using string directly
      }

      // Build payload for enqueueJob - flattened structure
      const payload = {
        templateId: templateId || data.templateId,
        indication: data.indication,
        findings: data.findings,
        impression: data.indication, // mapping indication to impression
        technique: data.technique,
        patient: patient,
        signature: data.signature,
      }

      console.debug('Creating job with:', payload)

      // Enqueue the job using new API helper
      const createResp = await enqueueJob(payload)
      const jobId = createResp.job_id

      // Clear the draft after successful submission
      clearDraft()

      // Trigger success celebration
      celebrateSuccess()

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

      // Handle different error types with specific, actionable messages
      let errorMessage = 'Failed to start report generation'

      if (err && typeof err === 'object' && 'status' in err) {
        const status = (err as { status: number }).status

        if (status === 401) {
          toast.error('Session expired. Please sign in again.')
          const current = window.location.pathname + window.location.search
          window.location.href = buildSigninWithNext(current)
          return
        } else if (status === 403) {
          errorMessage = 'You don\'t have permission to generate reports. Please check your subscription.'
        } else if (status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.'
        } else if (status === 404) {
          errorMessage = 'Template not found. Please select a different template.'
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again in a few moments.'
        }
      }

      // Check for quota errors in message
      if (err instanceof Error && (err.message.includes('quota') || err.message.includes('limit'))) {
        errorMessage = 'Monthly report limit reached. Please upgrade your plan to continue.'
      }

      // Check for network errors
      if (err instanceof Error && (err.message.includes('fetch') || err.message.includes('network'))) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }

      // Fallback to error message if it's more specific
      if (err instanceof Error && err.message && err.message.length > 10) {
        errorMessage = err.message
      }

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
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Templates', href: '/app/templates' },
          { label: 'Generate Report' }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/app/dashboard')}
          className="gap-2"
          aria-label="Go back to dashboard"
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
          {/* Mobile: Simplified progress dots */}
          <div className="flex sm:hidden justify-center gap-2 mb-4">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className={`h-2 rounded-full transition-all ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-r from-emerald-500 to-violet-500 w-8'
                    : 'bg-gray-300 w-6'
                }`}
                layout
              />
            ))}
          </div>

          {/* Desktop: Full step indicator */}
          <div className="hidden sm:flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
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
                  <div key={step.id} className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all touch-target ${
                      isActive || isCompleted
                        ? "bg-gradient-to-br from-emerald-500 to-violet-500 text-white shadow-lg"
                        : "bg-white border-2 border-gray-300 text-gray-400"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-7 h-7" />
                      ) : (
                        <step.icon className="w-7 h-7" />
                      )}
                    </div>
                    <span className={`text-sm font-medium text-center ${
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

      {/* Draft Restoration Notification */}
      {showDraftNotification && draftData && (
        <Alert className="bg-blue-50 border-blue-200">
          <RotateCcw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-900">
              We found a saved draft from your previous session. Would you like to restore it?
            </span>
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowDraftNotification(false)
                  setDraftData(null)
                  clearDraft()
                }}
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  Object.entries(draftData).forEach(([key, value]) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setValue(key as any, value, { shouldValidate: false })
                  })
                  setShowDraftNotification(false)
                  toast.success('Draft restored successfully')
                }}
              >
                Restore Draft
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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

      {/* Usage Limit Warning */}
      {usage?.subscription && usage.subscription.reports_used >= usage.subscription.reports_limit && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Monthly Limit Reached</h3>
                <p className="text-sm text-red-700 mb-3">
                  You have used {usage.subscription.reports_used} of {usage.subscription.reports_limit} reports this month. 
                  Please upgrade your plan to continue generating reports.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => router.push('/pricing')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Upgrade Plan
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/app/dashboard')}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Patient Information</h3>
                      <p className="text-sm text-gray-600">Provide patient details (age and sex are required)</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient.name" className="text-gray-900 font-medium">Patient Name (optional)</Label>
                      <Input
                        id="patient.name"
                        inputMode="text"
                        autoCapitalize="words"
                        autoComplete="name"
                        {...register('patient.name')}
                        placeholder="John Doe"
                        className="border-2 border-gray-200 focus:border-emerald-500 input-mobile"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient.mrn" className="text-gray-900 font-medium">Medical Record Number (optional)</Label>
                      <Input
                        id="patient.mrn"
                        inputMode="text"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        {...register('patient.mrn')}
                        placeholder="MRN123456"
                        className="border-2 border-gray-200 focus:border-emerald-500 input-mobile"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient.age" className="text-gray-900 font-medium">Age (required)</Label>
                      <Input
                        id="patient.age"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        {...register('patient.age', { valueAsNumber: true })}
                        placeholder="45"
                        className="border-2 border-gray-200 focus:border-emerald-500 input-mobile"
                      />
                      {errors.patient?.age && (
                        <p className="text-sm text-red-600">{errors.patient.age.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient.sex" className="text-gray-900 font-medium">Sex</Label>
                      <Select 
                        value={watch('patient.sex') || ''} 
                        onValueChange={(value) => setValue('patient.sex', value as 'M' | 'F' | 'O')}
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-emerald-500">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                          <SelectItem value="O">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.patient?.sex && (
                        <p className="text-sm text-red-600">{errors.patient.sex.message}</p>
                      )}
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
                <TooltipProvider>
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="indication" className="text-gray-900 font-medium">Indication / Clinical history (required)</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="inline-flex items-center justify-center" type="button">
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>The clinical reason for ordering this study. Include relevant symptoms, prior diagnoses, or follow-up information.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id="indication"
                        inputMode="text"
                        autoCapitalize="sentences"
                        {...register('indication')}
                        placeholder="Reason for study..."
                        rows={3}
                        className="border-2 border-gray-200 focus:border-emerald-500 textarea-mobile"
                      />
                      {errors.indication && (
                        <p className="text-sm text-red-600">{errors.indication.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="findings" className="text-gray-900 font-medium">Findings (required)</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="inline-flex items-center justify-center" type="button">
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Your radiological observations. Can be bulleted or free text. This will be organized into the findings section of the report.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id="findings"
                        inputMode="text"
                        autoCapitalize="sentences"
                        {...register('findings')}
                        placeholder="- Bullet 1\n- Bullet 2\nor free text..."
                        rows={6}
                        className="border-2 border-gray-200 focus:border-emerald-500 textarea-mobile"
                      />
                      {errors.findings && (
                        <p className="text-sm text-red-600">{errors.findings.message}</p>
                      )}

                      {/* Voice Input Integration */}
                      <VoiceInput
                        onTranscript={handleVoiceTranscript}
                        onError={handleVoiceError}
                        onUpgradeRequired={handleUpgradeRequired}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technique" className="text-gray-900 font-medium">Technique (optional)</Label>
                      <Input
                        id="technique"
                        inputMode="text"
                        autoCapitalize="sentences"
                        {...register('technique')}
                        placeholder="Portal venous phase..."
                        className="border-2 border-gray-200 focus:border-emerald-500 input-mobile"
                      />
                    </div>
                  </div>
                </TooltipProvider>
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
                        {errors.signature?.name && (
                          <p className="text-red-500 text-sm">{errors.signature.name.message}</p>
                        )}
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
                        {errors.signature?.date && (
                          <p className="text-red-500 text-sm">{errors.signature.date.message}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                      <h4 className="font-bold mb-4 text-gray-900 text-lg">Report Summary</h4>
                      <div className="text-sm space-y-2 text-gray-700">
                        <p><strong>Template:</strong> {(template as { templateTitle?: string })?.templateTitle || "(Untitled Template)"}</p>
                        <p><strong>Patient Data:</strong> Included</p>
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

        {/* Navigation - Sticky on mobile */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t md:static md:border-0 p-4 md:p-0 mt-6 flex items-center justify-between z-20 safe-bottom">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 border-2 touch-target btn-mobile"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-4">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 touch-target btn-mobile"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || formIsSubmitting || (usage?.subscription && usage.subscription.reports_used >= usage.subscription.reports_limit)}
                className="btn-primary flex items-center gap-2 touch-target btn-mobile"
                onClick={() => {
                  console.log('Generate Report button clicked - setting intentional submit');
                  setIntentionalSubmit(true);
                }}
              >
                {isSubmitting || formIsSubmitting ? 'Generating...' : 'Generate Report'}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={currentTier}
        reason={upgradeReason}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          router.push('/pricing');
        }}
      />
    </div>
  )
}
