export type ApiError = Error & { status?: number; body?: string };

export interface PatientInput {
  name?: string | null;
  age?: number | null;
  sex?: string | null;
  mrn?: string | null;
  dob?: string | null;         // "YYYY-MM-DD"
  history?: string | null;
}

export interface SignatureInput {
  name?: string | null;
  date?: string | null;        // "YYYY-MM-DD"
}

export interface EnqueueInput {
  templateId: string;
  indication?: string | null;
  findings: string;
  impression?: string | null;
  technique?: string | null;
  patient?: PatientInput | null;
  signature?: SignatureInput | null;
}
