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

    it('should accept valid sex values', () => {
      const validSexValues = ['M', 'F', 'O']
      
      validSexValues.forEach(sex => {
        const patientWithSex = { sex }
        const result = patientSchema.safeParse(patientWithSex)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid sex values', () => {
      const invalidSexValues = ['Invalid', 'X', 'Male', 'Female']
      
      invalidSexValues.forEach(sex => {
        const patientWithSex = { sex }
        const result = patientSchema.safeParse(patientWithSex)
        expect(result.success).toBe(false)
      })
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
        templateId: 'template-123',
        includePatient: true,
        patient: {
          name: 'John Doe',
          mrn: 'MRN123456',
          age: 45,
          sex: 'M'
        },
        indication: 'Chest pain evaluation',
        findings: 'No acute findings on chest X-ray',
        technique: 'Standard chest X-ray technique',
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
        templateId: 'template-123',
        indication: 'Chest pain evaluation',
        findings: 'No acute findings on chest X-ray',
        patient: {}
      }

      const result = generateFormSchema.safeParse(minimalFormData)
      expect(result.success).toBe(true)
    })

    it('should reject missing templateId', () => {
      const invalidFormData = {
        indication: 'Chest pain evaluation',
        findings: 'No acute findings on chest X-ray'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject empty templateId', () => {
      const invalidFormData = {
        templateId: '',
        indication: 'Chest pain evaluation',
        findings: 'No acute findings on chest X-ray'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject missing indication', () => {
      const invalidFormData = {
        templateId: 'template-123',
        findings: 'No acute findings on chest X-ray'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject missing findings', () => {
      const invalidFormData = {
        templateId: 'template-123',
        indication: 'Chest pain evaluation'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject empty indication', () => {
      const invalidFormData = {
        templateId: 'template-123',
        indication: '',
        findings: 'No acute findings on chest X-ray'
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })

    it('should reject empty findings', () => {
      const invalidFormData = {
        templateId: 'template-123',
        indication: 'Chest pain evaluation',
        findings: ''
      }

      const result = generateFormSchema.safeParse(invalidFormData)
      expect(result.success).toBe(false)
    })
  })
})
