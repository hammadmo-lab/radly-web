"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Root-level error boundary to catch all uncaught errors in the app
 * This prevents the entire app from crashing and provides user-friendly error recovery
 */
export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    console.error('Root Error Boundary caught an error:', error, errorInfo)

    // Log to Sentry if available
    if (typeof window !== 'undefined') {
      const sentryGlobal = (window as { Sentry?: { captureException: (error: Error, options?: unknown) => void } }).Sentry;
      if (sentryGlobal) {
        sentryGlobal.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
          tags: {
            errorBoundary: 'root',
          },
        });
      }
    }
  }

  handleReload = () => {
    // Hard reload to clear all state
    window.location.reload()
  }

  handleGoHome = () => {
    // Navigate to home/dashboard
    window.location.href = '/app/dashboard'
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage(this.state.error)
      const isDev = process.env.NODE_ENV === 'development'

      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #0C0C0E, #1A1A1E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDev && this.state.error && (
                <details className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <summary className="cursor-pointer font-medium text-sm mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto max-h-64">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={this.handleReload}
                  className="w-full"
                  variant="default"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 pt-4">
                If this problem persists, please contact support at{' '}
                <a
                  href="mailto:support@radly.app"
                  className="text-primary hover:underline"
                >
                  support@radly.app
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }

  private getErrorMessage(error: Error | null): string {
    if (!error) return 'An unexpected error occurred'

    const message = error.message.toLowerCase()

    // Network and connectivity errors
    if (message.includes('network') || message.includes('fetch failed')) {
      return 'Network error. Please check your internet connection.'
    }

    // Authentication errors
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'Your session has expired. Please reload the page to sign in again.'
    }

    // Permission errors
    if (message.includes('403') || message.includes('forbidden')) {
      return 'Access denied. You do not have permission to perform this action.'
    }

    // Resource not found
    if (message.includes('404') || message.includes('not found')) {
      return 'The requested resource was not found.'
    }

    // Server errors
    if (message.includes('500') || message.includes('503')) {
      return 'The server encountered an error. Please try again later.'
    }

    // Timeout errors
    if (message.includes('timeout')) {
      return 'The request timed out. Please try again.'
    }

    // Chunk loading errors (common in production)
    if (message.includes('chunk') || message.includes('loading')) {
      return 'Failed to load application resources. Please reload the page.'
    }

    // Default message
    return 'An unexpected error occurred. Please try reloading the page.'
  }
}
