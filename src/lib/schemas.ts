import { z } from 'zod'

export const patientSchema = z.object({
  name: z.string().optional(),
  mrn: z.string().optional(),
  age: z.number().min(0).max(150).optional(),
  sex: z.enum(['M', 'F', 'Other']).optional(),
})

export const signatureSchema = z.object({
  name: z.string().optional(),
  date: z.string().optional(),
})

export const generateFormSchema = z.object({
  template_id: z.string().min(1, 'Template is required'),
  patient: patientSchema.optional(),
  indication: z.string().min(1, 'Indication is required'),
  findings_text: z.string().min(1, 'Findings text is required'),
  signature: signatureSchema.optional(),
})

export type GenerateFormData = z.infer<typeof generateFormSchema>
export type PatientData = z.infer<typeof patientSchema>
export type SignatureData = z.infer<typeof signatureSchema>
