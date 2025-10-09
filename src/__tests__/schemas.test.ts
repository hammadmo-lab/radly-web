import { generateFormSchema, patientSchema, signatureSchema } from '@/lib/schemas'

describe('Zod Schemas', () => {
  describe('patientSchema', () => {
    it('should validate valid patient data', () => {
      const validPatient = {
        name: 'John Doe',
        mrn: 'MRN123456',
        age: 45,
        sex: 'M' as const
      }

      const result = patientSchema.safeParse(validPatient)
      expect(result.success).toBe(true)
    })

    it('should validate partial patient data', () => {
      const partialPatient = {
        name: 'Jane Smith'
      }

      const result = patientSchema.safeParse(partialPatient)
      expect(result.success).toBe(true)
    })

    it('should validate empty patient data', () => {
      const result = patientSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should reject invalid age', () => {
      const invalidPatient = {
        age: -5
      }

      const result = patientSchema.safeParse(invalidPatient)
      expect(result.success).toBe(false)
    })

    it('should reject invalid sex', () => {
      const invalidPatient = {
        sex: 'Invalid'
      }

      const result = patientSchema.safeParse(invalidPatient)
      expect(result.success).toBe(false)
    })
  })

  describe('signatureSchema', () => {
    it('should validate valid signature data', () => {
      const validSignature = {
        name: 'Dr. Jane Smith',
        date: '12/25/2024'
      }

      const result = signatureSchema.safeParse(validSignature)
      expect(result.success).toBe(true)
    })

    it('should validate partial signature data', () => {
      const partialSignature = {
        name: 'Dr. John Doe'
      }

      const result = signatureSchema.safeParse(partialSignature)
      expect(result.success).toBe(true)
    })

    it('should validate empty signature data', () => {
      const result = signatureSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('generateFormSchema', () => {
    it('should validate complete form data', () => {
      const validFormData = {
        template_id: 'template-123',
        patient: {
          name: 'John Doe',
          mrn: 'MRN123456',
          age: 45,
          sex: 'M' as const
        },
        indication: 'Chest pain evaluation',
        findings_text: 'No acute findings on chest X-ray',
        signature: {
          name: 'Dr. Jane Smith',
          date: '12/25/2024'
        }
      }

      const result = generateFormSchema.safeParse(validFormData)
      expect(result.success).toBe(true)
    })

    it('should validate minimal required data', () => {
      const minimalFormData = {
        template_id: 'template-123',
        indication: 'Chest pain evaluation',
        findings_text: 'No acute findings on chest X-ray'
      }

      const result = generateFormSchema.safeParse(minimalFormData)
      expect(result.success).toBe(true)
    })

    it('should reject missing template_id', () => {
      const invalidFormData = {
        indication: 'Chest pain evaluation',
        findings_text: 'No acute findings on chest X-ray'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject empty template_id', () => {
      const invalidFormData = {
        template_id: '',
        indication: 'Chest pain evaluation',
        findings_text: 'No acute findings on chest X-ray'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject missing indication', () => {
      const invalidFormData = {
        template_id: 'template-123',
        findings_text: 'No acute findings on chest X-ray'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject missing findings_text', () => {
      const invalidFormData = {
        template_id: 'template-123',
        indication: 'Chest pain evaluation'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject empty indication', () => {
      const invalidFormData = {
        template_id: 'template-123',
        indication: '',
        findings_text: 'No acute findings on chest X-ray'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject empty findings_text', () => {
      const invalidFormData = {
        template_id: 'template-123',
        indication: 'Chest pain evaluation',
        findings_text: ''
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })
  })
})
