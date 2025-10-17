// Test data fixtures for E2E tests

// Test user credentials - these should be test accounts in your Supabase project
export const TEST_USERS = {
  validUser: {
    email: 'test@radly.com',
    password: 'testpassword123', // Only if using email/password auth
    name: 'Test User',
  },
  magicLinkUser: {
    email: 'magic@radly.com',
    name: 'Magic Link User',
  },
  googleUser: {
    email: 'google@radly.com',
    name: 'Google User',
  },
  adminUser: {
    email: 'admin@radly.com',
    password: 'adminpassword123',
    name: 'Admin User',
    role: 'admin',
  },
  standardUser: {
    email: 'standard@radly.com',
    password: 'standardpassword123',
    name: 'Standard User',
    role: 'user',
  },
} as const;

export const TEST_PATIENTS = [
  {
    name: 'John Doe',
    mrn: 'MRN123456',
    age: 45,
    dob: '01/01/1980',
    sex: 'M',
    history: 'Patient presents with chest pain and shortness of breath.',
  },
  {
    name: 'Jane Smith',
    mrn: 'MRN789012',
    age: 32,
    dob: '05/15/1992',
    sex: 'F',
    history: 'Follow-up for previous imaging findings.',
  },
  {
    name: 'Robert Johnson',
    mrn: 'MRN345678',
    age: 67,
    dob: '12/03/1957',
    sex: 'M',
    history: 'Screening mammography.',
  },
] as const;

export const TEST_CLINICAL_DATA = [
  {
    indication: 'Chest pain and shortness of breath. Rule out pulmonary embolism.',
    findings: '- No acute pulmonary embolism\n- Mild cardiomegaly\n- Clear lung fields\n- No pleural effusion',
    technique: 'CT angiography of the chest with contrast',
  },
  {
    indication: 'Follow-up imaging for previously noted lung nodule.',
    findings: '- Stable 8mm nodule in right upper lobe\n- No new nodules\n- No lymphadenopathy',
    technique: 'High-resolution CT chest without contrast',
  },
  {
    indication: 'Routine screening mammography.',
    findings: '- No suspicious masses\n- No architectural distortion\n- Bilateral breast tissue within normal limits',
    technique: 'Digital mammography, bilateral craniocaudal and mediolateral oblique views',
  },
] as const;

export const TEST_TEMPLATES = [
  {
    id: 'chest-ct-angio',
    name: 'Chest CT Angiography',
    modality: 'CT',
    bodySystem: 'Chest',
    description: 'Template for chest CT angiography reports',
  },
  {
    id: 'chest-xray',
    name: 'Chest X-Ray',
    modality: 'X-Ray',
    bodySystem: 'Chest',
    description: 'Template for chest X-ray reports',
  },
  {
    id: 'mammography',
    name: 'Mammography',
    modality: 'Mammography',
    bodySystem: 'Breast',
    description: 'Template for mammography reports',
  },
  {
    id: 'mri-brain',
    name: 'MRI Brain',
    modality: 'MRI',
    bodySystem: 'Brain',
    description: 'Template for MRI brain reports',
  },
] as const;

export const TEST_SIGNATURES = [
  {
    name: 'Dr. Jane Smith',
    date: new Date().toLocaleDateString(),
  },
  {
    name: 'Dr. Michael Johnson',
    date: new Date().toLocaleDateString(),
  },
] as const;

// Form validation test data
export const INVALID_FORM_DATA = {
  emptyRequired: {
    indication: '',
    findings: '',
  },
  tooLong: {
    indication: 'A'.repeat(1001), // Assuming 1000 char limit
    findings: 'B'.repeat(5001), // Assuming 5000 char limit
  },
  invalidPatient: {
    age: -5,
    mrn: '', // Empty MRN when patient data is included
  },
} as const;

// API response mock data
export const MOCK_API_RESPONSES = {
  templates: {
    success: TEST_TEMPLATES,
    empty: [],
    error: { error: 'Failed to fetch templates' },
  },
  job: {
    queued: {
      job_id: 'test-job-123',
      status: 'queued',
      template_id: 'chest-ct-angio',
      created_at: new Date().toISOString(),
    },
    running: {
      job_id: 'test-job-123',
      status: 'running',
      template_id: 'chest-ct-angio',
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
    },
    completed: {
      job_id: 'test-job-123',
      status: 'done',
      template_id: 'chest-ct-angio',
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      result: {
        report: 'Generated medical report content...',
        docx_url: '/api/download/test-job-123.docx',
      },
    },
    failed: {
      job_id: 'test-job-123',
      status: 'failed',
      template_id: 'chest-ct-angio',
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      failed_at: new Date().toISOString(),
      error: 'Report generation failed',
    },
  },
} as const;

// Test environment configuration
export const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  timeout: {
    short: 5000,
    medium: 10000,
    long: 30000,
  },
  retries: 3,
} as const;
