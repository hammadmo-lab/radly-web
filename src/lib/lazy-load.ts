/**
 * Lazy loading utilities for code splitting
 */
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

export interface LazyLoadOptions {
  /**
   * Loading component to show while the component loads
   */
  loading?: ComponentType
  
  /**
   * Whether to load the component on server-side
   */
  ssr?: boolean
}

/**
 * Default loading component
 */
function DefaultLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

/**
 * Create a lazy-loaded component with a loading state
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  return dynamic(importFunc, {
    loading: options.loading || DefaultLoading,
    ssr: options.ssr ?? true,
  })
}

/**
 * Lazy load a heavy component (charts, editors, etc.)
 * These are loaded only on client-side
 */
export function lazyLoadHeavy<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent?: ComponentType
) {
  return lazyLoad(importFunc, {
    loading: loadingComponent,
    ssr: false,
  })
}

/**
 * Lazy load a component with custom loading text
 */
export function lazyLoadWithText<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingText: string = 'Loading...'
) {
  const LoadingComponent = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
      <span className="text-sm text-muted-foreground">{loadingText}</span>
    </div>
  )
  
  return lazyLoad(importFunc, {
    loading: LoadingComponent,
  })
}
