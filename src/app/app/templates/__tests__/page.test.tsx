import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TemplatesPage from '@/app/app/templates/page'
import { listTemplates } from '@/lib/templates'

// Mock the templates API
const mockTemplates = [
  { template_id: 'template-1', name: 'Chest X-Ray Report' },
  { template_id: 'template-2', name: 'MRI Brain Report' },
  { template_id: 'template-3', name: 'CT Abdomen Report' },
]

jest.mock('@/lib/templates', () => ({
  listTemplates: jest.fn(() => Promise.resolve(mockTemplates)),
}))

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

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

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

describe('TemplatesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render the page title and description', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      expect(screen.getByText('Templates')).toBeInTheDocument()
      expect(screen.getByText('Choose from our collection of medical report templates')).toBeInTheDocument()
    })

    it('should render the New Report button', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      expect(screen.getByText('New Report')).toBeInTheDocument()
    })

    it('should render the search input', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument()
    })
  })

  describe('Template Loading', () => {
    it('should load and display templates', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Chest X-Ray Report')).toBeInTheDocument()
        expect(screen.getByText('MRI Brain Report')).toBeInTheDocument()
        expect(screen.getByText('CT Abdomen Report')).toBeInTheDocument()
      })
    })

    it('should show Use Template buttons for each template', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      await waitFor(() => {
        const useTemplateButtons = screen.getAllByText('Use Template')
        expect(useTemplateButtons).toHaveLength(3)
      })
    })
  })

  describe('Template Selection', () => {
    it('should navigate to generate page when Use Template is clicked', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Chest X-Ray Report')).toBeInTheDocument()
      })

      const useTemplateButtons = screen.getAllByText('Use Template')
      fireEvent.click(useTemplateButtons[0])

      expect(mockPush).toHaveBeenCalledWith('/app/generate?templateId=template-1')
    })
  })

  describe('Search Functionality', () => {
    it('should filter templates by name', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Chest X-Ray Report')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search templates...')
      fireEvent.change(searchInput, { target: { value: 'Chest' } })

      await waitFor(() => {
        expect(screen.getByText('Chest X-Ray Report')).toBeInTheDocument()
        expect(screen.queryByText('MRI Brain Report')).not.toBeInTheDocument()
      })
    })

    it('should show no results when search yields no matches', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Chest X-Ray Report')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search templates...')
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } })

      await waitFor(() => {
        expect(screen.getByText('No templates found')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle template loading error', async () => {
      jest.mocked(listTemplates).mockRejectedValueOnce(new Error('Failed to fetch templates'))

      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText("Couldn't load templates")).toBeInTheDocument()
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })
    })

    it('should retry loading when retry button is clicked', async () => {
      jest.mocked(listTemplates).mockRejectedValueOnce(new Error('Failed to fetch templates'))
        .mockResolvedValueOnce(mockTemplates)

      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })

      const retryButton = screen.getByText('Retry')
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Chest X-Ray Report')).toBeInTheDocument()
      })
    })
  })

  describe('Empty States', () => {
    it('should show no templates message when no templates are available', async () => {
      jest.mocked(listTemplates).mockResolvedValueOnce([])

      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('No templates available')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText('Search templates...')
      expect(searchInput).toBeInTheDocument()
    })

    it('should have proper button labels', async () => {
      render(
        <TestWrapper>
          <TemplatesPage />
        </TestWrapper>
      )

      expect(screen.getByText('New Report')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getAllByText('Use Template')).toHaveLength(3)
      })
    })
  })
})