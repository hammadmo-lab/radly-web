"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  baseUrl?: string
  checkInterval?: number
  showDetails?: boolean
  className?: string
}

type ConnectionState = 'connected' | 'disconnected' | 'checking' | 'error'
type StatusVisualKey = ConnectionState | 'offline'

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version?: string
}

const STATUS_VISUALS: Record<
  StatusVisualKey,
  {
    icon: typeof CheckCircle
    iconWrapper: string
    iconClass: string
    badgeClass: string
    label: string
    spin?: boolean
  }
> = {
  connected: {
    icon: CheckCircle,
    iconWrapper: 'border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.16)] text-[#7AE7B4]',
    iconClass: 'text-[#7AE7B4]',
    badgeClass: 'border-[rgba(63,191,140,0.35)] text-[#C8F3E2]',
    label: 'Connected',
  },
  checking: {
    icon: RefreshCw,
    iconWrapper: 'border-[rgba(248,183,77,0.35)] bg-[rgba(248,183,77,0.16)] text-[#FBE3B5]',
    iconClass: 'text-[#FBE3B5]',
    badgeClass: 'border-[rgba(248,183,77,0.35)] text-[#FBE3B5]',
    label: 'Checking…',
    spin: true,
  },
  error: {
    icon: AlertTriangle,
    iconWrapper: 'border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]',
    iconClass: 'text-[#FFD1D1]',
    badgeClass: 'border-[rgba(255,107,107,0.32)] text-[#FFD1D1]',
    label: 'Connection Error',
  },
  disconnected: {
    icon: XCircle,
    iconWrapper: 'border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]',
    iconClass: 'text-[#FFD1D1]',
    badgeClass: 'border-[rgba(255,107,107,0.32)] text-[#FFD1D1]',
    label: 'Disconnected',
  },
  offline: {
    icon: WifiOff,
    iconWrapper: 'border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]',
    iconClass: 'text-[#FFD1D1]',
    badgeClass: 'border-[rgba(255,107,107,0.32)] text-[#FFD1D1]',
    label: 'Offline',
  },
}

const formatTimestamp = (date: Date | null) => {
  if (!date) return 'Never'
  return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

export function ConnectionStatus({
  baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000',
  checkInterval = 30000,
  showDetails = false,
  className = '',
}: ConnectionStatusProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('checking')
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const statusKey: StatusVisualKey = isOnline ? connectionState : 'offline'
  const visual = STATUS_VISUALS[statusKey] ?? STATUS_VISUALS.error
  const StatusIcon = visual.icon

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    switch (connectionState) {
      case 'connected':
        return healthData?.status === 'unhealthy' ? 'Service Degraded' : 'Connected'
      case 'disconnected':
        return 'Disconnected'
      case 'checking':
        return 'Checking…'
      case 'error':
        return 'Connection Error'
      default:
        return 'Unknown'
    }
  }

  const getStatusMessage = () => {
    if (!isOnline) {
      return 'You appear to be offline. Check your network connection.'
    }

    if (connectionState === 'connected') {
      return healthData?.status === 'unhealthy'
        ? 'The service responded but flagged itself as unhealthy.'
        : 'Backend responded within acceptable thresholds.'
    }

    if (connectionState === 'checking') {
      return 'Pinging the /health endpoint…'
    }

    if (connectionState === 'disconnected') {
      return 'No response from the backend service.'
    }

    return errorMessage
      ? summarizeError(errorMessage)
      : 'Encountered an unexpected error while checking the backend.'
  }

  const checkConnection = useCallback(async () => {
    try {
      setConnectionState('checking')
      setErrorMessage('')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': crypto.randomUUID(),
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
    if (connectionState !== 'checking') {
      checkConnection()
    }
  }, [checkConnection, connectionState])

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, checkInterval)
    return () => clearInterval(interval)
  }, [checkConnection, checkInterval])

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

  const detailedError =
    !isOnline || connectionState === 'error' || connectionState === 'disconnected'
      ? getDetailedErrorMessage(isOnline, errorMessage)
      : null

  return (
    <div
      className={cn(
        'aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 backdrop-blur-xl transition-colors',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl border',
              visual.iconWrapper
            )}
          >
            <StatusIcon
              className={cn(
                'h-5 w-5',
                visual.iconClass,
                visual.spin ? 'animate-spin' : undefined
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">
                Backend Link
              </span>
              <Badge
                className={cn(
                  'border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] bg-transparent',
                  visual.badgeClass
                )}
              >
                {getStatusText()}
              </Badge>
              {healthData?.status === 'unhealthy' && (
                <Badge className="border-[rgba(255,183,77,0.4)] bg-[rgba(255,183,77,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FBE3B5]">
                  Unhealthy
                </Badge>
              )}
            </div>

            <p className="text-sm text-[rgba(207,207,207,0.65)]">{getStatusMessage()}</p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
              <span>Last check: {formatTimestamp(lastCheck)}</span>
              <span>Endpoint: /health</span>
              {healthData?.version && <span>Build {healthData.version}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            disabled={connectionState === 'checking'}
            className="border border-[rgba(255,255,255,0.12)] text-[rgba(207,207,207,0.8)] hover:border-[#4B8EFF]/40 hover:text-white"
          >
            <RefreshCw
              className={cn(
                'mr-2 h-4 w-4',
                connectionState === 'checking' ? 'animate-spin' : undefined
              )}
            />
            Retry
          </Button>
        </div>
      </div>

      {detailedError && (
        <div className="mt-4 rounded-xl border border-[rgba(255,107,107,0.28)] bg-[rgba(255,107,107,0.12)] p-4 text-sm text-[#FFD1D1]">
          {detailedError}
        </div>
      )}

      {showDetails && healthData && (
        <div className="mt-4 grid gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.65)] p-4 text-sm text-[rgba(207,207,207,0.65)] sm:grid-cols-2">
          <DetailItem label="Reported Status" value={healthData.status} />
          <DetailItem label="Reported At" value={new Date(healthData.timestamp).toLocaleString()} />
          <DetailItem label="API Base" value={baseUrl} />
          <DetailItem label="Last Check" value={formatTimestamp(lastCheck)} />
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(207,207,207,0.45)]">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  )
}

function summarizeError(errorMessage: string) {
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

function getDetailedErrorMessage(isOnline: boolean, errorMessage: string) {
  if (!isOnline) {
    return 'Offline mode: the app cannot reach the backend. Reconnect to the internet and retry.'
  }
  return summarizeError(errorMessage)
}

export function useConnectionStatus(baseUrl?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setIsChecking(true)
        const response = await fetch(
          `${baseUrl || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'}/health`,
          {
            headers: {
              'X-Request-Id': crypto.randomUUID(),
            },
          }
        )
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
