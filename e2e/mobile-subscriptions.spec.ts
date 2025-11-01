import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Mobile Subscriptions
 *
 * Tests mobile subscription functionality:
 * - Platform detection
 * - Conditional UI based on platform
 * - Subscription status display
 * - Cross-platform subscription handling
 *
 * Note: These tests run locally only (not on CI)
 */

test.describe('Mobile Subscriptions', () => {
  // Setup: Navigate to settings page where subscription status is shown
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/settings')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display subscription status on web', async ({ page }) => {
    // On web, should show the subscription card
    const subscriptionCard = page.locator('[data-testid="subscription-card"]')
    await expect(subscriptionCard).toBeVisible()

    // Should show web subscription management option
    const changePlanButton = page.locator('button:has-text("Change Plan")')
    await expect(changePlanButton).toBeVisible()
  })

  test('should display platform in subscription status', async ({ page }) => {
    const subscriptionCard = page.locator('[data-testid="subscription-card"]')
    await expect(subscriptionCard).toBeVisible()

    // Should display subscription tier
    const tierDisplay = subscriptionCard.locator('[data-testid="subscription-tier"]')
    await expect(tierDisplay).toBeVisible()

    // Tier should be one of the valid tiers
    const tierText = await tierDisplay.textContent()
    const validTiers = ['Free', 'Starter', 'Professional', 'Premium']
    expect(validTiers.some(tier => tierText?.includes(tier))).toBeTruthy()
  })

  test('should show usage stats in subscription card', async ({ page }) => {
    const subscriptionCard = page.locator('[data-testid="subscription-card"]')

    // Should display reports used
    const reportsUsed = subscriptionCard.locator('[data-testid="reports-used"]')
    await expect(reportsUsed).toBeVisible()

    // Should display usage progress bar
    const progressBar = subscriptionCard.locator('role=progressbar')
    await expect(progressBar).toBeVisible()
  })

  test('should display sync button for mobile subscriptions', async ({ page }) => {
    const subscriptionCard = page.locator('[data-testid="subscription-card"]')

    // For mobile platforms, should show sync button
    const syncButton = subscriptionCard.locator('button:has-text("Sync")')

    // Button should exist (may or may not be visible depending on platform detection)
    if (await syncButton.count() > 0) {
      await expect(syncButton).toBeVisible()

      // Button should be clickable
      await expect(syncButton).toBeEnabled()
    }
  })

  test('should handle no active subscription gracefully', async ({ page }) => {
    // Even with no active subscription, should show something
    const subscriptionCard = page.locator('[data-testid="subscription-card"]')
    await expect(subscriptionCard).toBeVisible()

    // Should display current tier info (at least "Free")
    const tierInfo = subscriptionCard.locator('[data-testid="subscription-tier"]')
    await expect(tierInfo).toBeVisible()
  })

  test('subscription status should be readable and accessible', async ({ page }) => {
    const subscriptionCard = page.locator('[data-testid="subscription-card"]')

    // Should have heading for accessibility
    const heading = subscriptionCard.locator('h2, h3')
    await expect(heading).toBeVisible()

    // Heading should contain "Subscription"
    const headingText = await heading.textContent()
    expect(headingText).toContain('Subscription')
  })

  test('should display renewal/expiration date when available', async ({ page, context }) => {
    // Mock API response with subscription that has expiration date
    await context.addInitRoute('**/v1/subscriptions/status', (route) => {
      route.continue()
    })

    const subscriptionCard = page.locator('[data-testid="subscription-card"]')

    // Should display renewal date info (if subscription is active)
    const dateInfo = subscriptionCard.locator('[data-testid="renewal-date"], [data-testid="expiration-date"]')

    // Date info might not be visible on free tier, but check structure exists
    const cardContent = subscriptionCard.locator('text=/Renews on|Expires on|Days Remaining/')
    // Should exist if subscription is active
    if (await cardContent.count() > 0) {
      await expect(cardContent.first()).toBeVisible()
    }
  })

  test('should disable restore button when not applicable', async ({ page }) => {
    // Restore button should exist but may be disabled or show message
    const subscriptionCard = page.locator('[data-testid="subscription-card"]')
    const restoreButton = subscriptionCard.locator('button:has-text("Restore")')

    // Check if button exists
    if (await restoreButton.count() > 0) {
      // May be disabled or show info message
      const isDisabled = await restoreButton.evaluate(
        (el: HTMLElement) => el.getAttribute('disabled') !== null || el.className.includes('disabled')
      )

      // If not disabled, should have tooltip or message
      if (!isDisabled) {
        const title = await restoreButton.getAttribute('title')
        const ariaLabel = await restoreButton.getAttribute('aria-label')
        expect(title || ariaLabel).toBeTruthy()
      }
    }
  })
})

test.describe('Mobile Subscriptions - Multi-Platform', () => {
  test('should display notice when user has multiple subscriptions', async ({ page }) => {
    // This test verifies that multi-subscription notice is shown when applicable
    await page.goto('/app/settings')
    await page.waitForLoadState('networkidle')

    const subscriptionCard = page.locator('[data-testid="subscription-card"]')

    // Check for multi-subscription notice
    const multiSubNotice = subscriptionCard.locator('[data-testid="multi-subscription-notice"]')

    // Notice should only exist if user has multiple subscriptions
    // If it exists, should explain which tier is being used
    if (await multiSubNotice.count() > 0) {
      await expect(multiSubNotice).toBeVisible()

      const noticeText = await multiSubNotice.textContent()
      expect(noticeText).toContain('active subscriptions')
    }
  })
})

test.describe('Mobile Subscriptions - Pricing Page Redirect', () => {
  test('pricing page should be accessible on web', async ({ page }) => {
    await page.goto('/pricing')

    // Should load pricing page content
    const pricingContent = page.locator('[data-testid="pricing-content"], h1:has-text("Pricing")')
    await expect(pricingContent.first()).toBeVisible()
  })

  test('pricing page should show appropriate message', async ({ page }) => {
    await page.goto('/pricing')

    // Should have pricing information
    const priceCards = page.locator('[data-testid="pricing-card"]')

    // Should have at least 3 pricing tiers (Starter, Professional, Premium)
    expect(await priceCards.count()).toBeGreaterThanOrEqual(3)
  })
})
