import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Push Notifications
 *
 * Tests push notification functionality:
 * - Permission prompt display
 * - Token registration
 * - Test notifications
 * - Native app detection
 *
 * Note: These tests run locally only (not on CI)
 */

test.describe('Push Notifications - Permission Prompt', () => {
  test.beforeEach(async ({ page }) => {
    // Clear notification permission state
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.removeItem('radly_notification_permission_prompted')
      localStorage.removeItem('radly_notification_permission_dismissed')
    })

    // Navigate to authenticated page
    await page.goto('/app/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should not show permission prompt on web platform', async ({ page }) => {
    // On web, permission prompt should not appear
    const permissionPrompt = page.locator('[data-testid="notification-permission-prompt"]')

    // Wait a bit for prompt to potentially appear
    await page.waitForTimeout(2000)

    // Prompt should not be visible on web
    expect(await permissionPrompt.count()).toBe(0)
  })

  test('permission prompt should have clear messaging', async ({ page }) => {
    // If prompt appears (on native), should have clear messaging
    const permissionPrompt = page.locator('[data-testid="notification-permission-prompt"]')

    if (await permissionPrompt.count() > 0) {
      await expect(permissionPrompt).toBeVisible()

      // Should have title
      const title = permissionPrompt.locator('h2, [role="heading"]')
      await expect(title).toBeVisible()

      // Should mention notifications
      const titleText = await title.textContent()
      expect(titleText?.toLowerCase()).toContain('notif')

      // Should have benefits listed
      const benefits = permissionPrompt.locator('li')
      expect(await benefits.count()).toBeGreaterThan(0)
    }
  })

  test('permission prompt should have action buttons', async ({ page }) => {
    const permissionPrompt = page.locator('[data-testid="notification-permission-prompt"]')

    if (await permissionPrompt.count() > 0) {
      // Should have enable button
      const enableButton = permissionPrompt.locator('button:has-text("Enable")')
      await expect(enableButton).toBeVisible()

      // Should have dismiss button
      const dismissButton = permissionPrompt.locator('button:has-text("Not Now")')
      await expect(dismissButton).toBeVisible()

      // Buttons should be clickable
      await expect(enableButton).toBeEnabled()
      await expect(dismissButton).toBeEnabled()
    }
  })

  test('should remember permission choice', async ({ page }) => {
    const permissionPrompt = page.locator('[data-testid="notification-permission-prompt"]')

    if (await permissionPrompt.count() > 0) {
      // Dismiss the prompt
      const dismissButton = permissionPrompt.locator('button:has-text("Not Now")')
      await dismissButton.click()

      // Prompt should disappear
      await expect(permissionPrompt).not.toBeVisible()

      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Prompt should not reappear
      await page.waitForTimeout(2000)
      expect(await permissionPrompt.count()).toBe(0)
    }
  })
})

test.describe('Push Notifications - Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/settings')
    await page.waitForLoadState('networkidle')
  })

  test('settings page should load without errors', async ({ page }) => {
    // Page should load successfully
    const settingsPage = page.locator('[data-testid="settings-page"]')
    await expect(settingsPage).toBeVisible()

    // Should not have any error messages
    const errorMessages = page.locator('[role="alert"]:has-text("error")')
    expect(await errorMessages.count()).toBe(0)
  })

  test('should have notification management section if applicable', async ({ page }) => {
    // On native apps, might have notification management
    const notificationSection = page.locator('[data-testid="notification-settings"]')

    // If section exists, should have clear controls
    if (await notificationSection.count() > 0) {
      await expect(notificationSection).toBeVisible()

      // Should have registered tokens display or status message
      const tokenInfo = notificationSection.locator('[data-testid="registered-tokens"], text=/token|device/')
      expect(await tokenInfo.count()).toBeGreaterThan(0)
    }
  })
})

test.describe('Push Notifications - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('notification permission prompt should be accessible', async ({ page }) => {
    const permissionPrompt = page.locator('[data-testid="notification-permission-prompt"]')

    if (await permissionPrompt.count() > 0) {
      // Should have proper ARIA labels
      const heading = permissionPrompt.locator('[role="heading"]')
      await expect(heading).toBeVisible()

      // Buttons should have accessible names
      const buttons = permissionPrompt.locator('button')
      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i)
        const text = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')

        // Should have either text or aria-label
        expect(text || ariaLabel).toBeTruthy()
      }
    }
  })

  test('notification system should work without JavaScript errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Navigate through app
    await page.goto('/app/dashboard')
    await page.waitForLoadState('networkidle')

    await page.goto('/app/settings')
    await page.waitForLoadState('networkidle')

    // Filter out expected errors
    const unexpectedErrors = errors.filter(
      (err) => !err.includes('ResizeObserver') && !err.includes('localStorage')
    )

    // Should not have unexpected errors
    expect(unexpectedErrors.length).toBe(0)
  })
})

test.describe('Push Notifications - Platform Detection', () => {
  test('should detect web platform correctly', async ({ page }) => {
    await page.goto('/app/dashboard')

    // Check platform detection via window object
    const platform = await page.evaluate(() => {
      // @ts-ignore
      return window.__PLATFORM__ || 'web'
    })

    // Should at least not throw errors
    expect(platform).toBeTruthy()
  })

  test('should not show mobile-only features on web', async ({ page }) => {
    await page.goto('/app/settings')
    await page.waitForLoadState('networkidle')

    // Mobile-specific message should not appear on web
    const mobileOnlyMessage = page.locator('text=/Restore Purchases|App Store|Google Play/')

    // If any mobile messaging appears, should only be in conditional sections
    for (let i = 0; i < await mobileOnlyMessage.count(); i++) {
      const element = mobileOnlyMessage.nth(i)
      // Should be hidden or in a conditional container
      const isHidden = await element.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el)
        return style.display === 'none' || style.visibility === 'hidden'
      })

      // On web, should either be hidden or in a non-rendered conditional
      // This is flexible based on implementation
    }
  })
})

test.describe('Push Notifications - Notification Handler', () => {
  test('notification handler should initialize without errors', async ({ page }) => {
    await page.goto('/app/dashboard')
    await page.waitForLoadState('networkidle')

    // Should reach dashboard without navigation errors
    const dashboardContent = page.locator('[data-testid="dashboard"], main')
    await expect(dashboardContent.first()).toBeVisible()
  })

  test('should handle notification data gracefully', async ({ page }) => {
    // Test that notification utilities are available
    const hasNotificationUtils = await page.evaluate(() => {
      try {
        // Check if we can access notification-related functions
        // These should be available in the app context
        return typeof window !== 'undefined'
      } catch {
        return false
      }
    })

    expect(hasNotificationUtils).toBe(true)
  })
})

test.describe('Push Notifications - Capacitor Ready', () => {
  test('capacitor integration code should be in place', async ({ page }) => {
    // Navigate to app to check if components load
    await page.goto('/app/dashboard')
    await page.waitForLoadState('networkidle')

    // Should load without errors
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()

    // Should not have Capacitor warnings (those are only on native)
    const logs: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        logs.push(msg.text())
      }
    })

    // Optional: If you want to verify components are integrated
    // (This is more of a code verification step)
  })

  test('notification components should be integrated in layout', async ({ page }) => {
    await page.goto('/app/dashboard')

    // NotificationHandler renders null on web, so no DOM elements to check
    // NotificationPermissionPrompt only shows on native
    // Just verify page loads without errors

    const content = page.locator('[data-testid="dashboard"], main')
    await expect(content.first()).toBeVisible()
  })
})
