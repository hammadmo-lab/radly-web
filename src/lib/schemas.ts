import { z } from 'zod'

export const patientSchema = z.object({
  name: z.string().trim().optional(),
  mrn: z.string().trim().optional(),
  age: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().int().positive().max(130).optional()),
  dob: z.string().trim().optional(), // leave string; backend accepts string
  sex: z.string().trim().optional(),
})

export const signatureSchema = z.object({
  name: z.string().optional(),
  date: z.string().optional(),
})

export const generateFormSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  includePatient: z.boolean().default(false),
  patient: patientSchema,
  indication: z.string().trim().min(1, 'Indication/history is required'),
  findings: z.string().trim().min(1, 'Findings are required'),
  technique: z.string().trim().optional(),
  signature: signatureSchema.optional(),
})

export type GenerateFormValues = z.infer<typeof generateFormSchema>
export type GenerateFormData = z.infer<typeof generateFormSchema>
export type PatientData = z.infer<typeof patientSchema>
export type SignatureData = z.infer<typeof signatureSchema>
