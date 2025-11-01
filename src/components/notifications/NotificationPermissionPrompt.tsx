/**
 * Notification Permission Prompt Component
 *
 * Requests notification permissions from the user on native apps.
 * Only shows once, and remembers the user's choice.
 */

'use client'

import { useState, useEffect } from 'react'
import { usePlatform } from '@/hooks/usePlatform'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, X } from 'lucide-react'
import { toast } from 'sonner'

const PERMISSION_PROMPT_KEY = 'radly_notification_permission_prompted'
const PERMISSION_DISMISSED_KEY = 'radly_notification_permission_dismissed'

interface NotificationPermissionPromptProps {
  /**
   * Callback when user grants permission and provides FCM token
   */
  onPermissionGranted?: (fcmToken: string) => void

  /**
   * Callback when user denies permission
   */
  onPermissionDenied?: () => void

  /**
   * Callback when user dismisses the prompt
   */
  onDismiss?: () => void
}

export function NotificationPermissionPrompt({
  onPermissionGranted,
  onPermissionDenied,
  onDismiss,
}: NotificationPermissionPromptProps) {
  const { isNative, platform } = usePlatform()
  const [isVisible, setIsVisible] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    // Only show on native apps
    if (!isNative) {
      return
    }

    const checkNotificationPermission = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')

        // Check current permission status
        const permissionStatus = await PushNotifications.checkPermissions()

        // If already granted or denied, don't show prompt
        if (permissionStatus.receive === 'granted' || permissionStatus.receive === 'denied') {
          console.log('📱 Notification permission already set:', permissionStatus.receive)
          return
        }

        // Check if we've already prompted (both localStorage and Capacitor Preferences)
        const hasPrompted = localStorage.getItem(PERMISSION_PROMPT_KEY)
        const hasDismissed = localStorage.getItem(PERMISSION_DISMISSED_KEY)
        const notificationsEnabled = localStorage.getItem('radly_notifications_enabled')
        const notificationsDenied = localStorage.getItem('radly_notifications_denied')

        // Also check Capacitor Preferences for more reliable storage
        let capacitorPrompted = false
        let capacitorEnabled = false
        let capacitorDenied = false

        try {
          const { Preferences } = await import('@capacitor/preferences')
          capacitorPrompted = !!(await Preferences.get({ key: 'notification_permission_prompted' })).value
          capacitorEnabled = !!(await Preferences.get({ key: 'notifications_enabled' })).value
          capacitorDenied = !!(await Preferences.get({ key: 'notifications_denied' })).value
        } catch (prefError) {
          console.warn('Failed to check Capacitor Preferences:', prefError)
        }

        // If permission has been handled in any storage, don't show prompt
        if (hasPrompted || hasDismissed || notificationsEnabled || notificationsDenied ||
            capacitorPrompted || capacitorEnabled || capacitorDenied) {
          console.log('📱 Notification permission already handled in previous session')
          console.log('📱 Storage states:', {
            localStorage: { hasPrompted, hasDismissed, notificationsEnabled, notificationsDenied },
            capacitor: { capacitorPrompted, capacitorEnabled, capacitorDenied }
          })
          return
        }

        // Show the prompt after a short delay (better UX)
        const timer = setTimeout(() => {
          setIsVisible(true)
        }, 3000) // 3 seconds

        return () => clearTimeout(timer)
      } catch (error) {
        console.error('Failed to check notification permissions:', error)
      }
    }

    checkNotificationPermission()
  }, [isNative])

  const handleEnable = async () => {
    setIsRequesting(true)

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')

      // Request permission
      const permissionResult = await PushNotifications.requestPermissions()

      if (permissionResult.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register()

        // Listen for registration
        await PushNotifications.addListener('registration', (token) => {
          console.log('FCM Token:', token.value)
          onPermissionGranted?.(token.value)
        })

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (error) => {
          console.error('Registration error:', error)
          toast.error('Failed to enable notifications')
          onPermissionDenied?.()
        })

        toast.success('Notifications enabled!')

        // Store permission status in both localStorage and Capacitor Preferences for reliability
        localStorage.setItem(PERMISSION_PROMPT_KEY, 'true')
        localStorage.setItem('radly_notifications_enabled', 'true')

        // Try to use Capacitor Preferences for more reliable storage in native apps
        try {
          const { Preferences } = await import('@capacitor/preferences')
          await Preferences.set({
            key: 'notification_permission_prompted',
            value: 'true'
          })
          await Preferences.set({
            key: 'notifications_enabled',
            value: 'true'
          })
        } catch (prefError) {
          console.warn('Failed to use Capacitor Preferences:', prefError)
        }

        setIsVisible(false)
      } else {
        toast.error('Notification permission denied')
        onPermissionDenied?.()

        // Store denied status
        localStorage.setItem(PERMISSION_PROMPT_KEY, 'true')
        localStorage.setItem('radly_notifications_denied', 'true')

        try {
          const { Preferences } = await import('@capacitor/preferences')
          await Preferences.set({
            key: 'notification_permission_prompted',
            value: 'true'
          })
          await Preferences.set({
            key: 'notifications_denied',
            value: 'true'
          })
        } catch (prefError) {
          console.warn('Failed to use Capacitor Preferences:', prefError)
        }

        setIsVisible(false)
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      toast.error('Failed to enable notifications')
      onPermissionDenied?.()
    } finally {
      setIsRequesting(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(PERMISSION_DISMISSED_KEY, 'true')
    setIsVisible(false)
    onDismiss?.()
  }

  const handleDeny = () => {
    localStorage.setItem(PERMISSION_PROMPT_KEY, 'true')
    setIsVisible(false)
    onPermissionDenied?.()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Enable Notifications</CardTitle>
                <CardDescription>Stay updated on your reports</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Get notified when:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Your report generation is complete</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>You're approaching your usage limit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Your subscription is expiring soon</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleEnable}
              disabled={isRequesting}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isRequesting ? 'Enabling...' : 'Enable Notifications'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeny}
              disabled={isRequesting}
              className="w-full"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Not Now
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You can change this later in Settings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hook to check if notification permission prompt should be shown
 */
export function useNotificationPermissionPrompt() {
  const { isNative } = usePlatform()
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (!isNative) {
      setShouldShow(false)
      return
    }

    const hasPrompted = localStorage.getItem(PERMISSION_PROMPT_KEY)
    const hasDismissed = localStorage.getItem(PERMISSION_DISMISSED_KEY)

    setShouldShow(!hasPrompted && !hasDismissed)
  }, [isNative])

  const markAsPrompted = () => {
    localStorage.setItem(PERMISSION_PROMPT_KEY, 'true')
    setShouldShow(false)
  }

  const markAsDismissed = () => {
    localStorage.setItem(PERMISSION_DISMISSED_KEY, 'true')
    setShouldShow(false)
  }

  const reset = () => {
    localStorage.removeItem(PERMISSION_PROMPT_KEY)
    localStorage.removeItem(PERMISSION_DISMISSED_KEY)
    setShouldShow(true)
  }

  return {
    shouldShow,
    markAsPrompted,
    markAsDismissed,
    reset,
  }
}
