'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Loader2,
  Save,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'textarea'
  placeholder?: string
  required?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  className?: string
  disabled?: boolean
  showPasswordToggle?: boolean
  helperText?: string
  autoSave?: boolean
  autoSaveDelay?: number
  onAutoSave?: (value: string) => Promise<void>
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  maxLength,
  minLength,
  pattern,
  error,
  value = '',
  onChange,
  onBlur,
  className,
  disabled = false,
  showPasswordToggle = false,
  helperText,
  autoSave = false,
  autoSaveDelay = 2000,
  onAutoSave
}: FormFieldProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const timeoutRef = useRef<NodeJS.Timeout>()

  const hasError = !!error
  const isValid = isDirty && !hasError && value.length > 0
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onAutoSave || !isDirty) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      if (value.trim()) {
        setSaveStatus('saving')
        try {
          await onAutoSave(value)
          setSaveStatus('saved')
        } catch {
          setSaveStatus('error')
        }
      }
    }, autoSaveDelay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, autoSave, onAutoSave, autoSaveDelay, isDirty])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setIsDirty(true)
    setSaveStatus('unsaved')
    onChange?.(newValue)
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const InputComponent = type === 'textarea' ? Textarea : Input

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <Label 
        htmlFor={name}
        className={cn(
          "text-sm font-medium",
          hasError && "text-destructive",
          isValid && "text-success"
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Input Container */}
      <div className="relative">
        <InputComponent
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={cn(
            "transition-all duration-200",
            "focus:ring-2 focus:ring-accent focus:border-accent focus:shadow-sm",
            hasError && "border-destructive focus:ring-destructive",
            isValid && "border-success focus:ring-success",
            isPassword && showPasswordToggle && "pr-20",
            !isPassword && "pr-10"
          )}
        />

        {/* Status Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Auto-save indicator */}
          {autoSave && isDirty && (
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center"
                >
                  <Save className="w-4 h-4 text-success" />
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Validation Icons */}
          {!autoSave && (
            <>
              {hasError && (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
              {isValid && (
                <CheckCircle2 className="w-4 h-4 text-success" />
              )}
            </>
          )}

          {/* Password Toggle */}
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-muted rounded transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-destructive flex items-center gap-1"
          >
            <XCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      {helperText && !hasError && (
        <p className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}

      {/* Character Counter */}
      {maxLength && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{required ? 'Required field' : 'Optional field'}</span>
          <span className={cn(
            value.length > maxLength * 0.9 && "text-warning",
            value.length >= maxLength && "text-destructive"
          )}>
            {value.length} / {maxLength}
          </span>
        </div>
      )}
    </div>
  )
}

// Specialized form components
interface PatientInfoFormProps {
  patientName: string
  mrn: string
  dob: string
  onPatientNameChange: (value: string) => void
  onMrnChange: (value: string) => void
  onDobChange: (value: string) => void
  errors?: {
    patientName?: string
    mrn?: string
    dob?: string
  }
}

export function PatientInfoForm({
  patientName,
  mrn,
  dob,
  onPatientNameChange,
  onMrnChange,
  onDobChange,
  errors = {}
}: PatientInfoFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Patient Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Patient Name"
          name="patientName"
          value={patientName}
          onChange={onPatientNameChange}
          placeholder="Enter patient's full legal name"
          required
          maxLength={100}
          error={errors.patientName}
          helperText="Enter patient's full legal name"
        />
        
        <FormField
          label="Medical Record Number (MRN)"
          name="mrn"
          value={mrn}
          onChange={onMrnChange}
          placeholder="Enter MRN"
          maxLength={20}
          error={errors.mrn}
          helperText="Optional: Medical record number"
        />
      </div>
      
      <FormField
        label="Date of Birth"
        name="dob"
        type="text"
        value={dob}
        onChange={onDobChange}
        placeholder="MM/DD/YYYY"
        maxLength={10}
        error={errors.dob}
        helperText="Optional: Patient's date of birth"
      />
    </div>
  )
}

interface ClinicalFindingsFormProps {
  indication: string
  findings: string
  onIndicationChange: (value: string) => void
  onFindingsChange: (value: string) => void
  errors?: {
    indication?: string
    findings?: string
  }
  autoSave?: boolean
  onAutoSave?: (field: 'indication' | 'findings', value: string) => Promise<void>
}

export function ClinicalFindingsForm({
  indication,
  findings,
  onIndicationChange,
  onFindingsChange,
  errors = {},
  autoSave = false,
  onAutoSave
}: ClinicalFindingsFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Clinical Information</h3>
      
      <FormField
        label="Indication / Clinical History"
        name="indication"
        type="textarea"
        value={indication}
        onChange={onIndicationChange}
        placeholder="Enter the clinical indication or history..."
        required
        maxLength={2000}
        error={errors.indication}
        helperText="Describe why the study was performed"
        autoSave={autoSave}
        onAutoSave={onAutoSave ? (value) => onAutoSave('indication', value) : undefined}
      />
      
      <FormField
        label="Findings"
        name="findings"
        type="textarea"
        value={findings}
        onChange={onFindingsChange}
        placeholder="Enter the imaging findings..."
        required
        maxLength={5000}
        error={errors.findings}
        helperText="Describe the imaging findings in detail"
        autoSave={autoSave}
        onAutoSave={onAutoSave ? (value) => onAutoSave('findings', value) : undefined}
      />
    </div>
  )
}
