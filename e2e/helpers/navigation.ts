import { Page, expect } from '@playwright/test';

/**
 * Helper functions for common E2E test operations
 */
export class E2EHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for a specific API call to complete
   */
  async waitForApiCall(urlPattern: string | RegExp, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET') {
    return this.page.waitForResponse(response => {
      const url = response.url();
      const matchesUrl = typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
      return matchesUrl && response.request().method() === method;
    });
  }

  /**
   * Wait for loading states to complete
   */
  async waitForLoading() {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {});
    
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill a form field by label
   */
  async fillField(label: string, value: string) {
    const field = this.page.getByLabel(label);
    await field.clear();
    await field.fill(value);
  }

  /**
   * Select an option from a dropdown by label
   */
  async selectOption(label: string, optionText: string) {
    const dropdown = this.page.getByLabel(label);
    await dropdown.click();
    await this.page.getByRole('option', { name: optionText }).click();
  }

  /**
   * Toggle a switch by label
   */
  async toggleSwitch(label: string, checked: boolean) {
    const switchElement = this.page.getByLabel(label);
    const isChecked = await switchElement.isChecked();
    
    if (isChecked !== checked) {
      await switchElement.click();
    }
  }

  /**
   * Click a button by text content
   */
  async clickButton(buttonText: string) {
    await this.page.getByRole('button', { name: buttonText }).click();
  }

  /**
   * Click a link by text content
   */
  async clickLink(linkText: string) {
    await this.page.getByRole('link', { name: linkText }).click();
  }

  /**
   * Wait for a toast notification to appear
   */
  async waitForToast(message?: string) {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible();
    
    if (message) {
      await expect(toast).toContainText(message);
    }
  }

  /**
   * Wait for a modal/dialog to appear
   */
  async waitForModal() {
    await this.page.waitForSelector('[role="dialog"]');
  }

  /**
   * Close a modal/dialog
   */
  async closeModal() {
    // Try different ways to close modal
    await Promise.race([
      this.page.getByRole('button', { name: 'Close' }).click(),
      this.page.getByRole('button', { name: 'Cancel' }).click(),
      this.page.keyboard.press('Escape'),
      this.page.click('[data-testid="close-modal"]'),
    ]).catch(() => {
      // If none of the above work, try clicking outside the modal
      this.page.click('body', { position: { x: 10, y: 10 } });
    });
  }

  /**
   * Upload a file to a file input
   */
  async uploadFile(inputLabel: string, filePath: string) {
    const fileInput = this.page.getByLabel(inputLabel);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if an element exists without throwing an error
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get text content of an element
   */
  async getText(selector: string): Promise<string> {
    const element = this.page.locator(selector);
    return await element.textContent() || '';
  }

  /**
   * Wait for a specific text to appear on the page
   */
  async waitForText(text: string, timeout: number = 10000) {
    await expect(this.page.getByText(text)).toBeVisible({ timeout });
  }

  /**
   * Wait for a specific text to disappear from the page
   */
  async waitForTextToDisappear(text: string, timeout: number = 10000) {
    await expect(this.page.getByText(text)).not.toBeVisible({ timeout });
  }

  /**
   * Scroll to an element
   */
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear all form data
   */
  async clearForm() {
    // Clear all input fields
    const inputs = this.page.locator('input[type="text"], input[type="email"], input[type="number"], textarea');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).clear();
    }
  }

  /**
   * Mock API responses for testing
   */
  async mockApiResponse(url: string | RegExp, response: any, status: number = 200) {
    await this.page.route(url, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Remove all API mocks
   */
  async clearApiMocks() {
    await this.page.unrouteAll();
  }

  /**
   * Wait for a specific number of API calls
   */
  async waitForApiCalls(urlPattern: string | RegExp, count: number) {
    let callCount = 0;
    
    return this.page.waitForResponse(response => {
      const url = response.url();
      const matchesUrl = typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
      
      if (matchesUrl) {
        callCount++;
        return callCount >= count;
      }
      
      return false;
    });
  }
}
