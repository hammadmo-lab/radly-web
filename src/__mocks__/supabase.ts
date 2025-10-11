import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

// Mock user data
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  factors: [],
  is_anonymous: false,
  phone: '',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  phone_confirmed_at: null,
  confirmed_at: '2024-01-01T00:00:00Z',
  recovery_sent_at: null,
  last_sign_in_at: '2024-01-01T00:00:00Z',
  banned_until: null,
  is_sso_user: false,
  deleted_at: null,
  is_super_admin: false,
  email_change_sent_at: null,
  email_change: null,
  email_change_token_current: null,
  email_change_confirm_status: 0,
  phone_change: null,
  phone_change_sent_at: null,
  phone_change_token_current: null,
  phone_change_confirm_status: 0,
  reauthentication_sent_at: null,
  reauthentication_token_current: null,
  reauthentication_confirm_status: 0,
  provider: 'email',
  providers: ['email'],
}

export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
  provider_token: null,
  provider_refresh_token: null,
}

// Mock auth state change callback
type AuthStateChangeCallback = (event: AuthChangeEvent, session: Session | null) => void

// Mock Supabase auth methods
export const mockAuth = {
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(),
  signOut: jest.fn(),
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signInWithOAuth: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  updateUser: jest.fn(),
}

// Mock Supabase client
export const mockSupabaseClient = {
  auth: mockAuth,
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    abortSignal: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    csv: jest.fn(),
    geojson: jest.fn(),
    explain: jest.fn(),
    rollback: jest.fn(),
    returns: jest.fn().mockReturnThis(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      list: jest.fn(),
      getPublicUrl: jest.fn(),
      createSignedUrl: jest.fn(),
      createSignedUrls: jest.fn(),
    })),
  },
  realtime: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
    removeAllChannels: jest.fn(),
  },
  functions: {
    invoke: jest.fn(),
  },
}

// Default mock implementations
mockAuth.getSession.mockResolvedValue({
  data: { session: mockSession },
  error: null,
})

mockAuth.signOut.mockResolvedValue({
  error: null,
})

mockAuth.signInWithPassword.mockResolvedValue({
  data: { user: mockUser, session: mockSession },
  error: null,
})

mockAuth.signUp.mockResolvedValue({
  data: { user: mockUser, session: mockSession },
  error: null,
})

// Mock auth state change subscription
let authStateChangeCallback: AuthStateChangeCallback | null = null

mockAuth.onAuthStateChange.mockImplementation((callback: AuthStateChangeCallback) => {
  authStateChangeCallback = callback
  return {
    data: { subscription: { unsubscribe: jest.fn() } },
  }
})

// Helper function to simulate auth state changes
export const simulateAuthStateChange = (event: AuthChangeEvent, session: Session | null) => {
  if (authStateChangeCallback) {
    authStateChangeCallback(event, session)
  }
}

// Helper function to simulate successful login
export const simulateLogin = () => {
  simulateAuthStateChange('SIGNED_IN', mockSession)
}

// Helper function to simulate logout
export const simulateLogout = () => {
  simulateAuthStateChange('SIGNED_OUT', null)
}

// Helper function to simulate token refresh
export const simulateTokenRefresh = () => {
  simulateAuthStateChange('TOKEN_REFRESHED', mockSession)
}

// Mock database responses
export const mockDatabaseResponse = {
  data: null,
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
}

export const mockDatabaseError = {
  data: null,
  error: {
    message: 'Database error',
    details: 'Test error details',
    hint: 'Test hint',
    code: 'TEST_ERROR',
  },
  count: null,
  status: 400,
  statusText: 'Bad Request',
}

// Mock profile data
export const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  accepted_terms_at: '2024-01-01T00:00:00Z',
  default_signature_name: 'Dr. Test User',
  default_signature_date_format: 'MM/DD/YYYY',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Setup default mock behavior for profile queries
mockSupabaseClient.from().select().eq().single.mockResolvedValue({
  data: mockProfile,
  error: null,
})

mockSupabaseClient.from().upsert.mockResolvedValue({
  data: mockProfile,
  error: null,
})

// Reset all mocks
export const resetSupabaseMocks = () => {
  jest.clearAllMocks()
  
  // Reset auth mocks
  mockAuth.getSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  })
  
  mockAuth.signOut.mockResolvedValue({
    error: null,
  })
  
  mockAuth.signInWithPassword.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  })
  
  mockAuth.signUp.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  })
  
  // Reset database mocks
  mockSupabaseClient.from().select().eq().single.mockResolvedValue({
    data: mockProfile,
    error: null,
  })
  
  mockSupabaseClient.from().upsert.mockResolvedValue({
    data: mockProfile,
    error: null,
  })
  
  authStateChangeCallback = null
}

// Export the main mock
export default mockSupabaseClient
