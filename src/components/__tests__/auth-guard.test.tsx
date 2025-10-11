import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthGuard } from '@/components/auth-guard'
import { useAuth } from '@/components/auth-provider'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock auth provider
jest.mock('@/components/auth-provider', () => ({
  useAuth: jest.fn(),
}))

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
      {children}
    </QueryClientProvider>
  )
}

// Get mocked functions
const mockUseAuth = jest.mocked(useAuth)

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
  })

  describe('Route Protection Logic', () => {
    it('should render children when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false,
        signOut: jest.fn(),
      })

      const TestComponent = () => <div data-testid="protected-content">Protected Content</div>
      
      render(
        <TestWrapper>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should not render children when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signOut: jest.fn(),
      })

      const TestComponent = () => <div data-testid="protected-content">Protected Content</div>
      
      render(
        <TestWrapper>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </TestWrapper>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should redirect to default signin page when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signOut: jest.fn(),
      })
      
      render(
        <TestWrapper>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </TestWrapper>
      )

      // Use act to ensure useEffect runs
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(mockPush).toHaveBeenCalledWith('/auth/signin')
    })

    it('should redirect to custom redirect path when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signOut: jest.fn(),
      })
      
      render(
        <TestWrapper>
          <AuthGuard redirectTo="/custom-login">
            <div>Protected Content</div>
          </AuthGuard>
        </TestWrapper>
      )

      // Use act to ensure useEffect runs
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(mockPush).toHaveBeenCalledWith('/custom-login')
    })

    it('should not redirect when user is authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false,
        signOut: jest.fn(),
      })
      
      render(
        <TestWrapper>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner when loading is true', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: true,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </TestWrapper>
      )

      // Check for loading spinner by class
      const loadingSpinner = document.querySelector('.animate-spin')
      expect(loadingSpinner).toBeInTheDocument()
      expect(loadingSpinner).toHaveClass('animate-spin')
    })

    it('should not show protected content when loading', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: true,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <AuthGuard>
            <div data-testid="protected-content">Protected Content</div>
          </AuthGuard>
        </TestWrapper>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should not redirect when loading', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        signOut: jest.fn(),
      })
      
      render(
        <TestWrapper>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for loading state', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: true,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </TestWrapper>
      )

      // Check for loading spinner by class
      const loadingSpinner = document.querySelector('.animate-spin')
      expect(loadingSpinner).toBeInTheDocument()
      expect(loadingSpinner).toHaveClass('animate-spin')
    })
  })
})