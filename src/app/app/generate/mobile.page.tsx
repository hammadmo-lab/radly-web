'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Menu,
  Settings,
  LogOut,
  User as UserIcon,
  Activity,
  BookTemplate,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle,
  User,
  Stethoscope,
  X,
  Eye,
  ChevronLeft,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { useSubscription } from '@/hooks/useSubscription'
import { fetchTemplates } from '@/lib/templates'
import { httpGet } from '@/lib/http'
import { enqueueJob } from '@/lib/jobs'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { celebrateSuccess } from '@/lib/confetti'
import { useAuthToken } from '@/hooks/useAuthToken'
import { VoiceInput } from '@/components/VoiceInput'
import { usePlatform } from '@/hooks/usePlatform'

type GenderCode = '' | 'M' | 'F' | 'O'

const GENDER_LABELS: Record<Exclude<GenderCode, ''>, string> = {
  M: 'Male',
  F: 'Female',
  O: 'Other'
}

const formatGender = (gender: GenderCode) => (gender ? GENDER_LABELS[gender] : '')

const toGenderCode = (value: string): GenderCode => {
  const normalized = value?.trim().toUpperCase()
  if (!normalized) return ''
  if (normalized === 'M' || normalized === 'MALE') return 'M'
  if (normalized === 'F' || normalized === 'FEMALE') return 'F'
  if (normalized === 'O' || normalized === 'OTHER') return 'O'
  return ''
}

interface PatientData {
  name: string
  age: string
  gender: GenderCode
  mrn?: string
  history?: string
  facility?: string
  referringDoctor?: string
}

interface SignatureData {
  name: string
  date: string
}

interface DraftData {
  templateId: string
  templateName: string
  patient: PatientData
  indication: string
  findings: string
  signature?: SignatureData
  updatedAt: number
}

export default function MobileGeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signOut } = useAuth()
  const { data: subscriptionData } = useSubscription()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showTemplateSheet, setShowTemplateSheet] = useState(false)
  const [showPatientSheet, setShowPatientSheet] = useState(false)
  const [showReviewSheet, setShowReviewSheet] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false)
  const [signatureData, setSignatureData] = useState<SignatureData>({
    name: '',
    date: new Date().toLocaleDateString()
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const patientSheetRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [showTranscriptionPreview, setShowTranscriptionPreview] = useState(false)
  const [pendingTranscription, setPendingTranscription] = useState('')

  // Remove legacy draft entries that used timestamped keys
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('draft_'))
        .forEach((key) => localStorage.removeItem(key))
    } catch (cleanupError) {
      console.error('Failed to clean legacy drafts:', cleanupError)
    }
  }, [])

  // Detect keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const vh = window.visualViewport.height
        const keyboardH = window.innerHeight - vh
        setKeyboardHeight(Math.max(keyboardH, 0))
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])

  // Auto-scroll to input when keyboard appears
  const scrollToInput = (inputElement: HTMLInputElement | null) => {
    if (!inputElement || !patientSheetRef.current) return

    setTimeout(() => {
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  // Auto-expand textarea function
  const autoExpandTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    const scrollHeight = Math.min(textarea.scrollHeight, 400) // Max 400px
    textarea.style.height = scrollHeight + 'px'
  }

  const handleFindingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFindings(e.target.value)
    autoExpandTextarea(e.target)
  }

  // Auto-expand on mount if findings exist
  useEffect(() => {
    if (textareaRef.current && findings) {
      autoExpandTextarea(textareaRef.current)
    }
  }, [])
  const [expandedCards, setExpandedCards] = useState({
    template: false,
    patient: false,
    indication: false,
    findings: true
  })

  const templateId = searchParams.get('templateId')
  const { userId } = useAuthToken()
  const { isNative } = usePlatform()
  const draftKey = useMemo(() => `mobile-generate-draft-${templateId || 'default'}`, [templateId])
  const [indication, setIndication] = useState('')
  const [findings, setFindings] = useState('')
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    gender: ''
  })

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => await fetchTemplates(httpGet),
  })

  const selectedTemplate = templates?.find(t => t.id === templateId)
  const templateTitle = selectedTemplate?.title || 'No template'
  const hasTemplateSelected = !!selectedTemplate
  const hasPatientInfo =
    hasTemplateSelected &&
    patientData.name.trim().length > 0 &&
    patientData.age.trim().length > 0 &&
    !!patientData.gender
  const hasIndicationInfo = hasPatientInfo && indication.trim().length > 0
  const hasFindingsInfo = hasIndicationInfo && findings.trim().length > 0
  const isNextDisabled =
    (currentStep === 1 && !hasTemplateSelected) ||
    (currentStep === 2 && !hasPatientInfo) ||
    (currentStep === 3 && !hasIndicationInfo)
  const steps = [
    { id: 1, name: 'Template', icon: FileText },
    { id: 2, name: 'Patient', icon: User },
    { id: 3, name: 'Indication', icon: FileText },
    { id: 4, name: 'Findings', icon: Stethoscope },
  ] as const

  useEffect(() => {
    if (hasRestoredDraft) return
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(draftKey) : null
      if (stored) {
        const draft: DraftData = JSON.parse(stored)

        if (draft.patient) {
          setPatientData({
            ...draft.patient,
            gender: toGenderCode(draft.patient.gender),
          })
        }
        if (draft.indication) setIndication(draft.indication)
        if (draft.findings) setFindings(draft.findings)
        if (draft.signature) {
          setSignatureData({
            name: draft.signature.name ?? '',
            date: draft.signature.date ?? new Date().toLocaleDateString(),
          })
        }
        if (draft.templateId && draft.templateId !== templateId) {
          const params = new URLSearchParams(searchParams)
          params.set('templateId', draft.templateId)
          router.replace(`/app/generate?${params.toString()}`)
        }
      }
    } catch (error) {
      console.error('Failed to restore draft:', error)
    } finally {
      setHasRestoredDraft(true)
    }
  }, [draftKey, hasRestoredDraft, router, searchParams, templateId])

  const persistDraft = useCallback((): DraftData | null => {
    try {
      if (typeof window === 'undefined') return null
      const hasData =
        patientData.name.trim().length > 0 ||
        patientData.age.trim().length > 0 ||
        !!patientData.gender ||
        indication.trim().length > 0 ||
        findings.trim().length > 0 ||
        signatureData.name.trim().length > 0

      if (!hasData) {
        localStorage.removeItem(draftKey)
        return null
      }

      const payload: DraftData = {
        templateId: templateId || '',
        templateName: templateTitle,
        patient: patientData,
        indication,
        findings,
        signature: signatureData,
        updatedAt: Date.now()
      }

      localStorage.setItem(draftKey, JSON.stringify(payload))
      return payload
    } catch (error) {
      console.error('Failed to persist draft:', error)
      return null
    }
  }, [draftKey, templateId, templateTitle, patientData, indication, findings, signatureData])

  useEffect(() => {
    if (!hasRestoredDraft) return
    persistDraft()
  }, [persistDraft, hasRestoredDraft])

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  const handleTemplateSelect = (template: { id: string; title: string }) => {
    const params = new URLSearchParams(searchParams)
    params.set('templateId', template.id)
    router.push(`/app/generate?${params.toString()}`)
    setShowTemplateSheet(false)
    setExpandedCards(prev => ({ ...prev, template: false }))
  }

  const handlePatientUpdate = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }))
  }

  const handleVoiceTranscript = (text: string) => {
    setPendingTranscription(text)
    setShowTranscriptionPreview(true)
  }

  const handleConfirmTranscription = () => {
    setFindings(prev => prev + (prev ? ' ' : '') + pendingTranscription)
    setPendingTranscription('')
    setShowTranscriptionPreview(false)
    toast.success('Transcription added to findings')
  }

  const handleDiscardTranscription = () => {
    setPendingTranscription('')
    setShowTranscriptionPreview(false)
    toast.info('Transcription discarded')
  }

  const handleSaveDraft = async () => {
    if (isSavingDraft) return

    setIsSavingDraft(true)
    try {
      const payload = persistDraft()
      if (!payload) {
        toast.info('Nothing to save yet.')
        return
      }

      toast.success('Draft saved successfully!')

      if (typeof window !== 'undefined') {
        import('@capacitor/haptics')
          .then(async ({ Haptics }) => {
            const { ImpactStyle } = await import('@capacitor/haptics')
            Haptics.impact({ style: ImpactStyle.Light })
          })
          .catch(() => {})
      }

      setIsMenuOpen(false)
    } catch (error) {
      console.error('Failed to save draft:', error)
      toast.error('Failed to save draft. Please try again.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    // Validation
    if (!selectedTemplate) {
      setShowTemplateSheet(true)
      return
    }

    if (!patientData.name || !patientData.age || !patientData.gender) {
      setShowPatientSheet(true)
      setCurrentStep(2)
      return
    }

    if (!indication.trim()) {
      toast.error('Please enter clinical indication/history')
      setCurrentStep(2) // Go back to indication step
      return
    }

    if (!findings.trim()) {
      toast.error('Please enter findings')
      setCurrentStep(3) // Go back to findings step
      return
    }

    if (!signatureData.name.trim()) {
      // Show review sheet for signature
      setShowReviewSheet(true)
      return
    }

    // Show review sheet instead of generating directly
    setShowReviewSheet(true)
  }

  const handleFinalGenerate = async () => {
    if (!patientData.gender || !['M', 'F', 'O'].includes(patientData.gender)) {
      toast.error('Please select a valid gender before continuing')
      setShowReviewSheet(false)
      setShowPatientSheet(true)
      return
    }

    setIsSubmitting(true)

    try {
      // Build patient object
      const patient = {
        name: patientData.name || undefined,
        age: parseInt(patientData.age) || undefined,
        sex: patientData.gender || undefined,
      }

      // Build payload for enqueueJob - similar to web version
      const payload = {
        templateId: templateId || selectedTemplate?.id || '',
        indication: indication,
        findings: findings,
        impression: indication, // Mapping indication to impression
        technique: '',
        patient: patient,
        signature: signatureData,
      }

      // Enqueue the job using new API helper
      const createResp = await enqueueJob(payload)
      const jobId = createResp.job_id

      // Trigger success celebration (non-blocking, fire and forget)
      celebrateSuccess().catch(console.error)

      // Clear persisted draft after successful submission
      if (typeof window !== 'undefined') {
        localStorage.removeItem(draftKey)
      }

      // Add haptic feedback for native (non-blocking)
      if (typeof window !== 'undefined') {
        import('@capacitor/haptics')
          .then(async ({ Haptics }) => {
            const { ImpactStyle } = await import('@capacitor/haptics')
            Haptics.impact({ style: ImpactStyle.Heavy })
          })
          .catch(() => {}) // Fail silently on web
      }

      // Add optimistic row to localStorage with user-specific key
      try {
        if (userId) {
          const userJobsKey = `radly_recent_jobs_local_${userId}`;
          const local = JSON.parse(localStorage.getItem(userJobsKey) || '[]')
          local.unshift({
            job_id: jobId,
            status: 'queued',
            template_id: payload.templateId,
            title: selectedTemplate?.title || 'Generating…',
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

      // Show success notification
      toast.success('Report generation started!')

      if (isNative) {
        router.push('/app/reports')
      } else {
        router.push(`/app/report/${jobId}`)
      }
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate report. Please try again.')
      setIsSubmitting(false)
    }
  }

  const toggleCardExpansion = (card: keyof typeof expandedCards) => {
    setExpandedCards(prev => ({ ...prev, [card]: !prev[card] }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
        {/* Safe Area Spacer for Notch */}
        <div className="h-16 bg-[#0a0e1a]" />

        {/* Header - Matches dashboard exactly */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-16 z-50 bg-gradient-to-b from-[#0a0e1a] to-transparent px-4 pb-4 pt-4 flex items-center justify-between border-b border-white/10"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
            >
              <Menu className="w-6 h-6 text-white/80" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Generate</h1>
              <p className="text-sm text-white/60">Loading...</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/app/settings')}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
          >
            <Settings className="w-6 h-6 text-white/80" />
          </button>
        </motion.div>

        {/* Loading skeleton */}
        <div className="px-4 py-6 space-y-4">
          <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      {/* Safe Area Spacer for Notch */}
      <div className="h-16 bg-[#0a0e1a]" />

      {/* Header - Matches dashboard exactly */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-50 bg-gradient-to-b from-[#0a0e1a] to-transparent px-4 pb-4 pt-4 flex items-center justify-between border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
          >
            <Menu className="w-6 h-6 text-white/80" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Generate Report</h1>
            <p className="text-sm text-white/60">
              {selectedTemplate ? selectedTemplate.title : 'Select template'}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/app/settings')}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
        >
          <Settings className="w-6 h-6 text-white/80" />
        </button>
      </motion.div>

      {/* Step Progress Indicator */}
      <div className="px-4 py-4">
        <div className="text-center mb-4">
          <span className="text-sm text-white/60">
            Step <span className="font-semibold text-white">{Math.min(currentStep, steps.length)}</span> of {steps.length}
          </span>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between">
            {steps.map((step) => {
              const isAccessible =
                step.id === 1 ||
                (step.id === 2 && hasTemplateSelected) ||
                (step.id === 3 && hasPatientInfo) ||
                (step.id === 4 && hasIndicationInfo)

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (isAccessible) {
                        setCurrentStep(step.id)
                      }
                    }}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all touch-manipulation ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-br from-[#4B8EFF] to-[#2653FF] text-white shadow-lg'
                        : isAccessible
                          ? 'bg-white/20 text-white/80 border border-white/30'
                          : 'bg-white/10 text-white/40 border border-white/20'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                    {currentStep > step.id && (
                      <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-[#3FBF8C]" />
                    )}
                  </button>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      currentStep >= step.id
                        ? 'text-white'
                        : isAccessible
                          ? 'text-white/70'
                          : 'text-white/40'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/10 -z-10">
            <div
              className="h-full bg-gradient-to-r from-[#4B8EFF] to-[#2653FF] transition-all duration-300"
              style={{
                width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1 || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - 3 Card Structure */}
      <div className="px-4 py-6 pb-32 space-y-4">
        {/* Template Card - Show on step 1 */}
        {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => toggleCardExpansion('template')}
            className="w-full p-4 flex items-center justify-between text-left touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${selectedTemplate ? 'bg-gradient-to-br from-[#4B8EFF] to-[#2653FF]' : 'bg-white/5 border border-white/10'} flex items-center justify-center`}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white">Template</h3>
                <p className="text-sm text-white/60 truncate">
                  {selectedTemplate ? selectedTemplate.title : 'No template selected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedTemplate && (
                <CheckCircle className="w-5 h-5 text-[#3FBF8C]" />
              )}
              {expandedCards.template ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {expandedCards.template && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="border-t border-white/10"
              >
                <div className="p-4 space-y-3">
                  <button
                    onClick={() => setShowTemplateSheet(true)}
                    className="w-full py-3 bg-[rgba(75,142,255,0.2)] border border-[rgba(75,142,255,0.3)] rounded-xl text-white font-medium active:scale-95 transition-transform"
                  >
                    {selectedTemplate ? 'Change Template' : 'Select Template'}
                  </button>
                  {selectedTemplate && (
                    <div className="space-y-2">
                      {selectedTemplate.modality && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#4B8EFF]/20 border border-[#4B8EFF]/30 rounded-full text-[10px] font-medium text-[#4B8EFF]">
                            {selectedTemplate.modality}
                          </span>
                        </div>
                      )}
                      {selectedTemplate.anatomy && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#8F82FF]/20 border border-[#8F82FF]/30 rounded-full text-[10px] font-medium text-[#8F82FF]">
                            {selectedTemplate.anatomy}
                          </span>
                        </div>
                      )}
                      {selectedTemplate.description && (
                        <p className="text-sm text-white/60">
                          {selectedTemplate.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        )}

        {/* Patient Card - Show on step 2 */}
        {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => toggleCardExpansion('patient')}
            className="w-full p-4 flex items-center justify-between text-left touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${(patientData.name && patientData.age && patientData.gender) ? 'bg-gradient-to-br from-[#3FBF8C] to-[#4B8EFF]' : 'bg-white/5 border border-white/10'} flex items-center justify-center`}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white">Patient Details</h3>
                <p className="text-sm text-white/60">
                  {patientData.name ? `${patientData.name}, ${patientData.age}, ${formatGender(patientData.gender)}` : 'No patient selected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(patientData.name && patientData.age && patientData.gender) && (
                <CheckCircle className="w-5 h-5 text-[#3FBF8C]" />
              )}
              {expandedCards.patient ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {expandedCards.patient && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="border-t border-white/10"
              >
                <div className="p-4 space-y-4">
                  <button
                    onClick={() => setShowPatientSheet(true)}
                    className="w-full py-3 bg-[rgba(63,191,140,0.2)] border border-[rgba(63,191,140,0.3)] rounded-xl text-white font-medium active:scale-95 transition-transform"
                  >
                    {patientData.name ? 'Edit Patient Details' : 'Enter Patient Details'}
                  </button>

                  {patientData.name && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Name:</span>
                        <span className="text-white">{patientData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Age:</span>
                        <span className="text-white">{patientData.age}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Gender:</span>
                        <span className="text-white">{formatGender(patientData.gender)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        )}

        {/* Indication Card - Show on step 3 */}
        {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => toggleCardExpansion('indication')}
            className="w-full p-4 flex items-center justify-between text-left touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${indication ? 'bg-gradient-to-br from-[#4B8EFF] to-[#2653FF]' : 'bg-white/5 border border-white/10'} flex items-center justify-center`}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white">Clinical Indication</h3>
                <p className="text-sm text-white/60 truncate">
                  {indication || 'Why the exam is being performed'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {indication && (
                <CheckCircle className="w-5 h-5 text-[#3FBF8C]" />
              )}
              {expandedCards.indication ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {expandedCards.indication && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="border-t border-white/10"
              >
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Clinical Indication / History *</label>
                    <textarea
                      value={indication}
                      onChange={(e) => setIndication(e.target.value)}
                      placeholder="e.g., Follow-up for known liver nodule, Evaluate for pneumonia, Post-op check..."
                      className="w-full min-h-32 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-[#4B8EFF]/50"
                      rows={4}
                    />
                    <p className="text-xs text-white/50 mt-2">Describe why the exam is being performed</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        )}

        {/* Findings Card - Show on step 4 */}
        {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8F82FF] to-[#4B8EFF] flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Clinical Findings</h3>
                  <p className="text-sm text-white/60">
                    {findings.length > 0 ? `${findings.length} characters` : 'Tap microphone to start'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {findings.length > 0 && (
                  <CheckCircle className="w-5 h-5 text-[#3FBF8C]" />
                )}
                {expandedCards.findings ? (
                  <ChevronUp className="w-5 h-5 text-white/60" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/60" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Textarea with word count below */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={findings}
                  onChange={handleFindingsChange}
                  placeholder="Tap the microphone to start dictating clinical findings (or write finding text)..."
                  className="w-full min-h-48 max-h-96 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-[var(--ds-primary-alt)]/50 overflow-y-auto"
                  rows={6}
                />
              </div>

              {/* Word Count and Voice Input - Below textarea in a row */}
              <div className="flex items-center justify-between px-1">
                {/* Word Count Indicator */}
                <div className="text-xs text-white/50">
                  {findings.split(/\s+/).filter(w => w).length} words
                </div>

                {/* Voice Input Component */}
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onError={(error) => {
                    // Handle specific error types for better UX
                    if (error.includes('NotAllowedError') || error.includes('Permission denied')) {
                      toast.error('Microphone access denied. Please enable microphone permissions in settings.')
                    } else if (error.includes('NotFoundError')) {
                      toast.error('No microphone found. Please check your device.')
                    } else if (error.includes('NetworkError')) {
                      toast.error('Network error. Please check your connection.')
                    } else {
                      toast.error(error)
                    }
                  }}
                  showLabel={false}
                  className="w-10 h-10 flex-shrink-0"
                />
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Review CTA when ready */}
        {currentStep === steps.length && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Ready to review</h3>
                <p className="text-xs text-white/60">We’ll show a summary sheet before generating your report.</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!hasFindingsInfo}
                className={`w-full py-3 rounded-xl text-white font-semibold active:scale-95 transition-all ${
                  !hasFindingsInfo
                    ? 'bg-white/10 border border-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#4B8EFF] to-[#2653FF]'
                }`}
              >
                Review &amp; Submit
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[rgba(10,14,26,0.95)] backdrop-blur-xl border-t border-white/10" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}>
        <div className="px-4 py-3 flex gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              currentStep === 1
                ? 'bg-white/5 border border-white/10 text-white/40 opacity-40 cursor-not-allowed'
                : 'bg-white/5 border border-white/10 text-white/80 active:bg-white/10'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Middle Button - Next or Review */}
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`flex-1 py-3 rounded-xl text-white font-semibold active:scale-95 transition-flex ${
                isNextDisabled
                  ? 'bg-white/10 border border-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#4B8EFF] to-[#2653FF]'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!hasFindingsInfo}
              className={`flex-1 py-3 rounded-xl text-white font-semibold active:scale-95 transition-flex ${
                !hasFindingsInfo
                  ? 'bg-white/10 border border-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#4B8EFF] to-[#2653FF]'
              }`}
            >
              Review
            </button>
          )}

          {/* Save Draft Button - Always visible */}
          <button
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className={`w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all ${
              isSavingDraft
                ? 'bg-[#3FBF8C]/30 border border-[#3FBF8C]/50'
                : 'bg-white/5 border border-white/10'
            }`}
            title="Save draft"
          >
            {isSavingDraft ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                <Save className="w-5 h-5 text-[#3FBF8C]" />
              </motion.div>
            ) : (
              <Save className="w-5 h-5 text-white/80" />
            )}
          </button>
        </div>
      </div>

      {/* Template Selection Bottom Sheet */}
      <AnimatePresence>
        {showTemplateSheet && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTemplateSheet(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a] rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Select Template</h2>
                  <button
                    onClick={() => setShowTemplateSheet(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-3">
                  {templates?.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 rounded-xl border active:scale-95 transition-all text-left ${
                        selectedTemplate?.id === template.id
                          ? 'bg-[rgba(75,142,255,0.2)] border-[#4B8EFF]'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4B8EFF] to-[#2653FF] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-white mb-1">{template.title}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            {template.modality && (
                              <span className="px-2 py-0.5 bg-[#4B8EFF]/20 border border-[#4B8EFF]/30 rounded-full text-[10px] font-medium text-[#4B8EFF]">
                                {template.modality}
                              </span>
                            )}
                            {template.anatomy && (
                              <span className="px-2 py-0.5 bg-[#8F82FF]/20 border border-[#8F82FF]/30 rounded-full text-[10px] font-medium text-[#8F82FF]">
                                {template.anatomy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Patient Details Bottom Sheet */}
      <AnimatePresence>
        {showPatientSheet && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPatientSheet(false)}
            />
            <motion.div
              ref={patientSheetRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--ds-bg-primary)] rounded-t-3xl shadow-2xl flex flex-col"
              style={{
                maxHeight: `calc(100vh - 60px)`,
                paddingBottom: `max(env(safe-area-inset-bottom), 0.5rem)`
              }}
            >
              <div className="p-6 border-b border-white/10 bg-[var(--ds-bg-gradient)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ds-primary-alt)] to-[var(--ds-primary)] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--ds-text-primary)]">Patient Details</h2>
                  </div>
                  <button
                    onClick={() => setShowPatientSheet(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
                <div>
                  <label className="block text-sm font-medium text-[var(--ds-text-tertiary)] mb-2">Name *</label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={patientData.name}
                    onChange={(e) => handlePatientUpdate('name', e.target.value)}
                    onFocus={() => scrollToInput(nameInputRef.current)}
                    autoComplete="name"
                    placeholder="Patient name"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--ds-primary-alt)]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--ds-text-tertiary)] mb-2">Age *</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      min="0"
                      max="150"
                      value={patientData.age}
                      onChange={(e) => handlePatientUpdate('age', e.target.value)}
                      placeholder="Age (0-150)"
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--ds-primary-alt)]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--ds-text-tertiary)] mb-2">Gender *</label>
                    <select
                      value={patientData.gender}
                      onChange={(e) => handlePatientUpdate('gender', e.target.value)}
                      autoComplete="sex"
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--ds-primary-alt)]/50 [&>option]:bg-[var(--ds-bg-secondary)] [&>option]:text-white"
                    >
                      <option value="" disabled>Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 space-y-3 bg-[var(--ds-bg-primary)] flex-shrink-0" style={{ paddingBottom: `max(env(safe-area-inset-bottom), 1.5rem)` }}>
                <button
                  onClick={() => setShowPatientSheet(false)}
                  className="w-full py-3 min-h-[44px] bg-white/5 border border-white/10 rounded-xl text-white/80 font-medium active:scale-95 transition-transform touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPatientSheet(false)}
                  className="w-full py-3 min-h-[44px] bg-gradient-to-r from-[var(--success)] to-[var(--ds-primary-alt)] rounded-xl text-white font-semibold active:scale-95 transition-transform touch-manipulation"
                >
                  Confirm & Continue
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Review Bottom Sheet */}
      <AnimatePresence>
        {showReviewSheet && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowReviewSheet(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)' }}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4B8EFF] to-[#2653FF] flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Review & Submit</h2>
                      <p className="text-sm text-white/60">Review your information before generating</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReviewSheet(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Signature Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Signature</h3>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Signature Name *</label>
                    <input
                      type="text"
                      value={signatureData.name}
                      onChange={(e) => setSignatureData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Dr. Jane Smith"
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#4B8EFF]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Date</label>
                    <input
                      type="text"
                      value={signatureData.date}
                      onChange={(e) => setSignatureData(prev => ({ ...prev, date: e.target.value }))}
                      placeholder={new Date().toLocaleDateString()}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#4B8EFF]/50"
                    />
                  </div>
                </div>

                {/* Report Summary */}
                <div className="rounded-2xl border border-white/12 bg-white/5 p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Report Summary</h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-white/70 font-medium">Template:</span>
                      <p className="mt-1 text-white">{selectedTemplate?.title || 'No template selected'}</p>
                    </div>

                    <div>
                      <span className="text-white/70 font-medium">Patient:</span>
                      <p className="mt-1 text-white">
                        {patientData.name && `${patientData.name}`}
                        {patientData.age && `, ${patientData.age} years`}
                        {patientData.gender && `, ${formatGender(patientData.gender)}`}
                      </p>
                    </div>

                    <div>
                      <span className="text-white/70 font-medium">Clinical Indication:</span>
                      <p className="mt-1 text-white whitespace-pre-wrap break-words">
                        {indication || 'No indication provided'}
                      </p>
                    </div>

                    <div>
                      <span className="text-white/70 font-medium">Findings:</span>
                      <p className="mt-1 text-white whitespace-pre-wrap break-words">
                        {findings || 'No findings provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ready to Generate Notice */}
                <div className="rounded-2xl border border-[#4B8EFF]/35 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#3FBF8C]" />
                    <div>
                      <h4 className="font-semibold text-white">Ready to Generate</h4>
                      <p className="text-sm text-white/70">
                        Review the details above and tap generate to create your report
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-white/10 space-y-3 sticky bottom-0 left-0 right-0 bg-[#0a0e1a]/95 backdrop-blur-xl" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}>
                <button
                  onClick={handleFinalGenerate}
                  disabled={isSubmitting || !signatureData.name.trim()}
                  className="w-full py-3 bg-gradient-to-r from-[#3FBF8C] via-[#4B8EFF] to-[#8F82FF] rounded-xl text-white font-semibold active:scale-95 transition-transform disabled:opacity-60 disabled:saturate-75"
                >
                  {isSubmitting ? 'Generating...' : 'Generate Report'}
                </button>
                <button
                  onClick={() => setShowReviewSheet(false)}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 font-medium active:scale-95 transition-transform"
                >
                  Continue Editing
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Transcription Preview Modal */}
      <AnimatePresence>
        {showTranscriptionPreview && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTranscriptionPreview(false)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a] rounded-t-3xl shadow-2xl flex flex-col"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Review Transcription</h2>
                <p className="text-sm text-white/60 mt-1">Please review before adding to findings</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Transcription Preview */}
                <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
                  <p className="text-sm text-white/60 mb-3 font-medium">Transcribed Text:</p>
                  <p className="text-base text-white leading-relaxed break-words">
                    {pendingTranscription}
                  </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-white/50 mb-1">Words</p>
                    <p className="text-lg font-semibold text-white">
                      {pendingTranscription.split(/\s+/).filter(w => w).length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-white/50 mb-1">Characters</p>
                    <p className="text-lg font-semibold text-white">
                      {pendingTranscription.length}
                    </p>
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-xl bg-[#3FBF8C]/10 border border-[#3FBF8C]/30 p-4">
                  <p className="text-sm text-[#3FBF8C] font-medium mb-2">Tip:</p>
                  <p className="text-xs text-white/70">
                    You can edit the text after adding it, or discard it to re-record with better clarity.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-white/10 space-y-3">
                <button
                  onClick={handleConfirmTranscription}
                  className="w-full py-3 bg-gradient-to-r from-[#3FBF8C] to-[#6EE7B7] rounded-xl text-white font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Add to Findings
                </button>
                <button
                  onClick={handleDiscardTranscription}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 font-medium active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Discard & Re-record
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Menu - Matches dashboard exactly */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isMenuOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-[rgba(10,14,26,0.98)] backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}
      >
        {/* Menu Header */}
        <div className="p-6 border-b border-white/10" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2653FF] to-[#8F82FF] flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">Radly</p>
                <p className="text-base font-bold text-white">Generate</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4B8EFF] to-[#8F82FF] flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-white/50">
                {subscriptionData?.subscription.tier_display_name}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <a href="/app/dashboard" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
              <Activity className="w-5 h-5 text-white/60" />
              <span className="text-base font-medium text-white/80">Dashboard</span>
            </div>
          </a>
          <a href="/app/templates" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
              <BookTemplate className="w-5 h-5 text-white/60" />
              <span className="text-base font-medium text-white/80">Templates</span>
            </div>
          </a>
          <a href="/app/reports" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
              <FileText className="w-5 h-5 text-white/60" />
              <span className="text-base font-medium text-white/80">Reports</span>
            </div>
          </a>
          <a href="/app/settings" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-transform min-h-[56px] touch-manipulation">
              <Settings className="w-5 h-5 text-white/60" />
              <span className="text-base font-medium text-white/80">Settings</span>
            </div>
          </a>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-white/10" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 active:scale-95 transition-all min-h-[56px] touch-manipulation"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-base font-medium">Sign Out</span>
          </button>
        </div>
      </motion.div>

      {/* Menu Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Generation Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(4,8,18,0.95)] backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 rounded-3xl border border-[#4B8EFF]/30 bg-gradient-to-br from-[rgba(12,16,28,0.98)] to-[rgba(5,8,16,0.95)] px-8 py-10 text-center shadow-2xl">
            {/* Animated background glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#4B8EFF]/20 to-transparent opacity-50 pointer-events-none" />

            <div className="relative space-y-6">
              {/* Spinner */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#4B8EFF]/30 bg-[rgba(12,16,28,0.9)] shadow-lg">
                <div className="h-12 w-12 rounded-full border-3 border-[#8F82FF]/30 border-t-[#8F82FF] animate-spin" style={{ borderWidth: '3px' }} />
              </div>

              {/* Text content */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  Assistant at work
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Generating your report
                </h2>
                <p className="text-sm text-white/70 max-w-sm mx-auto">
                  Radly is aligning findings, impressions, and recommendations. You&apos;ll see the report in just a moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Matches dashboard exactly */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(10,14,26,0.95)] backdrop-blur-xl border-t border-white/10"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      >
        <div className="flex items-center justify-around px-2 pt-3 pb-2">
          <Link href="/app/dashboard" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-[10px] font-medium text-white/50">Home</span>
          </Link>
          <Link href="/app/templates" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
              <BookTemplate className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-[10px] font-medium text-white/50">Templates</span>
          </Link>
          <Link href="/app/reports" className="flex flex-col items-center justify-center flex-1 gap-1 py-2 min-h-[44px] touch-manipulation">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white/60" />
            </div>
            <span className="text-[10px] font-medium text-white/50">Reports</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
