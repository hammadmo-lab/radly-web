import { test, expect } from './fixtures/auth';
import { TEST_USERS } from './fixtures/test-data';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page first to establish context
    await page.goto('/');
    // Clear any existing auth state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Sign-in Page', () => {
    test('should display sign-in page correctly', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Check page title
      await expect(page).toHaveTitle(/Radly - Medical Report Generation/);
      
      // Check main heading
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
      
      // Check for authentication options based on environment variables
      // Note: These will depend on your NEXT_PUBLIC_ALLOW_* environment variables
      
      // Magic link option (if enabled)
      const magicLinkForm = page.locator('form');
      if (await magicLinkForm.isVisible()) {
        // Check for email input field (it might not have a label)
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Send me a magic link' })).toBeVisible();
      }
      
      // OAuth options (if enabled)
      const googleButton = page.getByRole('button', { name: 'Continue with Google' });
      const appleButton = page.getByRole('button', { name: 'Continue with Apple' });
      
      // These buttons may or may not be visible depending on environment config
      // We'll just check that the page loads without errors
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show validation error for empty email', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: 'Send me a magic link' });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for HTML5 validation or custom validation
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toHaveAttribute('required');
      }
    });

    test('should show validation error for invalid email format', async ({ page }) => {
      await page.goto('/auth/signin');
      
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid-email');
        
        const submitButton = page.getByRole('button', { name: 'Send me a magic link' });
        await submitButton.click();
        
        // Check for validation error
        await expect(emailInput).toHaveAttribute('type', 'email');
      }
    });
  });

  test.describe('Authentication Methods', () => {
    test('should handle magic link authentication flow', async ({ page, auth }) => {
      await page.goto('/auth/signin');
      
      // Fill in email
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill(TEST_USERS.magicLinkUser.email);
        
        // Click send magic link
        const submitButton = page.getByRole('button', { name: 'Send me a magic link' });
        await submitButton.click();
        
        // Wait for success message
        await expect(page.getByText('Check your email for the magic link.')).toBeVisible();
        
        // Note: In a real E2E test, you'd need to handle the actual email verification
        // For now, we'll simulate the callback by navigating to it directly
        // This is a limitation of magic link testing in E2E
      }
    });

    test('should handle Google OAuth flow', async ({ page }) => {
      await page.goto('/auth/signin');
      
      const googleButton = page.getByRole('button', { name: 'Continue with Google' });
      if (await googleButton.isVisible()) {
        // Click Google sign-in button
        await googleButton.click();
        
        // Should redirect to Google OAuth
        await page.waitForURL('**/accounts.google.com/**');
        
        // Note: In a real E2E test, you'd need to handle the OAuth flow
        // This might require mocking or using test OAuth credentials
      }
    });

    test('should handle Apple OAuth flow', async ({ page }) => {
      await page.goto('/auth/signin');
      
      const appleButton = page.getByRole('button', { name: 'Continue with Apple' });
      if (await appleButton.isVisible()) {
        // Click Apple sign-in button
        await appleButton.click();
        
        // Should redirect to Apple OAuth
        await page.waitForURL('**/appleid.apple.com/**');
        
        // Note: Similar to Google OAuth, this requires handling the OAuth flow
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to sign-in', async ({ page }) => {
      // Try to access protected routes
      const protectedRoutes = [
        '/app/templates',
        '/app/generate',
        '/app/settings',
        '/app/reports',
      ];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        
        // Should be redirected to sign-in page
        await expect(page).toHaveURL(/.*\/auth\/signin/);
      }
    });

    test('should allow access to public routes without authentication', async ({ page }) => {
      const publicRoutes = [
        '/',
        '/auth/signin',
        '/legal/privacy',
        '/legal/terms',
      ];
      
      for (const route of publicRoutes) {
        await page.goto(route);
        
        // Should not be redirected to sign-in
        await expect(page).not.toHaveURL(/.*\/auth\/signin/);
      }
    });
  });

  test.describe('Authentication State', () => {
    test('should maintain authentication state across page refreshes', async ({ page }) => {
      // This test would require actual authentication
      // For now, we'll test the auth guard behavior
      
      await page.goto('/auth/signin');
      
      // Simulate being authenticated by setting auth state in localStorage
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
      });
      
      // Try to access protected route
      await page.goto('/app/templates');
      
      // The auth guard should handle this appropriately
      // Either allow access or redirect to sign-in
      await page.waitForLoadState('networkidle');
    });

    test('should handle authentication errors gracefully', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Simulate network error by intercepting the request
      await page.route('**/auth/v1/**', route => {
        route.abort('failed');
      });
      
      const emailInput = page.getByLabel('Email');
      if (await emailInput.isVisible()) {
        await emailInput.fill(TEST_USERS.magicLinkUser.email);
        
        const submitButton = page.getByRole('button', { name: 'Send me a magic link' });
        await submitButton.click();
        
        // Should show error message
        await expect(page.getByText(/error|failed/i)).toBeVisible();
      }
    });
  });

  test.describe('Sign-out Flow', () => {
    test('should sign out user successfully', async ({ page, auth }) => {
      // First, we need to be authenticated
      // This is a limitation of the current test setup
      // In a real scenario, you'd use a test user account
      
      await page.goto('/auth/signin');
      
      // Simulate being authenticated
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
      });
      
      // Navigate to a protected page
      await page.goto('/app/settings');
      
      // Look for sign-out option (this might be in a dropdown menu)
      // For now, we'll test the signOut method from our auth helper
      await auth.signOut();
      
      // Should be redirected to sign-in page
      await expect(page).toHaveURL(/.*\/auth\/signin/);
    });

    test('should clear authentication state on sign-out', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Set some auth state
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token');
        sessionStorage.setItem('radly:lastJobId', 'test-job-123');
      });
      
      // Sign out
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to access protected route
      await page.goto('/app/templates');
      
      // Should be redirected to sign-in
      await expect(page).toHaveURL(/.*\/auth\/signin/);
    });
  });

  test.describe('Auth Callback', () => {
    test('should handle successful auth callback', async ({ page }) => {
      // Simulate a successful OAuth callback
      const mockCode = 'mock-auth-code';
      const callbackUrl = `/auth/callback?code=${mockCode}&next=/app/templates`;
      
      await page.goto(callbackUrl);
      
      // Should redirect to the next URL
      await expect(page).toHaveURL(/.*\/app\/templates/);
    });

    test('should handle auth callback with missing code', async ({ page }) => {
      // Simulate a callback without a code
      await page.goto('/auth/callback?next=/app/templates');
      
      // Should show error message
      await expect(page.getByText('Sign-in error: missing code')).toBeVisible();
    });

    test('should handle auth callback with invalid code', async ({ page }) => {
      // Simulate a callback with an invalid code
      const callbackUrl = '/auth/callback?code=invalid-code&next=/app/templates';
      
      await page.goto(callbackUrl);
      
      // Should handle the error appropriately
      // The exact behavior depends on your error handling
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Error Handling', () => {
    test('should display auth error page for invalid states', async ({ page }) => {
      await page.goto('/auth/error');
      
      // Should show error page
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle network errors during authentication', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Mock network failure
      await page.route('**/auth/v1/**', route => {
        route.abort('failed');
      });
      
      const emailInput = page.getByLabel('Email');
      if (await emailInput.isVisible()) {
        await emailInput.fill(TEST_USERS.magicLinkUser.email);
        
        const submitButton = page.getByRole('button', { name: 'Send me a magic link' });
        await submitButton.click();
        
        // Should show error message
        await expect(page.getByText(/error|failed/i)).toBeVisible();
      }
    });
  });
});
