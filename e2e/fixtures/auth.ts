import { test as base, expect } from '@playwright/test';
import { Page } from '@playwright/test';

// Test user credentials - these should be test accounts in your Supabase project
export const TEST_USERS = {
  validUser: {
    email: 'test@radly.com',
    password: 'testpassword123', // Only if using email/password auth
  },
  magicLinkUser: {
    email: 'magic@radly.com',
  },
  googleUser: {
    email: 'google@radly.com',
  },
} as const;

// Test data for reports
export const TEST_DATA = {
  patient: {
    name: 'John Doe',
    mrn: 'MRN123456',
    age: 45,
    dob: '01/01/1980',
    sex: 'Male',
    history: 'Patient presents with chest pain and shortness of breath.',
  },
  clinical: {
    indication: 'Chest pain and shortness of breath. Rule out pulmonary embolism.',
    findings: '- No acute pulmonary embolism\n- Mild cardiomegaly\n- Clear lung fields\n- No pleural effusion',
    technique: 'CT angiography of the chest with contrast',
  },
  template: {
    id: 'chest-ct-angio',
    name: 'Chest CT Angiography',
  },
} as const;

// Authentication helper functions
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Sign in using magic link (recommended for E2E tests)
   * This will trigger the magic link flow and wait for completion
   */
  async signInWithMagicLink(email: string = TEST_USERS.magicLinkUser.email) {
    await this.page.goto('/auth/signin');
    
    // Fill in email
    await this.page.getByLabel('Email').fill(email);
    
    // Click send magic link button
    await this.page.getByRole('button', { name: 'Send me a magic link' }).click();
    
    // Wait for success message
    await expect(this.page.getByText('Check your email for the magic link.')).toBeVisible();
    
    // Note: In a real E2E test, you'd need to intercept the email or use a test email service
    // For now, we'll simulate the callback by directly calling the auth callback
    // This is a limitation of magic link testing - consider using email/password for E2E
  }

  /**
   * Sign in using Google OAuth (if enabled)
   * This will open the Google OAuth flow
   */
  async signInWithGoogle() {
    await this.page.goto('/auth/signin');
    
    // Click Google sign-in button
    await this.page.getByRole('button', { name: 'Continue with Google' }).click();
    
    // Wait for Google OAuth page
    await this.page.waitForURL('**/accounts.google.com/**');
    
    // Note: In a real E2E test, you'd need to handle the OAuth flow
    // This might require mocking or using test OAuth credentials
  }

  /**
   * Sign in using Apple OAuth (if enabled)
   */
  async signInWithApple() {
    await this.page.goto('/auth/signin');
    
    // Click Apple sign-in button
    await this.page.getByRole('button', { name: 'Continue with Apple' }).click();
    
    // Wait for Apple OAuth page
    await this.page.waitForURL('**/appleid.apple.com/**');
    
    // Note: Similar to Google OAuth, this requires handling the OAuth flow
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    // Look for sign out button/link - this might be in a dropdown menu
    // We'll need to check the actual UI to see where the sign out option is
    await this.page.goto('/app/settings');
    
    // For now, we'll use the browser's local storage to clear auth state
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Navigate to sign-in page to ensure we're logged out
    await this.page.goto('/auth/signin');
  }

  /**
   * Check if user is authenticated by looking for user-specific content
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Try to access a protected route
      await this.page.goto('/app/templates');
      
      // If we're redirected to sign-in, we're not authenticated
      if (this.page.url().includes('/auth/signin')) {
        return false;
      }
      
      // If we can see the templates page, we're authenticated
      await expect(this.page.getByText('Templates')).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuth() {
    // Wait for the page to load and check if we're authenticated
    await this.page.waitForLoadState('networkidle');
    
    // Wait for either the auth loading to complete or redirect to sign-in
    await Promise.race([
      this.page.waitForURL('**/auth/signin'),
      this.page.waitForSelector('[data-testid="user-menu"], [data-testid="sign-out"], .user-email', { timeout: 5000 }).catch(() => null)
    ]);
  }
}

// Navigation helper functions
export class NavigationHelper {
  constructor(private page: Page) {}

  async goToTemplates() {
    await this.page.goto('/app/templates');
    await this.page.waitForLoadState('networkidle');
  }

  async goToGenerate(templateId?: string) {
    const url = templateId ? `/app/generate?templateId=${templateId}` : '/app/generate';
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async goToSettings() {
    await this.page.goto('/app/settings');
    await this.page.waitForLoadState('networkidle');
  }

  async goToReports() {
    await this.page.goto('/app/reports');
    await this.page.waitForLoadState('networkidle');
  }

  async goToReport(reportId: string) {
    await this.page.goto(`/app/report/${reportId}`);
    await this.page.waitForLoadState('networkidle');
  }
}

// Custom assertions
export class CustomAssertions {
  constructor(private page: Page) {}

  async expectAuthenticated() {
    await expect(this.page).not.toHaveURL(/.*\/auth\/signin/);
    await expect(this.page.locator('text=Templates, text=Settings, text=Generate')).toBeVisible();
  }

  async expectNotAuthenticated() {
    await expect(this.page).toHaveURL(/.*\/auth\/signin/);
  }

  async expectTemplateCard(templateName: string) {
    await expect(this.page.getByText(templateName)).toBeVisible();
  }

  async expectFormField(fieldName: string, value?: string) {
    const field = this.page.getByLabel(fieldName);
    await expect(field).toBeVisible();
    if (value) {
      await expect(field).toHaveValue(value);
    }
  }

  async expectSuccessMessage(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}

// Extend the base test with our fixtures
export const test = base.extend<{
  auth: AuthHelper;
  navigation: NavigationHelper;
  assertions: CustomAssertions;
}>({
  auth: async ({ page }, use) => {
    const authHelper = new AuthHelper(page);
    await use(authHelper);
  },
  
  navigation: async ({ page }, use) => {
    const navigationHelper = new NavigationHelper(page);
    await use(navigationHelper);
  },
  
  assertions: async ({ page }, use) => {
    const assertions = new CustomAssertions(page);
    await use(assertions);
  },
});

export { expect } from '@playwright/test';
