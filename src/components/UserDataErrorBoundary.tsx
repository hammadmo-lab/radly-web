"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export class UserDataErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
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
    if (process.env.NODE_ENV === 'development') {
      console.error('UserData Error Boundary caught an error:', error, errorInfo)
    }

    // Show toast notification
    toast.error('Failed to load user data. Please try again.')
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }))
      toast.info(`Retrying... (${this.state.retryCount + 1}/${this.maxRetries})`)
    } else {
      toast.error('Maximum retry attempts reached')
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    })
    toast.success('Error boundary reset')
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isRetryable = this.state.retryCount < this.maxRetries
      const errorMessage = this.getErrorMessage(this.state.error)

      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                User Data Error
              </CardTitle>
              <CardDescription className="text-gray-600">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col gap-2">
                {isRetryable && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({this.state.retryCount + 1}/{this.maxRetries})
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }

  private getErrorMessage(error: Error | null): string {
    if (!error) return 'An unexpected error occurred while loading user data'

    const message = error.message.toLowerCase()
    
    if (message.includes('401')) {
      return 'Authentication failed. Please sign in again.'
    } else if (message.includes('403')) {
      return 'Access forbidden. You do not have permission to access this resource.'
    } else if (message.includes('404')) {
      return 'User data not found. This may be a new user account.'
    } else if (message.includes('503')) {
      return 'Service temporarily unavailable. Please try again later.'
    } else if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.'
    } else {
      return 'An unexpected error occurred while loading user data. Please try refreshing the page.'
    }
  }
}

// Hook version for functional components
export function useUserDataErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    toast.error(`User data error: ${error.message}`)
  }, [])

  return {
    error,
    resetError,
    handleError,
  }
}
