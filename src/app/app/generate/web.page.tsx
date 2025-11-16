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
import { FormField } from '@/components/ui/form-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generateFormSchema, GenerateFormValues } from '@/lib/schemas'
import { httpGet } from '@/lib/http'
import { enqueueJob } from '@/lib/jobs'
import { buildSigninWithNext } from '@/lib/redirect'
import { toast } from 'sonner'
import { ArrowLeft, User, AlertCircle, FileText, Stethoscope, CheckCircle, ChevronLeft, ChevronRight, Eye, RotateCcw, Loader2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

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

  const { data: template, isLoading: templateLoading, error: templateError } = useQuery({
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
    trigger,
    formState: { errors, isDirty, isSubmitting: formIsSubmitting },
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
  // Reset intentional submit when step changes
  useEffect(() => {
    setIntentionalSubmit(false);
  }, [currentStep]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if form has unsaved changes and we haven't just submitted
      // Also don't warn if user intentionally submitted the form
      if (isDirty && !formIsSubmitting && !intentionalSubmit && !isSubmitting) {
        e.preventDefault()
        // Modern browsers ignore custom messages, but we still need to set returnValue
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, formIsSubmitting, intentionalSubmit, isSubmitting])

  const handleNext = useCallback(async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const valid = await trigger(['patient.age', 'patient.sex'], { shouldFocus: true });
      if (!valid) {
        toast.error('Please complete the required patient details before continuing.');
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      const valid = await trigger(['indication', 'findings'], { shouldFocus: true });
      if (!valid) {
        toast.error('Clinical information is required to continue.');
        return;
      }
      setCurrentStep(4);
    }
  }, [currentStep, trigger]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  // Memoized callback for voice transcript to prevent React error #185
  const handleVoiceTranscript = useCallback(
    (text: string) => {
      const currentFindings = (watch('findings') || '').trimEnd();
      const separator = currentFindings ? '\n\n' : '';
      const newFindings = `${currentFindings}${separator}${text}`;
      setValue('findings', newFindings, { shouldValidate: true, shouldDirty: true });
    },
    [watch, setValue]
  );

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

  // Redirect users to template picker when no template is provided
  useEffect(() => {
    if (!templateId) {
      router.replace('/app/templates');
    }
  }, [templateId, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (templateId) {
      localStorage.setItem('recent-template-id', templateId);
    }
  }, [templateId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const title =
      template &&
      typeof template === 'object' &&
      template !== null &&
      'templateTitle' in template &&
      typeof (template as { templateTitle?: unknown }).templateTitle === 'string'
        ? (template as { templateTitle: string }).templateTitle
        : null;
    if (templateId && title) {
      localStorage.setItem('recent-template-name', title);
    }
  }, [templateId, template]);

  const templateInfo = (template && typeof template === 'object'
    ? template
    : {}) as {
    templateTitle?: string;
    modality?: string;
    anatomy?: string;
    body_system?: string;
  };

  if (!templateId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Redirecting you to Templates…</p>
        </div>
      </div>
    );
  }

  if (templateLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading template details…</p>
        </div>
      </div>
    );
  }

  if (templateError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="aurora-card w-full max-w-md border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.12)] p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-[#FFD1D1]" />
          <h2 className="mb-2 text-lg font-semibold text-white">Unable to load template</h2>
          <p className="text-sm text-[rgba(255,209,209,0.8)]">
            We couldn&apos;t load the selected template. It may have been removed or you may no longer have access.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push('/app/templates')}
              className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.75)] px-5 text-[rgba(207,207,207,0.85)] hover:border-[rgba(75,142,255,0.45)] hover:bg-[rgba(75,142,255,0.18)] hover:text-white"
            >
              Browse templates
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.75)] px-5 text-[rgba(207,207,207,0.85)] hover:border-[rgba(75,142,255,0.45)] hover:bg-[rgba(75,142,255,0.18)] hover:text-white"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }


  const onSubmit = async (data: GenerateFormValues) => {
    // Prevent submission if not on step 4 or not intentional
    if (currentStep !== 4 || !intentionalSubmit) {
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
        sex: data.patient.sex || undefined,
      }

      // Build payload for enqueueJob - flattened structure
      const payload = {
        templateId: templateId || data.templateId,
        indication: data.indication,
        findings: data.findings,
        impression: data.indication, // mapping indication to impression
        technique: data.technique || '',
        patient: patient,
        signature: data.signature,
      }

      // Enqueue the job using new API helper
      const createResp = await enqueueJob(payload)
      const jobId = createResp.job_id

      // Clear the draft after successful submission
      clearDraft()

      // Trigger success celebration (fire and forget)
      celebrateSuccess().catch(console.error)

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
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Failed to update localStorage:', e)
        }
      }
      
      // Store job ID in session storage
      sessionStorage.setItem('radly:lastJobId', jobId)

      // Navigate to the report detail page
      toast.success('Report generation started!')
      router.push(`/app/report/${jobId}`)

    } catch (err: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Generate error:', err)
      }

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
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      <main className="mx-auto max-w-5xl space-y-6 sm:space-y-8 px-4 sm:px-6 py-10 sm:py-12 pb-28">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Templates', href: '/app/templates' },
          { label: 'Generate Report' }
        ]}
      />

      <div className="neon-shell space-y-6 p-6 sm:p-8 md:p-10 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/app/templates')}
            className="gap-2 text-[rgba(207,207,207,0.78)] hover:text-white"
            aria-label="Go back to templates"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">Generate Report</h1>
          <div className="w-24" />
        </div>

        {/* Clean Step Indicator */}
        <Card className="aurora-card border border-[rgba(255,255,255,0.08)] text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex sm:hidden justify-center gap-2 mb-4">
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  className={`h-2 rounded-full transition-all ${
                    currentStep >= step.id
                      ? 'bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_50%,#8F82FF_100%)] w-8'
                      : 'bg-[rgba(207,207,207,0.25)] w-6'
                  }`}
                  layout
                />
              ))}
            </div>

            <div className="hidden sm:flex items-center justify-between relative">
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-[rgba(207,207,207,0.18)]">
                <motion.div
                  className="h-full bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_60%,#8F82FF_100%)]"
                  animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="relative z-10 flex w-full items-center justify-between">
                {steps.map((step) => {
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-full border transition-all",
                          isActive || isCompleted
                            ? "border-[rgba(75,142,255,0.45)] bg-[linear-gradient(135deg,#2653FF,#8F82FF)] text-white shadow-[0_18px_42px_rgba(31,64,175,0.4)]"
                            : "border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.85)] text-[rgba(207,207,207,0.5)]"
                        )}
                      >
                        <step.icon className="h-6 w-6" />
                      </div>
                      <span className={cn("text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.5)]", isActive && "text-white")}>
                        {step.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing content continues */}
      </div>
      {/* Draft Restoration Notification */}
      {showDraftNotification && draftData && (
        <div className="aurora-card border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.12)] p-4 sm:p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <RotateCcw className="h-5 w-5 text-[#4B8EFF] flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-white break-words">
                We found a saved draft from your previous session. Would you like to restore it?
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 sm:flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowDraftNotification(false)
                  setDraftData(null)
                  clearDraft()
                }}
                className="flex-1 sm:flex-none min-h-[44px] rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.78)] text-[rgba(207,207,207,0.85)] hover:border-[rgba(255,255,255,0.3)] hover:text-white"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  Object.entries(draftData).forEach(([key, value]) => {
                    // Dynamic form field restoration from draft - safe to use 'any' for value
                    setValue(key as keyof GenerateFormValues, value as never, { shouldValidate: false })
                  })
                  setShowDraftNotification(false)
                  toast.success('Draft restored successfully')
                }}
                className="flex-1 sm:flex-none min-h-[44px] rounded-lg bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_100%)] text-white shadow-[0_12px_28px_rgba(75,142,255,0.32)]"
              >
                Restore
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-2xl border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.12)] p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#FFD1D1]" />
            <div>
              <h3 className="text-sm font-semibold text-white">Error</h3>
              <p className="text-sm text-[rgba(255,209,209,0.85)]">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Limit Warning */}
      {usage?.subscription && usage.subscription.reports_used >= usage.subscription.reports_limit && (
        <Card className="aurora-card border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.12)]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#FFD1D1] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="mb-1 text-base font-semibold text-white">Monthly Limit Reached</h3>
                <p className="mb-3 text-sm text-[rgba(255,209,209,0.8)]">
                  You have used {usage.subscription.reports_used} of {usage.subscription.reports_limit} reports this month.
                  Upgrade your plan to continue generating reports immediately.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => router.push('/pricing')}
                    className="rounded-lg bg-[linear-gradient(90deg,#FF6B6B_0%,#FF9F6B_100%)] px-4 text-white shadow-[0_12px_28px_rgba(255,107,107,0.32)]"
                  >
                    Upgrade Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push('/app/dashboard')}
                    className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.78)] px-4 text-[rgba(207,207,207,0.85)] hover:border-[rgba(255,255,255,0.3)] hover:text-white"
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
          if (e.key !== 'Enter') return;
          const target = e.target as HTMLElement;
          if (target instanceof HTMLTextAreaElement) return;
          if (target instanceof HTMLButtonElement) return;
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          if (target instanceof HTMLInputElement && target.type !== 'submit') {
            e.preventDefault();
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Template Selection */}
            {currentStep === 1 && (
              <div className="aurora-card border border-[rgba(255,255,255,0.08)] overflow-hidden">
                <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.78)] px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#2653FF,#8F82FF)] shadow-[0_14px_32px_rgba(31,64,175,0.35)] flex-shrink-0">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white">Template Selection</h3>
                      <p className="text-xs sm:text-sm text-[rgba(207,207,207,0.65)]">Confirm the template you&apos;re using for this report.</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="max-w-2xl mx-auto">
                    <div className="rounded-2xl border border-[rgba(75,142,255,0.3)] bg-[rgba(12,16,28,0.65)] p-5 sm:p-6 text-center">
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                        {templateInfo.templateTitle || "(Untitled Template)"}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-[#D7E3FF] mb-6">
                        {templateInfo.modality && (
                          <span className="rounded-full bg-[rgba(75,142,255,0.18)] px-3 py-1.5 font-semibold">
                            {templateInfo.modality}
                          </span>
                        )}
                        {templateInfo.body_system && (
                          <span className="rounded-full bg-[rgba(75,142,255,0.18)] px-3 py-1.5 font-semibold">
                            {templateInfo.body_system}
                          </span>
                        )}
                        {templateInfo.anatomy && (
                          <span className="rounded-full bg-[rgba(75,142,255,0.18)] px-3 py-1.5 font-semibold">
                            {templateInfo.anatomy}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.72)] px-5 py-2 text-[rgba(207,207,207,0.8)] hover:border-[rgba(75,142,255,0.45)] hover:bg-[rgba(75,142,255,0.18)] hover:text-white min-h-[44px]"
                        onClick={() => router.push('/app/templates')}
                      >
                        Change template
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Patient Information */}
            {currentStep === 2 && (
              <div className="aurora-card border border-[rgba(255,255,255,0.08)] overflow-hidden">
                <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.78)] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3FBF8C,#6EE7B7)] text-white shadow-[0_14px_32px_rgba(63,191,140,0.35)]">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Patient Information</h3>
                      <p className="text-sm text-[rgba(207,207,207,0.65)]">Provide patient details (age and sex are required).</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      label="Patient Name"
                      optional
                      htmlFor="patient.name"
                      error={errors.patient?.name?.message}
                    >
                      <Input
                        id="patient.name"
                        inputMode="text"
                        autoCapitalize="words"
                        autoComplete="name"
                        {...register('patient.name')}
                        placeholder="John Doe"
                        className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white placeholder:text-[rgba(207,207,207,0.35)] focus:border-[rgba(75,142,255,0.45)] input-mobile"
                      />
                    </FormField>
                    <FormField
                      label="Medical Record Number"
                      optional
                      htmlFor="patient.mrn"
                      error={errors.patient?.mrn?.message}
                    >
                      <Input
                        id="patient.mrn"
                        inputMode="text"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        {...register('patient.mrn')}
                        placeholder="MRN123456"
                        className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white placeholder:text-[rgba(207,207,207,0.35)] focus:border-[rgba(75,142,255,0.45)] input-mobile"
                      />
                    </FormField>
                    <FormField
                      label="Age"
                      required
                      htmlFor="patient.age"
                      error={errors.patient?.age?.message}
                    >
                      <Input
                        id="patient.age"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        {...register('patient.age', { valueAsNumber: true })}
                        placeholder="45"
                        className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white placeholder:text-[rgba(207,207,207,0.35)] focus:border-[rgba(75,142,255,0.45)] input-mobile"
                      />
                    </FormField>
                    <FormField
                      label="Sex"
                      required
                      htmlFor="patient.sex"
                      error={errors.patient?.sex?.message}
                    >
                      <Select
                        value={watch('patient.sex') || ''}
                        onValueChange={(value) =>
                          setValue('patient.sex', value as 'M' | 'F' | 'O', { shouldValidate: true })
                        }
                      >
                        <SelectTrigger
                          id="patient.sex"
                          className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white focus:border-[rgba(75,142,255,0.45)]"
                        >
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,14,24,0.95)] text-white">
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                          <SelectItem value="O">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Clinical Data */}
            {currentStep === 3 && (
              <div className="aurora-card border border-[rgba(255,255,255,0.08)] overflow-hidden">
                <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.78)] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#4B8EFF,#8F82FF)] text-white shadow-[0_14px_32px_rgba(31,64,175,0.35)]">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Clinical Information</h3>
                      <p className="text-sm text-[rgba(207,207,207,0.65)]">Provide the clinical details for the report.</p>
                    </div>
                  </div>
                </div>

                <TooltipProvider>
                  <div className="space-y-4 p-5 sm:p-6 sm:space-y-6">
                    <FormField
                      label="Indication / Clinical History"
                      required
                      htmlFor="indication"
                      error={errors.indication?.message}
                      helpText="The clinical reason for ordering this study. Include relevant symptoms, prior diagnoses, or follow-up information."
                    >
                      <div className="flex items-start gap-2">
                        <Textarea
                          id="indication"
                          inputMode="text"
                          autoCapitalize="sentences"
                          {...register('indication')}
                          placeholder="Reason for study..."
                          rows={3}
                          className="flex-1 border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white placeholder:text-[rgba(207,207,207,0.35)] focus:border-[rgba(75,142,255,0.45)] textarea-mobile"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="inline-flex items-center justify-center flex-shrink-0 mt-0.5" type="button">
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>The clinical reason for ordering this study. Include relevant symptoms, prior diagnoses, or follow-up information.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </FormField>

                    <FormField
                      label="Findings"
                      required
                      htmlFor="findings"
                      error={errors.findings?.message}
                      helpText="Your radiological observations. Can be bulleted or free text. This will be organized into the findings section of the report."
                    >
                      <div className="space-y-2">
                        <Textarea
                          id="findings"
                          inputMode="text"
                          autoCapitalize="sentences"
                          {...register('findings')}
                          placeholder="Enter your findings here. You can type bullet points, write in free text format, or use voice dictation."
                          rows={6}
                          className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white placeholder:text-[rgba(207,207,207,0.35)] focus:border-[rgba(75,142,255,0.45)] textarea-mobile"
                        />
                        <p className="text-xs text-[rgba(207,207,207,0.45)]">Tip: Press Enter for a new line, or use the Voice Dictation button below for hands-free input.</p>

                        {/* Voice Input Integration */}
                        <VoiceInput
                          onTranscript={handleVoiceTranscript}
                          onError={handleVoiceError}
                          onUpgradeRequired={handleUpgradeRequired}
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Technique"
                      optional
                      htmlFor="technique"
                      error={errors.technique?.message}
                    >
                      <Input
                        id="technique"
                        inputMode="text"
                        autoCapitalize="sentences"
                        {...register('technique')}
                        placeholder="Portal venous phase..."
                        className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white placeholder:text-[rgba(207,207,207,0.35)] focus:border-[rgba(75,142,255,0.45)] input-mobile"
                      />
                    </FormField>
                  </div>
                </TooltipProvider>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="aurora-card border border-[rgba(255,255,255,0.08)] overflow-hidden">
                  <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.78)] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#F8B74D,#FF6B6B)] text-white shadow-[0_14px_32px_rgba(255,155,80,0.35)]">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Review &amp; Submit</h3>
                        <p className="text-sm text-[rgba(207,207,207,0.65)]">Review your information before generating the report.</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        label="Signature Name"
                        optional
                        htmlFor="signature.name"
                        error={errors.signature?.name?.message}
                      >
                        <Input
                          id="signature.name"
                          {...register('signature.name')}
                          placeholder="Dr. Jane Smith"
                          className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white placeholder:text-[rgba(207,207,207,0.35)] focus:border-[rgba(75,142,255,0.45)]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormField>
                      <FormField
                        label="Date"
                        optional
                        htmlFor="signature.date"
                        error={errors.signature?.date?.message}
                      >
                        <Input
                          id="signature.date"
                          {...register('signature.date')}
                          placeholder={new Date().toLocaleDateString()}
                          className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white placeholder:text-[rgba(207,207,207,0.35)] focus:border-[rgba(75,142,255,0.45)]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormField>
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-6 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.65)] p-6">
                      <h4 className="mb-4 text-lg font-semibold text-white">Report Summary</h4>
                      <div className="space-y-3 text-sm text-[rgba(207,207,207,0.7)]">
                        <div>
                          <span className="text-white font-medium">Template:</span>
                          <p className="mt-1">{templateInfo.templateTitle || "(Untitled Template)"}</p>
                        </div>
                        <div>
                          <span className="text-white font-medium">Patient Data:</span>
                          <p className="mt-1">Included</p>
                        </div>
                        <div>
                          <span className="text-white font-medium">Indication:</span>
                          <p className="mt-1 whitespace-pre-wrap break-words">{watch('indication') || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-white font-medium">Findings:</span>
                          <p className="mt-1 whitespace-pre-wrap break-words">{watch('findings') || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ready to Generate Notice */}
                    <div className="mt-6 rounded-2xl border border-[rgba(75,142,255,0.35)] bg-[rgba(12,16,28,0.6)] p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-[#7AE7B4]" />
                        <div>
                          <h4 className="font-semibold text-white">Ready to Generate</h4>
                          <p className="text-sm text-[rgba(207,207,207,0.7)]">
                            Review the details above and click “Generate Report” when you&apos;re ready.
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

        <div className="fixed bottom-0 left-0 right-0 mt-6 flex items-center justify-between bg-[rgba(6,10,18,0.98)] backdrop-blur-md px-4 py-3 text-white md:static md:bg-transparent md:p-0 md:mt-6 z-20 safe-area-inset-bottom">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center justify-center rounded-full w-12 h-12 bg-[rgba(18,22,36,0.8)] border border-[rgba(255,255,255,0.12)] text-white hover:bg-[rgba(75,142,255,0.2)] hover:border-[rgba(75,142,255,0.4)] transition-all",
              currentStep === 1 && "opacity-40 cursor-not-allowed"
            )}
            aria-label="Previous step"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center justify-center rounded-full w-12 h-12 bg-[#2653FF] hover:bg-[#4B8EFF] text-white transition-all"
                aria-label="Next step"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || formIsSubmitting || (usage?.subscription && usage.subscription.reports_used >= usage.subscription.reports_limit)}
                className="flex items-center justify-center gap-2 rounded-full px-6 h-12 bg-[#3FBF8C] hover:bg-[#6EE7B7] text-white font-semibold transition-all disabled:opacity-60"
                onClick={() => {
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

      {(isSubmitting || formIsSubmitting) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(4,8,18,0.95)] backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 rounded-3xl border border-[rgba(75,142,255,0.3)] bg-gradient-to-br from-[rgba(12,16,28,0.98)] to-[rgba(5,8,16,0.95)] px-8 py-10 text-center shadow-2xl">
            {/* Simple animated background glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[rgba(75,142,255,0.08)] to-transparent opacity-50 pointer-events-none" />

            <div className="relative space-y-6">
              {/* Spinner */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(75,142,255,0.3)] bg-[rgba(12,16,28,0.9)] shadow-lg">
                <div className="h-12 w-12 rounded-full border-3 border-[rgba(143,130,255,0.3)] border-t-[rgba(143,130,255,0.9)] animate-spin" style={{ borderWidth: '3px' }} />
              </div>

              {/* Text content */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(207,207,207,0.5)]">
                  Assistant at work
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Generating your radiology report
                </h2>
                <p className="text-sm text-[rgba(207,207,207,0.75)] max-w-sm mx-auto">
                  Radly is aligning findings, impressions, and follow-up recommendations. You&apos;ll review the draft in just a moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  )
}
