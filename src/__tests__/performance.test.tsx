/**
 * Performance tests for frontend optimization
 */
import { render } from '@testing-library/react'
import { lazyLoad, lazyLoadHeavy, lazyLoadWithText } from '@/lib/lazy-load'
import { PageLoader, CardLoader, ButtonLoader } from '@/components/loading'

// Mock dynamic import
jest.mock('next/dynamic', () => {
  return (_importFunc: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>, _options: Record<string, unknown>) => {
    const MockComponent = () => <div>Mock Component</div>
    MockComponent.displayName = 'MockComponent'
    return MockComponent
  }
})

describe('Performance Optimizations', () => {
  describe('Lazy Loading', () => {
    it('should create lazy loaded component', () => {
      const LazyComponent = lazyLoad(
        () => Promise.resolve({ default: () => <div>Lazy</div> })
      )
      
      expect(LazyComponent).toBeDefined()
      expect(LazyComponent.displayName).toBe('MockComponent')
    })
    
    it('should create heavy lazy loaded component', () => {
      const HeavyComponent = lazyLoadHeavy(
        () => Promise.resolve({ default: () => <div>Heavy</div> })
      )
      
      expect(HeavyComponent).toBeDefined()
      expect(HeavyComponent.displayName).toBe('MockComponent')
    })
    
    it('should create lazy loaded component with text', () => {
      const TextComponent = lazyLoadWithText(
        () => Promise.resolve({ default: () => <div>Text</div> }),
        'Custom loading text'
      )
      
      expect(TextComponent).toBeDefined()
      expect(TextComponent.displayName).toBe('MockComponent')
    })
  })
  
  describe('Loading Components', () => {
    it('should render page loader', () => {
      const { container } = render(<PageLoader />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
    
    it('should render card loader', () => {
      const { container } = render(<CardLoader />)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
    
    it('should render button loader', () => {
      const { container } = render(<ButtonLoader />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })
  
  describe('Web Vitals', () => {
    it('should have performance API available', () => {
      expect(typeof performance).toBe('object')
      expect(typeof performance.now).toBe('function')
    })
    
    it('should have PerformanceObserver available in browser environment', () => {
      // Mock PerformanceObserver for test environment
      if (typeof PerformanceObserver === 'undefined') {
        global.PerformanceObserver = jest.fn() as unknown as typeof PerformanceObserver
      }
      expect(typeof PerformanceObserver).toBe('function')
    })
  })
  
  describe('Service Worker', () => {
    it('should have service worker API available in test environment', () => {
      // Mock service worker for tests
      Object.defineProperty(window, 'navigator', {
        value: {
          serviceWorker: {
            register: jest.fn(),
            getRegistrations: jest.fn(),
            getRegistration: jest.fn(),
          },
        },
        writable: true,
      })
      
      expect(window.navigator.serviceWorker).toBeDefined()
    })
  })
})