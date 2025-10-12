import { test, expect } from './fixtures/auth';
import { TEST_USERS } from './fixtures/test-data';

test.describe('Settings Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page first to establish context
    await page.goto('/');
    // Mock authentication state
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token');
    });
  });

  test.describe('Settings Page', () => {
    test('should display settings page correctly', async ({ page, navigation }) => {
      await navigation.goToSettings();
      
      // Check page title and heading
      await expect(page).toHaveTitle(/Settings/);
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
      
      // Check page description
      await expect(page.getByText('Manage your account settings and preferences')).toBeVisible();
    });

    test('should display all settings sections', async ({ page, navigation }) => {
      await navigation.goToSettings();
      
      // Check for all main sections
      await expect(page.getByText('Account Information')).toBeVisible();
      await expect(page.getByText('Terms & Privacy')).toBeVisible();
      await expect(page.getByText('Default Settings')).toBeVisible();
      await expect(page.getByText('System Status')).toBeVisible();
    });
  });

  test.describe('Account Information', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToSettings();
    });

    test('should display user account information', async ({ page }) => {
      // Mock user profile data
      const mockUser = {
        id: 'test-user-123',
        email: TEST_USERS.validUser.email,
        created_at: '2024-01-01T00:00:00Z',
      };
      
      await page.evaluate((user) => {
        window.mockUser = user;
      }, mockUser);
      
      // Check account information section
      const accountSection = page.locator('text=Account Information').locator('..').locator('..');
      
      // Check email display
      await expect(accountSection.getByText(TEST_USERS.validUser.email)).toBeVisible();
      
      // Check user ID display
      await expect(accountSection.getByText('test-user-123')).toBeVisible();
      
      // Check account created date
      await expect(accountSection.getByText(/1\/1\/2024/)).toBeVisible();
    });

    test('should handle missing user data gracefully', async ({ page }) => {
      // Mock empty user data
      await page.evaluate(() => {
        window.mockUser = null;
      });
      
      // Should still display the account section
      await expect(page.getByText('Account Information')).toBeVisible();
    });
  });

  test.describe('Terms & Privacy', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToSettings();
    });

    test('should display terms acceptance status', async ({ page }) => {
      // Mock profile data with terms acceptance
      const mockProfile = {
        accepted_terms_at: '2024-01-01T00:00:00Z',
      };
      
      await page.evaluate((profile) => {
        window.mockProfile = profile;
      }, mockProfile);
      
      // Check terms section
      const termsSection = page.locator('text=Terms & Privacy').locator('..').locator('..');
      
      // Check terms accepted date
      await expect(termsSection.getByText(/1\/1\/2024/)).toBeVisible();
    });

    test('should display not accepted status', async ({ page }) => {
      // Mock profile data without terms acceptance
      const mockProfile = {
        accepted_terms_at: null,
      };
      
      await page.evaluate((profile) => {
        window.mockProfile = profile;
      }, mockProfile);
      
      // Check terms section
      const termsSection = page.locator('text=Terms & Privacy').locator('..').locator('..');
      
      // Check not accepted status
      await expect(termsSection.getByText('Not accepted')).toBeVisible();
    });
  });

  test.describe('Default Settings', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToSettings();
    });

    test('should display default settings form', async ({ page }) => {
      // Check default settings section
      const settingsSection = page.locator('text=Default Settings').locator('..').locator('..');
      
      // Check form fields
      await expect(settingsSection.getByLabel('Default Signature Name')).toBeVisible();
      await expect(settingsSection.getByLabel('Default Date Format')).toBeVisible();
      
      // Check save button
      await expect(settingsSection.getByRole('button', { name: 'Save Settings' })).toBeVisible();
    });

    test('should load existing default settings', async ({ page }) => {
      // Mock profile data with existing settings
      const mockProfile = {
        default_signature_name: 'Dr. Jane Smith',
        default_signature_date_format: 'DD/MM/YYYY',
      };
      
      await page.evaluate((profile) => {
        window.mockProfile = profile;
      }, mockProfile);
      
      // Check that fields are populated
      await expect(page.getByLabel('Default Signature Name')).toHaveValue('Dr. Jane Smith');
      await expect(page.getByLabel('Default Date Format')).toHaveValue('DD/MM/YYYY');
    });

    test('should update default signature name', async ({ page }) => {
      // Mock successful API response
      await page.route('**/api/v1/profiles**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });
      
      // Update signature name
      const signatureField = page.getByLabel('Default Signature Name');
      await signatureField.clear();
      await signatureField.fill('Dr. John Doe');
      
      // Click save button
      await page.getByRole('button', { name: 'Save Settings' }).click();
      
      // Should show success message
      await expect(page.getByText('Settings saved successfully!')).toBeVisible();
    });

    test('should update default date format', async ({ page }) => {
      // Mock successful API response
      await page.route('**/api/v1/profiles**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });
      
      // Update date format
      const dateFormatSelect = page.getByLabel('Default Date Format');
      await dateFormatSelect.selectOption('YYYY-MM-DD');
      
      // Click save button
      await page.getByRole('button', { name: 'Save Settings' }).click();
      
      // Should show success message
      await expect(page.getByText('Settings saved successfully!')).toBeVisible();
    });

    test('should handle save settings error', async ({ page }) => {
      // Mock API error
      await page.route('**/api/v1/profiles**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to save settings' }),
        });
      });
      
      // Update signature name
      const signatureField = page.getByLabel('Default Signature Name');
      await signatureField.clear();
      await signatureField.fill('Dr. John Doe');
      
      // Click save button
      await page.getByRole('button', { name: 'Save Settings' }).click();
      
      // Should show error message
      await expect(page.getByText('Failed to save settings')).toBeVisible();
    });

    test('should show loading state during save', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/v1/profiles**', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });
      
      // Update signature name
      const signatureField = page.getByLabel('Default Signature Name');
      await signatureField.clear();
      await signatureField.fill('Dr. John Doe');
      
      // Click save button
      await page.getByRole('button', { name: 'Save Settings' }).click();
      
      // Should show loading state
      await expect(page.getByRole('button', { name: 'Saving...' })).toBeVisible();
      
      // Wait for completion
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('System Status', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToSettings();
    });

    test('should display system status section', async ({ page }) => {
      // Check system status section
      const statusSection = page.locator('text=System Status').locator('..').locator('..');
      
      // Check connectivity status
      await expect(statusSection.getByText('API Connectivity')).toBeVisible();
      
      // Check last updated
      await expect(statusSection.getByText('Last Updated')).toBeVisible();
    });

    test('should show connected status', async ({ page }) => {
      // Mock successful health check
      await page.route('**/api/v1/health**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'healthy' }),
        });
      });
      
      // Reload page to trigger health check
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check connected status
      await expect(page.getByText('Connected')).toBeVisible();
    });

    test('should show error status when API is down', async ({ page }) => {
      // Mock failed health check
      await page.route('**/api/v1/health**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service unavailable' }),
        });
      });
      
      // Reload page to trigger health check
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check error status
      await expect(page.getByText('Error')).toBeVisible();
    });

    test('should show checking status initially', async ({ page }) => {
      // Mock slow health check
      await page.route('**/api/v1/health**', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'healthy' }),
        });
      });
      
      // Reload page
      await page.reload();
      
      // Should show checking status initially
      await expect(page.getByText('Checking...')).toBeVisible();
      
      // Wait for completion
      await page.waitForLoadState('networkidle');
    });

    test('should display last updated timestamp', async ({ page }) => {
      // Mock profile data with updated timestamp
      const mockProfile = {
        updated_at: '2024-01-01T12:00:00Z',
      };
      
      await page.evaluate((profile) => {
        window.mockProfile = profile;
      }, mockProfile);
      
      // Check last updated timestamp
      await expect(page.getByText(/1\/1\/2024.*12:00/)).toBeVisible();
    });

    test('should display never updated when no timestamp', async ({ page }) => {
      // Mock profile data without updated timestamp
      const mockProfile = {
        updated_at: null,
      };
      
      await page.evaluate((profile) => {
        window.mockProfile = profile;
      }, mockProfile);
      
      // Check never updated status
      await expect(page.getByText('Never')).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToSettings();
    });

    test('should validate signature name length', async ({ page }) => {
      const signatureField = page.getByLabel('Default Signature Name');
      
      // Try to enter very long signature name
      const longName = 'A'.repeat(1000);
      await signatureField.fill(longName);
      
      // Should accept the input (no client-side validation)
      await expect(signatureField).toHaveValue(longName);
    });

    test('should validate date format selection', async ({ page }) => {
      const dateFormatSelect = page.getByLabel('Default Date Format');
      
      // Check available options
      await dateFormatSelect.click();
      
      // Should have expected options
      await expect(page.getByRole('option', { name: 'MM/DD/YYYY' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'DD/MM/YYYY' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'YYYY-MM-DD' })).toBeVisible();
      
      // Close dropdown
      await page.keyboard.press('Escape');
    });
  });

  test.describe('Data Persistence', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToSettings();
    });

    test('should persist settings after page reload', async ({ page }) => {
      // Mock successful API response
      await page.route('**/api/v1/profiles**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });
      
      // Update settings
      const signatureField = page.getByLabel('Default Signature Name');
      await signatureField.clear();
      await signatureField.fill('Dr. John Doe');
      
      const dateFormatSelect = page.getByLabel('Default Date Format');
      await dateFormatSelect.selectOption('DD/MM/YYYY');
      
      // Save settings
      await page.getByRole('button', { name: 'Save Settings' }).click();
      
      // Wait for success message
      await expect(page.getByText('Settings saved successfully!')).toBeVisible();
      
      // Mock profile data with updated settings
      const mockProfile = {
        default_signature_name: 'Dr. John Doe',
        default_signature_date_format: 'DD/MM/YYYY',
      };
      
      await page.evaluate((profile) => {
        window.mockProfile = profile;
      }, mockProfile);
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check that settings are persisted
      await expect(page.getByLabel('Default Signature Name')).toHaveValue('Dr. John Doe');
      await expect(page.getByLabel('Default Date Format')).toHaveValue('DD/MM/YYYY');
    });

    test('should reflect settings in new reports', async ({ page, navigation }) => {
      // Mock successful API response
      await page.route('**/api/v1/profiles**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });
      
      // Update default signature name
      const signatureField = page.getByLabel('Default Signature Name');
      await signatureField.clear();
      await signatureField.fill('Dr. John Doe');
      
      // Save settings
      await page.getByRole('button', { name: 'Save Settings' }).click();
      
      // Wait for success message
      await expect(page.getByText('Settings saved successfully!')).toBeVisible();
      
      // Navigate to generate page
      await navigation.goToGenerate();
      
      // Check that default signature name is populated
      await expect(page.getByLabel('Signature Name')).toHaveValue('Dr. John Doe');
    });
  });

  test.describe('Error Handling', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToSettings();
    });

    test('should handle network errors during save', async ({ page }) => {
      // Mock network error
      await page.route('**/api/v1/profiles**', route => {
        route.abort('failed');
      });
      
      // Update signature name
      const signatureField = page.getByLabel('Default Signature Name');
      await signatureField.clear();
      await signatureField.fill('Dr. John Doe');
      
      // Click save button
      await page.getByRole('button', { name: 'Save Settings' }).click();
      
      // Should show error message
      await expect(page.getByText('Failed to save settings')).toBeVisible();
    });

    test('should handle authentication errors', async ({ page }) => {
      // Mock authentication error
      await page.route('**/api/v1/profiles**', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      });
      
      // Update signature name
      const signatureField = page.getByLabel('Default Signature Name');
      await signatureField.clear();
      await signatureField.fill('Dr. John Doe');
      
      // Click save button
      await page.getByRole('button', { name: 'Save Settings' }).click();
      
      // Should show error message
      await expect(page.getByText('Failed to save settings')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display settings correctly on mobile', async ({ page, navigation }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await navigation.goToSettings();
      
      // Check that all sections are visible
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
      await expect(page.getByText('Account Information')).toBeVisible();
      await expect(page.getByText('Default Settings')).toBeVisible();
    });

    test('should display settings correctly on tablet', async ({ page, navigation }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await navigation.goToSettings();
      
      // Check that all sections are visible
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
      await expect(page.getByText('Account Information')).toBeVisible();
      await expect(page.getByText('Default Settings')).toBeVisible();
    });
  });
});
