import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import TelegramLinkPage from '@/app/telegram-link/page'

const mockReplace = jest.fn()
const mockGetSession = jest.fn()
const mockFetch = jest.fn()
let consoleErrorSpy: jest.SpyInstance

let mockToken = 'a'.repeat(64)

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? mockToken : null),
  }),
}))

jest.mock('@/lib/supabase/client', () => ({
  createBrowserSupabase: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}))

jest.mock('@/lib/orchestrator', () => ({
  getTelegramConfirmUrl: () => 'https://bot.radly.app/telegram/link/confirm',
}))

describe('TelegramLinkPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockToken = 'a'.repeat(64)
    global.fetch = mockFetch as unknown as typeof fetch
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('redirects to sign-in when there is no active session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    render(<TelegramLinkPage />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledTimes(1)
    })

    const redirect = mockReplace.mock.calls[0][0] as string
    expect(redirect).toContain('/auth/signin?')
    expect(redirect).toContain('returnTo=')
    expect(decodeURIComponent(redirect)).toContain('/telegram-link?token=')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('shows success message after a successful confirm response', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'jwt-token',
        },
      },
      error: null,
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<TelegramLinkPage />)

    await waitFor(() => {
      expect(screen.getByText('Telegram linked')).toBeInTheDocument()
    })

    expect(screen.getByText(/Your Telegram account has been linked!/i)).toBeInTheDocument()
    expect(mockFetch).toHaveBeenCalledWith(
      'https://bot.radly.app/telegram/link/confirm',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('shows retry on network failure and retries successfully', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'jwt-token',
        },
      },
      error: null,
    })

    mockFetch
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

    render(<TelegramLinkPage />)

    await waitFor(() => {
      expect(screen.getByText('Connection issue')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(screen.getByText('Telegram linked')).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
