export type PatientBlock = {
  name?: string
  mrn?: string
  age?: number
  dob?: string
  sex?: string
  history?: string
}

export type StrictReport = {
  title?: string
  technique?: string
  findings?: string
  impression?: string
  recommendations?: string
  [k: string]: unknown
}

export type GenReq = {
  template_id: string
  patient?: PatientBlock
  findings_text?: string
  history?: string
  technique?: string
  options?: Record<string, unknown>
}

export type GeneratePayload = {
  template_id: string
  patient?: PatientBlock
  findings_text?: string
  history?: string
  technique?: string
  options?: Record<string, unknown>
}

export type EnqueueResp = { job_id: string; status: 'queued' | string }

export type JobDoneResult = {
  report: {
    title?: string
    technique?: string
    findings?: string
    impression?: string
    recommendations?: string
    [k: string]: unknown
  }
  patient?: PatientBlock
  ui_banner?: string
  template_id?: string
  provider?: string
  model?: string
  elapsed_ms?: number
  metadata?: unknown
}

export type JobStatus =
  | { job_id: string; status: 'queued' | 'running' }
  | { job_id: string; status: 'done'; result: JobDoneResult }
  | { job_id: string; status: 'error'; error?: string }
