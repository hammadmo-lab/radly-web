import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/components/auth-provider'
import { User, Session } from '@supabase/supabase-js'

// Mock user and session data
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
  is_anonymous: false,
  provider: 'email',
  providers: ['email'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
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

export const mockUserProfile = {
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

export const mockTemplates = [
  {
    template_id: 'template-1',
    name: 'Chest X-Ray Report',
  },
  {
    template_id: 'template-2', 
    name: 'MRI Brain Report',
  },
  {
    template_id: 'template-3',
    name: 'CT Abdomen Report',
  },
]

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null
  session?: Session | null
  loading?: boolean
  queryClient?: QueryClient
  profile?: any
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    user = mockUser,
    session = mockSession,
    loading = false,
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    profile = mockUserProfile,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Pre-populate the QueryClient with profile data if user is provided
  if (user && profile) {
    queryClient.setQueryData(['profile', user.id], profile)
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  }

  // Mock the auth context
  const mockAuthContext = {
    user,
    session,
    loading,
    signOut: jest.fn(),
  }

  // Mock the useAuth hook
  jest.doMock('@/components/auth-provider', () => ({
    ...jest.requireActual('@/components/auth-provider'),
    useAuth: () => mockAuthContext,
  }))

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock router functions
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

// Mock Next.js router
export function mockNextRouter() {
  jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => '/test-path',
    useSearchParams: () => new URLSearchParams(),
  }))
}

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signOut: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}

// Mock HTTP functions
export const mockHttpGet = jest.fn()
export const mockHttpPost = jest.fn()
export const mockHttpPut = jest.fn()
export const mockHttpDelete = jest.fn()

// Mock toast notifications
export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
}

// Utility functions for testing
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const createMockQueryClient = () => 
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Accessibility testing utilities
export const getByRole = (container: HTMLElement, role: string, options?: any) => {
  return container.querySelector(`[role="${role}"]`)
}

export const getAllByRole = (container: HTMLElement, role: string) => {
  return container.querySelectorAll(`[role="${role}"]`)
}

export const getByLabelText = (container: HTMLElement, label: string) => {
  return container.querySelector(`[aria-label="${label}"]`)
}

export const getByTestId = (container: HTMLElement, testId: string) => {
  return container.querySelector(`[data-testid="${testId}"]`)
}

// Keyboard navigation testing
export const simulateKeyPress = (element: HTMLElement, key: string) => {
  const event = new KeyboardEvent('keydown', { key })
  element.dispatchEvent(event)
}

export const simulateTab = (element: HTMLElement) => {
  simulateKeyPress(element, 'Tab')
}

export const simulateEnter = (element: HTMLElement) => {
  simulateKeyPress(element, 'Enter')
}

export const simulateEscape = (element: HTMLElement) => {
  simulateKeyPress(element, 'Escape')
}

// Form testing utilities
export const fillInput = (input: HTMLInputElement, value: string) => {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

export const selectOption = (select: HTMLSelectElement, value: string) => {
  select.value = value
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

// Clean up function
export const cleanup = () => {
  jest.clearAllMocks()
  mockRouter.push.mockClear()
  mockRouter.replace.mockClear()
  mockRouter.back.mockClear()
  mockRouter.forward.mockClear()
  mockRouter.refresh.mockClear()
  mockRouter.prefetch.mockClear()
}
