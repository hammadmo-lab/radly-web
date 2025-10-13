'use client'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, RefreshCw, AlertTriangle, Bug } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorPageProps {
  title?: string
  description?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  showRefreshButton?: boolean
  errorCode?: string
  className?: string
}

export function ErrorPage({
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again.",
  showBackButton = true,
  showHomeButton = true,
  showRefreshButton = true,
  errorCode,
  className
}: ErrorPageProps) {
  const router = useRouter()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${className || ''}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-center max-w-md w-full"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="text-6xl mb-6"
        >
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
        </motion.div>

        {/* Error Code */}
        {errorCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground mb-2 font-mono"
          >
            Error {errorCode}
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-foreground mb-4"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {showBackButton && (
            <Button onClick={handleGoBack} variant="outline" className="min-h-[44px]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
          
          {showHomeButton && (
            <Button asChild className="min-h-[44px]">
              <Link href="/app/templates">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          )}
          
          {showRefreshButton && (
            <Button onClick={handleRefresh} variant="outline" className="min-h-[44px]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          )}
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 0.6 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-destructive/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
        </motion.div>
      </motion.div>
    </div>
  )
}

// 404 Not Found Page
export function NotFoundPage() {
  return (
    <ErrorPage
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved. Check the URL or navigate back to continue."
      errorCode="404"
      showBackButton={true}
      showHomeButton={true}
      showRefreshButton={false}
    />
  )
}

// 500 Server Error Page
export function ServerErrorPage() {
  return (
    <ErrorPage
      title="Server Error"
      description="Something went wrong on our end. We're working to fix this issue. Please try again in a few moments."
      errorCode="500"
      showBackButton={true}
      showHomeButton={true}
      showRefreshButton={true}
    />
  )
}

// Network Error Page
export function NetworkErrorPage() {
  return (
    <ErrorPage
      title="Network Error"
      description="Please check your internet connection and try again. If the problem persists, our servers might be experiencing issues."
      showBackButton={true}
      showHomeButton={true}
      showRefreshButton={true}
    />
  )
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Bug className="w-5 h-5" />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again or contact support if the issue persists.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-xs text-muted-foreground bg-muted p-3 rounded">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
              {error.stack && (
                <pre className="mt-2 whitespace-pre-wrap text-xs">{error.stack}</pre>
              )}
            </details>
          )}
          
          <div className="flex gap-3">
            <Button onClick={resetError} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button asChild className="flex-1">
              <Link href="/app/templates">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// React import for ErrorBoundary
import React from 'react'
