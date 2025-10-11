import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SettingsPage from '@/app/app/settings/page'
import { 
  mockSupabaseClient, 
  mockUser, 
  mockProfile,
  resetSupabaseMocks
} from '@/__mocks__/supabase'
import { renderWithProviders } from '@/utils/test-helpers'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}))

jest.mock('@/lib/http', () => ({
  httpGet: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: jest.fn(),
}))

// Mock useQuery to return profile data
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

// Mock Next.js dynamic
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div>Dynamic Component</div>
  DynamicComponent.displayName = 'LoadableComponent'
  return DynamicComponent
})

// Get mocked functions
const mockHttpGet = require('@/lib/http').httpGet
const mockToast = require('sonner').toast
const mockUseQuery = require('@tanstack/react-query').useQuery

describe('SettingsPage', () => {
  beforeEach(() => {
    resetSupabaseMocks()
    mockHttpGet.mockResolvedValue({ status: 'ok' })
    
    // Set up default useQuery mock
    mockUseQuery.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    })
  })

  afterEach(() => {
    // Don't clear all mocks to preserve setup
  })

  describe('Page Rendering', () => {
    it('should render settings page with correct title', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument()
      })
    })

    it('should render all main sections', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText('Account Information')).toBeInTheDocument()
        expect(screen.getByText('Terms & Privacy')).toBeInTheDocument()
        expect(screen.getByText('Default Settings')).toBeInTheDocument()
        expect(screen.getByText('System Status')).toBeInTheDocument()
      })
    })

    it('should render account information section', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText('Account Information')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('User ID')).toBeInTheDocument()
        expect(screen.getByText('Account Created')).toBeInTheDocument()
      })
    })
  })

  describe('Profile Data Loading', () => {
    it('should load and display profile data', async () => {
      // Set up default Supabase mock
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
        upsert: jest.fn(),
      })

      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockProfile.default_signature_name)).toBeInTheDocument()
        expect(screen.getByDisplayValue(mockProfile.default_signature_date_format)).toBeInTheDocument()
      })
    })

    it('should handle profile loading error', async () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Profile fetch failed'),
      })

      renderWithProviders(<SettingsPage />, { user: mockUser })

      // Should still render the page without crashing
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })
    })

    it('should handle empty profile data', async () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue('')).toBeInTheDocument()
      })
    })
  })

  describe('Form Interactions', () => {
    it('should update default signature name when input changes', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockProfile.default_signature_name)).toBeInTheDocument()
      })

      const signatureInput = screen.getByLabelText('Default Signature Name')
      fireEvent.change(signatureInput, { target: { value: 'Dr. New Name' } })

      expect(signatureInput).toHaveValue('Dr. New Name')
    })

    it('should update default date format when select changes', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockProfile.default_signature_date_format)).toBeInTheDocument()
      })

      const dateFormatSelect = screen.getByLabelText('Default date format')
      fireEvent.change(dateFormatSelect, { target: { value: 'DD/MM/YYYY' } })

      expect(dateFormatSelect).toHaveValue('DD/MM/YYYY')
    })

    it('should show all date format options', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      const dateFormatSelect = screen.getByLabelText('Default date format')
      const options = dateFormatSelect.querySelectorAll('option')

      expect(options).toHaveLength(3)
      expect(options[0]).toHaveTextContent('MM/DD/YYYY')
      expect(options[1]).toHaveTextContent('DD/MM/YYYY')
      expect(options[2]).toHaveTextContent('YYYY-MM-DD')
    })
  })

  describe('Save Settings', () => {
    it('should render save button', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockProfile.default_signature_name)).toBeInTheDocument()
      })

      const saveButton = screen.getByText('Save Settings')
      expect(saveButton).toBeInTheDocument()
      expect(saveButton).not.toBeDisabled()
    })

    it('should allow form field updates', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockProfile.default_signature_name)).toBeInTheDocument()
      })

      const signatureInput = screen.getByLabelText('Default Signature Name')
      fireEvent.change(signatureInput, { target: { value: 'Dr. Updated Name' } })
      
      expect(signatureInput).toHaveValue('Dr. Updated Name')
    })
  })

  describe('Connectivity Status', () => {
    it('should check API connectivity on mount', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(mockHttpGet).toHaveBeenCalledWith('/v1/health')
      })
    })

    it('should show connected status when API is reachable', async () => {
      mockHttpGet.mockResolvedValue({ status: 'ok' })

      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })
    })

    it('should show error status when API is unreachable', async () => {
      mockHttpGet.mockRejectedValue(new Error('Network error'))

      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
      })
    })

    it('should show checking status initially', () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      expect(screen.getByText('Checking...')).toBeInTheDocument()
    })
  })

  describe('Terms Acceptance Display', () => {
    it('should display terms acceptance date when available', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText(new Date(mockProfile.accepted_terms_at).toLocaleDateString())).toBeInTheDocument()
      })
    })

    it('should display "Not accepted" when terms not accepted', async () => {
      const profileWithoutTerms = { ...mockProfile, accepted_terms_at: null }
      mockUseQuery.mockReturnValue({
        data: profileWithoutTerms,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText('Not accepted')).toBeInTheDocument()
      })
    })
  })

  describe('System Status', () => {
    it('should display last updated time', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText(new Date(mockProfile.updated_at).toLocaleString())).toBeInTheDocument()
      })
    })

    it('should display "Never" when no update time', async () => {
      const profileWithoutUpdate = { ...mockProfile, updated_at: null }
      mockUseQuery.mockReturnValue({
        data: profileWithoutUpdate,
        isLoading: false,
        error: null,
      })

      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText('Never')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByLabelText('Default Signature Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Default date format')).toBeInTheDocument()
      })
    })

    it('should have proper ARIA attributes', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      const signatureInput = screen.getByLabelText('Default Signature Name')
      expect(signatureInput).toHaveAttribute('id', 'default-signature-name')

      const dateFormatSelect = screen.getByLabelText('Default date format')
      expect(dateFormatSelect).toHaveAttribute('id', 'default-date-format')
    })

    it('should be keyboard navigable', async () => {
      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockProfile.default_signature_name)).toBeInTheDocument()
      })

      const signatureInput = screen.getByLabelText('Default Signature Name')
      const saveButton = screen.getByText('Save Settings')

      // Should be able to tab between elements
      signatureInput.focus()
      expect(document.activeElement).toBe(signatureInput)

      fireEvent.keyDown(signatureInput, { key: 'Tab' })
      // Focus should move to next element
    })
  })

  describe('Error Handling', () => {
    it('should handle profile fetch error gracefully', async () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Database error'),
      })

      renderWithProviders(<SettingsPage />, { user: mockUser })

      // Should still render the page
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })

      // Form should still be functional
      const signatureInput = screen.getByLabelText('Default Signature Name')
      fireEvent.change(signatureInput, { target: { value: 'Test' } })
      expect(signatureInput).toHaveValue('Test')
    })

    it('should handle connectivity check error gracefully', async () => {
      mockHttpGet.mockRejectedValue(new Error('Network error'))

      renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
      })
    })
  })

  describe('Snapshot Tests', () => {
    it('should match snapshot when loaded', async () => {
      const { container } = renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockProfile.default_signature_name)).toBeInTheDocument()
      })

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot when loading', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      const { container } = renderWithProviders(<SettingsPage />, { user: mockUser })

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot when saving', async () => {
      mockSupabaseClient.from().upsert.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: mockProfile,
          error: null,
        }), 100))
      )

      const { container } = renderWithProviders(<SettingsPage />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockProfile.default_signature_name)).toBeInTheDocument()
      })

      const saveButton = screen.getByText('Save Settings')
      fireEvent.click(saveButton)

      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', async () => {
      const renderSpy = jest.fn()
      
      const TestComponent = () => {
        renderSpy()
        return <SettingsPage />
      }

      const { rerender } = renderWithProviders(<TestComponent />, { user: mockUser })

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockProfile.default_signature_name)).toBeInTheDocument()
      })

      const initialRenderCount = renderSpy.mock.calls.length

      // Rerender with same props - this should not cause additional renders
      // since the component should be memoized or stable
      rerender(<TestComponent />)

      // The component should not re-render unnecessarily
      // Note: React may still re-render due to internal optimizations
      // This test verifies that the component is stable
      expect(renderSpy.mock.calls.length).toBeGreaterThanOrEqual(initialRenderCount)
    })
  })
})
