import React from 'react'
import { render, screen } from '@testing-library/react'
import { StyleSelector } from '../StyleSelector'
import type { StyleProfile } from '@/types/style-profiles'

jest.mock('@/hooks/use-style-profiles', () => ({
  useStyleProfiles: jest.fn(),
}))

const { useStyleProfiles } = jest.requireMock('@/hooks/use-style-profiles')

const makeProfile = (overrides: Partial<StyleProfile> = {}): StyleProfile => ({
  id: 'p1',
  user_id: 'user-1',
  name: 'Cairo Style',
  status: 'active',
  is_default: false,
  source_file_url: null,
  found_placeholders: ['findings', 'impression'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

describe('StyleSelector', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders nothing while loading', () => {
    useStyleProfiles.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<StyleSelector value={undefined} onChange={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when no active profiles exist', () => {
    useStyleProfiles.mockReturnValue({
      data: { profiles: [], count: 0 },
      isLoading: false,
    })
    const { container } = render(<StyleSelector value={undefined} onChange={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when all profiles are in error state', () => {
    useStyleProfiles.mockReturnValue({
      data: { profiles: [makeProfile({ status: 'error' })], count: 1 },
      isLoading: false,
    })
    const { container } = render(<StyleSelector value={undefined} onChange={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selector with label and hint text when active profiles exist', () => {
    useStyleProfiles.mockReturnValue({
      data: { profiles: [makeProfile()], count: 1 },
      isLoading: false,
    })
    render(<StyleSelector value={undefined} onChange={jest.fn()} />)
    // Label is present
    expect(screen.getByText(/style profile/i)).toBeInTheDocument()
    // Hint text is present
    expect(screen.getByText('Style affects formatting only, not medical content.')).toBeInTheDocument()
    // Placeholder text for the "None" case
    expect(screen.getByText('None (backend default)')).toBeInTheDocument()
  })

  it('calls onChange with default profile id on first mount when no value set', () => {
    const defaultProfile = makeProfile({ id: 'default-p', is_default: true })
    useStyleProfiles.mockReturnValue({
      data: { profiles: [defaultProfile], count: 1 },
      isLoading: false,
    })
    const onChange = jest.fn()
    render(<StyleSelector value={undefined} onChange={onChange} />)
    expect(onChange).toHaveBeenCalledWith('default-p')
  })

  it('does not call onChange when value is already set', () => {
    const defaultProfile = makeProfile({ id: 'default-p', is_default: true })
    useStyleProfiles.mockReturnValue({
      data: { profiles: [defaultProfile], count: 1 },
      isLoading: false,
    })
    const onChange = jest.fn()
    render(<StyleSelector value="default-p" onChange={onChange} />)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders nothing when data is empty (403 transparent case)', () => {
    useStyleProfiles.mockReturnValue({
      data: { profiles: [], count: 0 },
      isLoading: false,
    })
    const { container } = render(<StyleSelector value={undefined} onChange={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })
})
