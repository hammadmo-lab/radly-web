export interface Template {
  id: string
  name: string
  description: string
  category: string
  created_at: string
  updated_at: string
}

export interface Patient {
  name?: string
  mrn?: string
  age?: number
  sex?: 'M' | 'F' | 'Other'
}

export interface GenerateRequest {
  template_id: string
  patient?: Patient
  indication: string
  findings_text: string
  signature?: {
    name?: string
    date?: string
  }
}

export interface GenerateResponse {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  report_id?: string
  error?: string
}

export interface Report {
  id: string
  template_id: string
  patient?: Patient
  indication: string
  findings_text: string
  signature?: {
    name?: string
    date?: string
  }
  generated_content: string
  docx_url?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  accepted_terms_at?: string
  default_signature_name?: string
  default_signature_date_format?: string
  created_at: string
  updated_at: string
}
