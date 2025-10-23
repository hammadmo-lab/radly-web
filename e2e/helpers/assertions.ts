import { Page, expect } from '@playwright/test';

/**
 * Custom assertions for E2E tests
 */
export class E2EAssertions {
  constructor(private page: Page) {}

  /**
   * Assert that the user is authenticated
   */
  async expectAuthenticated() {
    // Should not be on sign-in page
    await expect(this.page).not.toHaveURL(/.*\/auth\/signin/);
    
    // Should be able to see protected content
    await expect(this.page.locator('text=Templates, text=Settings, text=Generate')).toBeVisible();
  }

  /**
   * Assert that the user is not authenticated
   */
  async expectNotAuthenticated() {
    await expect(this.page).toHaveURL(/.*\/auth\/signin/);
  }

  /**
   * Assert that a form field has the expected value
   */
  async expectFormField(fieldLabel: string, expectedValue: string) {
    const field = this.page.getByLabel(fieldLabel);
    await expect(field).toBeVisible();
    await expect(field).toHaveValue(expectedValue);
  }

  /**
   * Assert that a form field shows a validation error
   */
  async expectFormError(fieldLabel: string, errorMessage: string) {
    const field = this.page.getByLabel(fieldLabel);
    await expect(field).toBeVisible();
    
    // Look for error message near the field
    const errorElement = field.locator('..').locator(`text=${errorMessage}`);
    await expect(errorElement).toBeVisible();
  }

  /**
   * Assert that a success message is displayed
   */
  async expectSuccessMessage(message: string) {
    // Check for toast notification
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
  }

  /**
   * Assert that an error message is displayed
   */
  async expectErrorMessage(message: string) {
    // Check for error toast or error alert
    const errorElement = this.page.locator(`text=${message}`).or(
      this.page.locator('[data-sonner-toast]').filter({ hasText: message })
    );
    await expect(errorElement).toBeVisible();
  }

  /**
   * Assert that a template card is visible with correct information
   */
  async expectTemplateCard(templateName: string, modality?: string, bodySystem?: string) {
    const card = this.page.locator(`text=${templateName}`).locator('..').locator('..');
    await expect(card).toBeVisible();
    
    if (modality) {
      await expect(card).toContainText(modality);
    }
    
    if (bodySystem) {
      await expect(card).toContainText(bodySystem);
    }
  }

  /**
   * Assert that a loading state is visible
   */
  async expectLoading() {
    await expect(this.page.locator('.animate-spin')).toBeVisible();
  }

  /**
   * Assert that loading state has finished
   */
  async expectLoadingFinished() {
    await expect(this.page.locator('.animate-spin')).not.toBeVisible();
  }

  /**
   * Assert that a button is disabled
   */
  async expectButtonDisabled(buttonText: string) {
    const button = this.page.getByRole('button', { name: buttonText });
    await expect(button).toBeDisabled();
  }

  /**
   * Assert that a button is enabled
   */
  async expectButtonEnabled(buttonText: string) {
    const button = this.page.getByRole('button', { name: buttonText });
    await expect(button).toBeEnabled();
  }

  /**
   * Assert that a job status is displayed correctly
   */
  async expectJobStatus(jobId: string, status: 'queued' | 'running' | 'done' | 'failed') {
    const statusElement = this.page.locator(`[data-testid="job-status-${jobId}"]`);
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toContainText(status);
  }

  /**
   * Assert that a report is generated and displayed
   */
  async expectReportGenerated() {
    // Look for report content
    await expect(this.page.locator('text=Report, text=Findings, text=Impression')).toBeVisible();
    
    // Look for download button
    await expect(this.page.getByRole('button', { name: 'Download' })).toBeVisible();
  }

  /**
   * Assert that the page title contains expected text
   */
  async expectPageTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  }

  /**
   * Assert that the current URL matches expected pattern
   */
  async expectUrl(urlPattern: string | RegExp) {
    await expect(this.page).toHaveURL(urlPattern);
  }

  /**
   * Assert that a modal/dialog is open
   */
  async expectModalOpen() {
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
  }

  /**
   * Assert that a modal/dialog is closed
   */
  async expectModalClosed() {
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
  }

  /**
   * Assert that a table contains expected data
   */
  async expectTableRow(tableSelector: string, rowData: Record<string, string>) {
    const table = this.page.locator(tableSelector);
    
    for (const value of Object.values(rowData)) {
      const cell = table.locator(`text=${value}`);
      await expect(cell).toBeVisible();
    }
  }

  /**
   * Assert that a dropdown contains expected options
   */
  async expectDropdownOptions(dropdownLabel: string, expectedOptions: string[]) {
    const dropdown = this.page.getByLabel(dropdownLabel);
    await dropdown.click();
    
    for (const option of expectedOptions) {
      await expect(this.page.getByRole('option', { name: option })).toBeVisible();
    }
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
  }

  /**
   * Assert that a file download was triggered
   */
  async expectFileDownload(filename: string) {
    const downloadPromise = this.page.waitForEvent('download');
    // Trigger download (this would be done by clicking a download button)
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(filename);
  }

  /**
   * Assert that an element has specific CSS classes
   */
  async expectElementClasses(selector: string, expectedClasses: string[]) {
    const element = this.page.locator(selector);
    
    for (const className of expectedClasses) {
      await expect(element).toHaveClass(new RegExp(className));
    }
  }

  /**
   * Assert that an element is visible and contains specific text
   */
  async expectElementVisibleWithText(selector: string, text: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    await expect(element).toContainText(text);
  }

  /**
   * Assert that a form is valid (no validation errors)
   */
  async expectFormValid() {
    // Check that there are no validation error messages
    const errorMessages = this.page.locator('.text-destructive, .error-message');
    await expect(errorMessages).toHaveCount(0);
  }

  /**
   * Assert that a form has validation errors
   */
  async expectFormInvalid() {
    // Check that there are validation error messages
    const errorMessages = this.page.locator('.text-destructive, .error-message');
    await expect(errorMessages).toHaveCount(1);
  }
}
