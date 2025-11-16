import { z } from 'zod'

// Patient schema with edge case handling
export const patientSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Patient name must be at least 2 characters")
    .max(100, "Patient name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s\-'.]*$/, "Patient name can only contain letters, spaces, hyphens, apostrophes, and periods")
    .optional()
    .or(z.literal('')),
  mrn: z.string()
    .trim()
    .min(1, "MRN must be at least 1 character")
    .max(50, "MRN must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9\-_]*$/, "MRN can only contain letters, numbers, hyphens, and underscores")
    .optional()
    .or(z.literal('')),
  age: z.preprocess(
    (v) => {
      // Handle empty strings and null/undefined
      if (v === '' || v === null || v === undefined) return undefined
      // Convert to number
      const num = Number(v)
      // Return undefined for NaN
      return isNaN(num) ? undefined : num
    },
    z.number({
      required_error: "Patient age is required",
      invalid_type_error: "Please enter a valid age"
    })
    .int("Age must be a whole number")
    .positive("Age must be greater than 0")
    .max(130, "Please enter a valid age (maximum 130)")
    .min(1, "Age must be at least 1")
  ),
  sex: z.enum(['M', 'F', 'O'], {
    required_error: "Please select the patient's sex",
    invalid_type_error: "Please select a valid option"
  }), // M = Male, F = Female, O = Other
})

export const signatureSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Signature name must be at least 2 characters")
    .max(100, "Signature name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s\-'.]*$/, "Signature name can only contain letters, spaces, hyphens, apostrophes, and periods")
    .optional()
    .or(z.literal('')),
  date: z.string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .or(z.literal('')),
})

export const generateFormSchema = z.object({
  templateId: z.string()
    .min(1, 'Template is required')
    .max(100, 'Template ID is too long'),
  includePatient: z.boolean().default(true),
  patient: patientSchema,
  indication: z.string()
    .trim()
    .min(10, 'Indication/history must be at least 10 characters')
    .max(5000, 'Indication/history must not exceed 5000 characters')
    .refine(
      (val) => val.split(/\s+/).filter(w => w.length > 0).length >= 3,
      { message: "Indication/history must contain at least 3 words" }
    ),
  findings: z.string()
    .trim()
    .min(10, 'Findings must be at least 10 characters')
    .max(10000, 'Findings must not exceed 10,000 characters')
    .refine(
      (val) => val.split(/\s+/).filter(w => w.length > 0).length >= 3,
      { message: "Findings must contain at least 3 words" }
    ),
  technique: z.string()
    .trim()
    .max(2000, 'Technique must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  signature: signatureSchema.default({ name: '', date: '' }),
})

export type GenerateFormValues = z.infer<typeof generateFormSchema>
export type GenerateFormData = z.infer<typeof generateFormSchema>
export type PatientData = z.infer<typeof patientSchema>
export type SignatureData = z.infer<typeof signatureSchema>

// Admin schemas
export const adminLoginSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export type AdminLoginData = z.infer<typeof adminLoginSchema>

// File upload validation
export const fileUploadSchema = z.object({
  file: z.custom<File>()
    .refine((file) => file instanceof File, 'Please select a file')
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB
      'File size must not exceed 10MB'
    )
    .refine(
      (file) => ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a'].includes(file.type),
      'File must be an audio file (WAV, MP3, or M4A)'
    ),
})

export type FileUploadData = z.infer<typeof fileUploadSchema>
