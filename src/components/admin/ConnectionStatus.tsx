"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ConnectionStatusProps {
  baseUrl?: string
  checkInterval?: number
  showDetails?: boolean
  className?: string
}

type ConnectionState = 'connected' | 'disconnected' | 'checking' | 'error'

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version?: string
}

export function ConnectionStatus({ 
  baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000',
  checkInterval = 30000, // 30 seconds
  showDetails = false,
  className = ''
}: ConnectionStatusProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('checking')
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const checkConnection = useCallback(async () => {
    try {
      setConnectionState('checking')
      setErrorMessage('')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data: HealthCheckResponse = await response.json()
        setHealthData(data)
        setConnectionState('connected')
        setLastCheck(new Date())
        
        if (data.status === 'unhealthy') {
          toast.warning('Backend service is reporting as unhealthy')
        }
      } else {
        throw new Error(`Health check failed with status ${response.status}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setErrorMessage(errorMsg)
      setConnectionState('error')
      setLastCheck(new Date())
      
      // Show toast notification for connection issues
      if (errorMsg.includes('aborted') || errorMsg.includes('timeout')) {
        toast.error('Connection timeout - backend may be slow to respond')
      } else if (errorMsg.includes('Failed to fetch')) {
        toast.error('Cannot connect to backend server')
      } else {
        toast.error(`Connection error: ${errorMsg}`)
      }
    }
  }, [baseUrl])

  const handleRetry = useCallback(() => {
    checkConnection()
  }, [checkConnection])

  // Check connection on mount and periodically
  useEffect(() => {
    checkConnection()
    
    const interval = setInterval(checkConnection, checkInterval)
    return () => clearInterval(interval)
  }, [checkConnection, checkInterval])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      checkConnection()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnectionState('disconnected')
      toast.error('You are offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkConnection])

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />
    }

    switch (connectionState) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline'
    }

    switch (connectionState) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
      case 'checking':
        return 'Checking...'
      case 'error':
        return 'Connection Error'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    if (!isOnline) {
      return 'destructive'
    }

    switch (connectionState) {
      case 'connected':
        return 'default'
      case 'disconnected':
      case 'error':
        return 'destructive'
      case 'checking':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getErrorMessage = () => {
    if (!isOnline) {
      return 'You are currently offline. Please check your internet connection.'
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      return 'Connection timeout. The backend server may be slow to respond.'
    }

    if (errorMessage.includes('Failed to fetch')) {
      return 'Cannot connect to the backend server. Please check if the service is running.'
    }

    if (errorMessage.includes('401')) {
      return 'Authentication failed. Please check your admin credentials.'
    }

    if (errorMessage.includes('403')) {
      return 'Access forbidden. You do not have permission to access the health endpoint.'
    }

    if (errorMessage.includes('404')) {
      return 'Health endpoint not found. The backend may not support health checks.'
    }

    if (errorMessage.includes('503')) {
      return 'Service temporarily unavailable. The backend server is experiencing issues.'
    }

    return errorMessage || 'Unknown connection error occurred.'
  }

  if (showDetails) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <div className="font-medium">{getStatusText()}</div>
                <div className="text-sm text-gray-500">
                  {lastCheck ? `Last check: ${lastCheck.toLocaleTimeString()}` : 'Never checked'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor()}>
                {getStatusText()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={connectionState === 'checking'}
              >
                <RefreshCw className={`w-4 h-4 ${connectionState === 'checking' ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {(connectionState === 'error' || connectionState === 'disconnected') && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">
                {getErrorMessage()}
              </div>
            </div>
          )}

          {healthData && showDetails && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-800">
                <div>Status: {healthData.status}</div>
                {healthData.version && <div>Version: {healthData.version}</div>}
                <div>Checked: {new Date(healthData.timestamp).toLocaleString()}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Compact banner version
  if (connectionState === 'connected' && isOnline) {
    return null // Don't show banner when everything is working
  }

  return (
    <div className={`bg-red-50 border-b border-red-200 px-4 py-2 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-red-800">
            {getStatusText()}
          </span>
          <span className="text-sm text-red-600">
            {getErrorMessage()}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={connectionState === 'checking'}
          className="text-red-800 border-red-300 hover:bg-red-100"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${connectionState === 'checking' ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      </div>
    </div>
  )
}

// Hook for using connection status in other components
export function useConnectionStatus(baseUrl?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setIsChecking(true)
        const response = await fetch(`${baseUrl || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'}/health`)
        setIsConnected(response.ok)
      } catch {
        setIsConnected(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [baseUrl])

  return { isConnected, isChecking }
}
