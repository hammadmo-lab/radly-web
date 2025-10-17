import { z } from 'zod'

export const patientSchema = z.object({
  name: z.string().trim().optional(),
  mrn: z.string().trim().optional(),
  age: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().int().positive().max(130)),
  sex: z.enum(['M', 'F', 'O']).optional(), // M = Male, F = Female, O = Other
})

export const signatureSchema = z.object({
  name: z.string().optional(),
  date: z.string().optional(),
})

export const generateFormSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  includePatient: z.boolean().default(true),
  patient: patientSchema,
  indication: z.string().trim().min(1, 'Indication/history is required'),
  findings: z.string().trim().min(1, 'Findings are required'),
  technique: z.string().trim().optional(),
  signature: signatureSchema.default({ name: '', date: '' }),
})

export type GenerateFormValues = z.infer<typeof generateFormSchema>
export type GenerateFormData = z.infer<typeof generateFormSchema>
export type PatientData = z.infer<typeof patientSchema>
export type SignatureData = z.infer<typeof signatureSchema>
