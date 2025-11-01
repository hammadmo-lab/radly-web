/**
 * Notification Handler Component
 *
 * Handles incoming push notifications:
 * - Listens for notification taps
 * - Handles deep linking to reports
 * - Shows in-app notification UI when app is open
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePlatform } from '@/hooks/usePlatform'
import { useRegisterFCMToken } from '@/hooks/useNotifications'
import {
  getNotificationActionPath,
  detectNotificationPlatform,
  getDeviceName,
  type NotificationPayload,
} from '@/lib/notifications'
import { toast } from 'sonner'
import { Bell, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

interface NotificationHandlerProps {
  /**
   * Whether to automatically register FCM token on mount
   */
  autoRegister?: boolean

  /**
   * Whether to show in-app notification toasts
   */
  showInAppNotifications?: boolean
}

export function NotificationHandler({
  autoRegister = true,
  showInAppNotifications = true,
}: NotificationHandlerProps) {
  const router = useRouter()
  const { isNative } = usePlatform()
  const { mutate: registerToken } = useRegisterFCMToken({
    onSuccess: () => {
      console.log('FCM token registered successfully')
    },
    onError: (error) => {
      console.error('Failed to register FCM token:', error)
    },
  })

  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * Handle notification tap (opens app from background/terminated state)
   */
  const handleNotificationTap = useCallback(
    (payload: NotificationPayload) => {
      const { data } = payload

      // Navigate to appropriate screen based on action
      const path = getNotificationActionPath(data.action, data.report_id)
      router.push(path)

      // Show a toast
      if (showInAppNotifications) {
        toast.info(payload.title, {
          description: payload.body,
        })
      }
    },
    [router, showInAppNotifications]
  )

  /**
   * Handle notification received while app is in foreground
   */
  const handleNotificationReceived = useCallback(
    (payload: NotificationPayload) => {
      if (!showInAppNotifications) return

      const { data } = payload

      // Determine icon based on notification type
      let icon: React.ReactNode
      switch (data.type) {
        case 'report_complete':
          icon = <CheckCircle className="w-5 h-5 text-green-500" />
          break
        case 'report_failed':
          icon = <XCircle className="w-5 h-5 text-red-500" />
          break
        case 'usage_warning':
        case 'subscription_expiring':
          icon = <AlertTriangle className="w-5 h-5 text-yellow-500" />
          break
        case 'test':
          icon = <Bell className="w-5 h-5 text-blue-500" />
          break
        default:
          icon = <Info className="w-5 h-5 text-blue-500" />
      }

      // Show toast with action
      toast(payload.title, {
        description: payload.body,
        icon,
        action: data.action
          ? {
              label: 'View',
              onClick: () => {
                const path = getNotificationActionPath(data.action, data.report_id)
                router.push(path)
              },
            }
          : undefined,
      })
    },
    [router, showInAppNotifications]
  )

  /**
   * Initialize push notifications with Capacitor
   */
  useEffect(() => {
    if (!isNative || isInitialized) {
      return
    }

    import('@capacitor/push-notifications').then(({ PushNotifications }) => {
      // Check permission status
      PushNotifications.checkPermissions().then((result) => {
        if (result.receive === 'granted') {
          // Already granted, register
          PushNotifications.register()

          // Listen for registration
          PushNotifications.addListener('registration', (token) => {
            console.log('FCM Token:', token.value)

            if (autoRegister) {
              const platform = detectNotificationPlatform()
              const deviceName = getDeviceName()

              if (platform) {
                registerToken({
                  fcm_token: token.value,
                  platform,
                  device_name: deviceName,
                })
              }
            }
          })

          // Listen for registration errors
          PushNotifications.addListener('registrationError', (error) => {
            console.error('Push notification registration error:', error)
          })

          // Listen for notification taps (app opened from notification)
          PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            const payload = action.notification.data as NotificationPayload
            handleNotificationTap(payload)
          })

          // Listen for notifications received while app is in foreground
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            const payload: NotificationPayload = {
              title: notification.title || '',
              body: notification.body || '',
              data: notification.data as NotificationPayload['data'],
            }
            handleNotificationReceived(payload)
          })
        }
      })

      setIsInitialized(true)
    })

    return () => {
      // Cleanup listeners
      import('@capacitor/push-notifications').then(({ PushNotifications }) => {
        PushNotifications.removeAllListeners()
      })
    }
  }, [
    isNative,
    isInitialized,
    autoRegister,
    registerToken,
    handleNotificationTap,
    handleNotificationReceived,
  ])

  // This component doesn't render anything
  return null
}

/**
 * Hook to manage push notifications
 */
export function usePushNotifications() {
  const { isNative } = usePlatform()
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [fcmToken, setFcmToken] = useState<string | null>(null)

  useEffect(() => {
    if (!isNative) {
      setIsSupported(false)
      return
    }

    // Check if Capacitor PushNotifications is available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isCapacitorAvailable = typeof window !== 'undefined' && (window as any).Capacitor
    setIsSupported(isCapacitorAvailable)
  }, [isNative])

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications not supported')
    }

    const { PushNotifications } = await import('@capacitor/push-notifications')

    const permissionResult = await PushNotifications.requestPermissions()

    if (permissionResult.receive === 'granted') {
      await PushNotifications.register()
      setIsRegistered(true)
      return true
    }

    return false
  }, [isSupported])

  return {
    isSupported,
    isRegistered,
    fcmToken,
    requestPermission,
  }
}
