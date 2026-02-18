import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/utils/test-helpers'
import { StyleProfilesDashboard } from '../StyleProfilesDashboard'
import type { StyleProfile } from '@/types/style-profiles'

jest.mock('@/hooks/use-style-profiles', () => ({
  useStyleProfiles: jest.fn(),
  useUploadStyleProfile: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useUpdateStyleProfile: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
  useDeleteStyleProfile: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useSetDefaultStyleProfile: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}))

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}))

const { useStyleProfiles } = jest.requireMock('@/hooks/use-style-profiles')

const mockProfile: StyleProfile = {
  id: 'p1',
  user_id: 'user-1',
  name: 'Hospital Style',
  status: 'active',
  is_default: true,
  source_file_url: 'https://example.com/f.docx',
  found_placeholders: ['findings', 'impression'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-06-01T00:00:00Z',
}

describe('StyleProfilesDashboard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders loading skeleton when isLoading is true', () => {
    useStyleProfiles.mockReturnValue({ data: undefined, isLoading: true, error: null, refetch: jest.fn() })
    renderWithProviders(<StyleProfilesDashboard />)
    // Skeletons are rendered — verify no profile name visible
    expect(screen.queryByText('Hospital Style')).not.toBeInTheDocument()
  })

  it('renders empty state when no profiles exist', () => {
    useStyleProfiles.mockReturnValue({
      data: { profiles: [], count: 0 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    renderWithProviders(<StyleProfilesDashboard />)
    expect(screen.getByText('No Templates Uploaded Yet')).toBeInTheDocument()
    expect(screen.getByText('Upload Your First Template')).toBeInTheDocument()
  })

  it('renders profiles list with name, badges, and actions', async () => {
    useStyleProfiles.mockReturnValue({
      data: { profiles: [mockProfile], count: 1 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    renderWithProviders(<StyleProfilesDashboard />)
    await waitFor(() => {
      expect(screen.getByText('Hospital Style')).toBeInTheDocument()
    })
    expect(screen.getByText('Default')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('{findings}')).toBeInTheDocument()
    expect(screen.getByText('{impression}')).toBeInTheDocument()
  })

  it('disables upload button when profile count is at limit (10)', () => {
    const tenProfiles = Array.from({ length: 10 }, (_, i) => ({
      ...mockProfile,
      id: `p${i}`,
      name: `Profile ${i}`,
      is_default: i === 0,
    }))
    useStyleProfiles.mockReturnValue({
      data: { profiles: tenProfiles, count: 10 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    renderWithProviders(<StyleProfilesDashboard />)
    const uploadBtn = screen.getByRole('button', { name: /upload template/i })
    expect(uploadBtn).toBeDisabled()
    expect(screen.getByText(/profile limit reached/i)).toBeInTheDocument()
  })

  it('renders error state with retry button', () => {
    const refetch = jest.fn()
    useStyleProfiles.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Network error', status: 500 },
      refetch,
    })
    renderWithProviders(<StyleProfilesDashboard />)
    expect(screen.getByText('Error Loading Style Profiles')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})
