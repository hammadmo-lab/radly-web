import { test, expect } from './fixtures/auth';
import { TEST_TEMPLATES, MOCK_API_RESPONSES, TEST_USERS } from './fixtures/test-data';

test.describe('Templates Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to protected route (test mode bypasses auth)
    await page.goto('/app/templates');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Templates Page', () => {
    test('should display templates page correctly', async ({ page, navigation, assertions }) => {
      await navigation.goToTemplates();
      
      // Check page title and heading
      await expect(page).toHaveTitle(/Templates/);
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
      
      // Check page description
      await expect(page.getByText('Choose from our collection of medical report templates')).toBeVisible();
      
      // Check for "New Report" button
      await expect(page.getByRole('button', { name: 'New Report' })).toBeVisible();
    });

    test('should display search functionality', async ({ page, navigation }) => {
      await navigation.goToTemplates();
      
      // Check search input
      const searchInput = page.getByPlaceholder('Search templates...');
      await expect(searchInput).toBeVisible();
      
      // Check search icon
      await expect(page.locator('svg[data-lucide="search"]')).toBeVisible();
    });

    test('should load templates from API', async ({ page, navigation }) => {
      // Mock the templates API response
      await page.route('**/api/v1/templates**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.templates.success),
        });
      });
      
      await navigation.goToTemplates();
      
      // Wait for templates to load
      await page.waitForLoadState('networkidle');
      
      // Check that templates are displayed
      for (const template of TEST_TEMPLATES) {
        await expect(page.getByText(template.name)).toBeVisible();
      }
    });

    test('should handle empty templates list', async ({ page, navigation }) => {
      // Mock empty templates response
      await page.route('**/api/v1/templates**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.templates.empty),
        });
      });
      
      await navigation.goToTemplates();
      
      // Check for empty state message
      await expect(page.getByText('No templates available')).toBeVisible();
      await expect(page.getByText('Templates will appear here once they are available')).toBeVisible();
    });

    test('should handle API error gracefully', async ({ page, navigation }) => {
      // Mock API error
      await page.route('**/api/v1/templates**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.templates.error),
        });
      });
      
      await navigation.goToTemplates();
      
      // Check for error state
      await expect(page.getByText("Couldn't load templates")).toBeVisible();
      await expect(page.getByText('There was an error loading the templates. Please try again.')).toBeVisible();
      
      // Check for retry button
      await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
    });
  });

  test.describe('Template Search and Filtering', () => {
    test.beforeEach(async ({ page, navigation }) => {
      // Mock templates API with test data
      await page.route('**/api/v1/templates**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.templates.success),
        });
      });
      
      await navigation.goToTemplates();
      await page.waitForLoadState('networkidle');
    });

    test('should filter templates by name', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search templates...');
      
      // Search for "Chest"
      await searchInput.fill('Chest');
      
      // Should show only chest-related templates
      await expect(page.getByText('Chest CT Angiography')).toBeVisible();
      await expect(page.getByText('Chest X-Ray')).toBeVisible();
      
      // Should not show other templates
      await expect(page.getByText('Mammography')).not.toBeVisible();
    });

    test('should filter templates by modality', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search templates...');
      
      // Search for "CT"
      await searchInput.fill('CT');
      
      // Should show only CT templates
      await expect(page.getByText('Chest CT Angiography')).toBeVisible();
      
      // Should not show X-Ray or Mammography
      await expect(page.getByText('Chest X-Ray')).not.toBeVisible();
      await expect(page.getByText('Mammography')).not.toBeVisible();
    });

    test('should filter templates by body system', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search templates...');
      
      // Search for "Brain"
      await searchInput.fill('Brain');
      
      // Should show only brain-related templates
      await expect(page.getByText('MRI Brain')).toBeVisible();
      
      // Should not show chest templates
      await expect(page.getByText('Chest CT Angiography')).not.toBeVisible();
    });

    test('should show no results message for invalid search', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search templates...');
      
      // Search for something that doesn't exist
      await searchInput.fill('NonExistentTemplate');
      
      // Should show no results message
      await expect(page.getByText('No templates found')).toBeVisible();
      await expect(page.getByText('Try adjusting your search terms')).toBeVisible();
    });

    test('should clear search and show all templates', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search templates...');
      
      // First search for something specific
      await searchInput.fill('Chest');
      await expect(page.getByText('Chest CT Angiography')).toBeVisible();
      
      // Clear search
      await searchInput.clear();
      
      // Should show all templates again
      for (const template of TEST_TEMPLATES) {
        await expect(page.getByText(template.name)).toBeVisible();
      }
    });
  });

  test.describe('Template Cards', () => {
    test.beforeEach(async ({ page, navigation }) => {
      // Mock templates API
      await page.route('**/api/v1/templates**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.templates.success),
        });
      });
      
      await navigation.goToTemplates();
      await page.waitForLoadState('networkidle');
    });

    test('should display template cards with correct information', async ({ page }) => {
      const template = TEST_TEMPLATES[0]; // Chest CT Angiography
      
      // Find the template card
      const card = page.locator(`text=${template.name}`).locator('..').locator('..');
      
      // Check template name
      await expect(card.getByText(template.name)).toBeVisible();
      
      // Check modality and body system
      await expect(card.getByText(`${template.modality} • ${template.bodySystem}`)).toBeVisible();
      
      // Check description
      await expect(card.getByText(template.description)).toBeVisible();
      
      // Check "Use Template" button
      await expect(card.getByRole('button', { name: 'Use Template' })).toBeVisible();
    });

    test('should navigate to generate page when clicking "Use Template"', async ({ page }) => {
      const template = TEST_TEMPLATES[0];
      
      // Click "Use Template" button
      const useButton = page.getByRole('button', { name: 'Use Template' }).first();
      await useButton.click();
      
      // Should navigate to generate page with template ID
      await expect(page).toHaveURL(/.*\/app\/generate\?templateId=/);
      
      // Should show template name in the generate page
      await expect(page.getByText(`Using template: ${template.name}`)).toBeVisible();
    });

    test('should show updated date for templates', async ({ page }) => {
      const card = page.locator('[data-testid="template-card"]').first();
      
      // Check for updated date
      await expect(card.getByText(/Updated/)).toBeVisible();
    });

    test('should handle template cards with missing data gracefully', async ({ page }) => {
      // Mock templates with missing fields
      const incompleteTemplates = [
        {
          template_id: 'incomplete-1',
          name: 'Incomplete Template',
          // Missing modality, bodySystem, description
        }
      ];
      
      await page.route('**/api/v1/templates**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(incompleteTemplates),
        });
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still display the template card
      await expect(page.getByText('Incomplete Template')).toBeVisible();
      
      // Should show "Use Template" button
      await expect(page.getByRole('button', { name: 'Use Template' })).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to generate page from "New Report" button', async ({ page, navigation }) => {
      await navigation.goToTemplates();
      
      // Click "New Report" button
      await page.getByRole('button', { name: 'New Report' }).click();
      
      // Should navigate to generate page
      await expect(page).toHaveURL(/.*\/app\/generate/);
    });

    test('should navigate back from generate page', async ({ page, navigation }) => {
      await navigation.goToGenerate();
      
      // Click "Back to Templates" button
      await page.getByRole('button', { name: 'Back to Templates' }).click();
      
      // Should navigate back to templates page
      await expect(page).toHaveURL(/.*\/app\/templates/);
    });
  });

  test.describe('Loading States', () => {
    test('should show loading state while fetching templates', async ({ page, navigation }) => {
      // Mock slow API response
      await page.route('**/api/v1/templates**', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.templates.success),
        });
      });
      
      await navigation.goToTemplates();
      
      // Should show loading skeleton
      await expect(page.locator('.animate-pulse')).toBeVisible();
      
      // Wait for loading to complete
      await page.waitForLoadState('networkidle');
      
      // Loading skeleton should be gone
      await expect(page.locator('.animate-pulse')).not.toBeVisible();
    });

    test('should handle retry after API error', async ({ page, navigation }) => {
      // Mock initial API error
      await page.route('**/api/v1/templates**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.templates.error),
        });
      });
      
      await navigation.goToTemplates();
      
      // Should show error state
      await expect(page.getByText("Couldn't load templates")).toBeVisible();
      
      // Mock successful retry
      await page.route('**/api/v1/templates**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.templates.success),
        });
      });
      
      // Click retry button
      await page.getByRole('button', { name: 'Retry' }).click();
      
      // Should show templates after retry
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('Chest CT Angiography')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display templates correctly on mobile', async ({ page, navigation }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await navigation.goToTemplates();
      
      // Check that templates are still visible
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
      
      // Check that search input is visible
      await expect(page.getByPlaceholder('Search templates...')).toBeVisible();
    });

    test('should display templates correctly on tablet', async ({ page, navigation }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await navigation.goToTemplates();
      
      // Check that templates are still visible
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
    });
  });
});
