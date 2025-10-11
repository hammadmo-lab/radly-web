import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/components/auth-provider'

// Mock the Supabase client
const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockSignOut = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createBrowserSupabase: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}))

// Test component that uses the auth context
const TestComponent = () => {
  const { user, session, loading, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="user-id">{user?.id || 'no-user'}</div>
      <div data-testid="user-email">{user?.email || 'no-email'}</div>
      <div data-testid="session-token">{session?.access_token || 'no-token'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <button data-testid="sign-out" onClick={signOut}>
        Sign Out
      </button>
    </div>
  )
}

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('AuthProvider', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Suppress console.error to prevent error messages from affecting other tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    // Reset to default mock implementations
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    
    mockSignOut.mockResolvedValue({
      error: null,
    })
    
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    consoleSpy.mockRestore()
  })

  describe('Initial Authentication State', () => {
    it('should start with loading state', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    })

    it('should load initial session on mount', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled()
      })
    })

    it('should set up auth state change listener on mount', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })
    })

    it('should display user data when session is loaded', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' }
      const mockSession = { access_token: 'test-token', user: mockUser }
      
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user')
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
        expect(screen.getByTestId('session-token')).toHaveTextContent('test-token')
      })
    })

    it('should handle no initial session', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')
        expect(screen.getByTestId('user-email')).toHaveTextContent('no-email')
        expect(screen.getByTestId('session-token')).toHaveTextContent('no-token')
      })
    })
  })

  describe('Sign Out Functionality', () => {
    it('should call Supabase signOut when signOut is called', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      const signOutButton = screen.getByTestId('sign-out')
      signOutButton.click()

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
      })
    })

    it('should handle signOut error gracefully', async () => {
      // Suppress console.error for this specific test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      mockSignOut.mockRejectedValue(new Error('Sign out failed'))

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      const signOutButton = screen.getByTestId('sign-out')
      
      // Should not throw error
      expect(() => signOutButton.click()).not.toThrow()
      
      consoleSpy.mockRestore()
    })
  })

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })

    it('should provide correct context values', async () => {
      mockGetSession.mockResolvedValue({
        data: { 
          session: { 
            access_token: 'test-token', 
            user: { id: 'test-user', email: 'test@example.com' } 
          } 
        },
        error: null,
      })

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user')
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('session-token')).toHaveTextContent('test-token')
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      // Suppress console.error for error handling tests
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should handle getSession error', async () => {
      mockGetSession.mockRejectedValue(new Error('Session fetch failed'))

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Wait for the error to be processed and loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Should not crash and should show no user
      expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-email')
    })
  })

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', async () => {
      const mockUnsubscribe = jest.fn()
      mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      })

      const { unmount } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
})