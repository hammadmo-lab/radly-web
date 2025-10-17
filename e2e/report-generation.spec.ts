import { test, expect } from './fixtures/auth';
import { TEST_PATIENTS, TEST_CLINICAL_DATA, TEST_TEMPLATES, MOCK_API_RESPONSES, TEST_USERS } from './fixtures/test-data';

test.describe('Report Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to protected route (test mode bypasses auth)
    await page.goto('/app/generate');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Generate Page', () => {
    test('should display generate page correctly', async ({ page, navigation }) => {
      await navigation.goToGenerate();
      
      // Check page title and heading
      await expect(page).toHaveTitle(/Generate Report/);
      await expect(page.getByRole('heading', { name: 'Generate Report' })).toBeVisible();
      
      // Check for "Back to Templates" button
      await expect(page.getByRole('button', { name: 'Back to Templates' })).toBeVisible();
      
      // Check for form sections
      await expect(page.getByText('Patient Information')).toBeVisible();
      await expect(page.getByText('Clinical Information')).toBeVisible();
      await expect(page.getByText('Signature (Optional)')).toBeVisible();
    });

    test('should display template selection when no template ID provided', async ({ page, navigation }) => {
      await navigation.goToGenerate();
      
      // Should show template selection banner
      await expect(page.getByText('No template selected')).toBeVisible();
      await expect(page.getByText('Choose a template from the Templates page to get started with a pre-filled form.')).toBeVisible();
      
      // Should show template selection form
      await expect(page.getByLabel('Select Template')).toBeVisible();
    });

    test('should display template information when template ID provided', async ({ page, navigation }) => {
      const template = TEST_TEMPLATES[0];
      
      // Mock template API response
      await page.route(`**/api/v1/template/${template.id}**`, route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(template),
        });
      });
      
      await navigation.goToGenerate(template.id);
      
      // Should show template name
      await expect(page.getByText(`Using template: ${template.name}`)).toBeVisible();
      
      // Should not show template selection form
      await expect(page.getByLabel('Select Template')).not.toBeVisible();
    });
  });

  test.describe('Patient Information Form', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToGenerate();
    });

    test('should display patient information toggle', async ({ page }) => {
      // Check toggle switch
      const toggle = page.locator('input[type="checkbox"]').first();
      await expect(toggle).toBeVisible();
      
      // Check toggle label
      await expect(page.getByText('Include patient data in report')).toBeVisible();
      await expect(page.getByText('Toggle to include name/age/sex/MRN/history in the generated report and DOCX.')).toBeVisible();
    });

    test('should enable/disable patient fields based on toggle', async ({ page }) => {
      const patientFields = [
        'Patient Name',
        'Medical Record Number',
        'Age',
        'Date of Birth',
        'Sex',
        'Patient History (optional)',
      ];
      
      // Initially, patient fields should be disabled
      for (const field of patientFields) {
        const fieldElement = page.getByLabel(field);
        await expect(fieldElement).toBeDisabled();
      }
      
      // Enable patient data toggle
      const toggle = page.locator('input[type="checkbox"]').first();
      await toggle.click();
      
      // Patient fields should now be enabled
      for (const field of patientFields) {
        const fieldElement = page.getByLabel(field);
        await expect(fieldElement).toBeEnabled();
      }
    });

    test('should fill patient information correctly', async ({ page }) => {
      const patient = TEST_PATIENTS[0];
      
      // Enable patient data toggle
      const toggle = page.locator('input[type="checkbox"]').first();
      await toggle.click();
      
      // Fill patient information
      await page.getByLabel('Patient Name').fill(patient.name);
      await page.getByLabel('Medical Record Number').fill(patient.mrn);
      await page.getByLabel('Age').fill(patient.age.toString());
      await page.getByLabel('Date of Birth').fill(patient.dob);
      
      // Select sex from dropdown
      await page.getByLabel('Sex').click();
      await page.getByRole('option', { name: patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other' }).click();
      
      await page.getByLabel('Patient History (optional)').fill(patient.history);
      
      // Verify values are set
      await expect(page.getByLabel('Patient Name')).toHaveValue(patient.name);
      await expect(page.getByLabel('Medical Record Number')).toHaveValue(patient.mrn);
      await expect(page.getByLabel('Age')).toHaveValue(patient.age.toString());
      await expect(page.getByLabel('Date of Birth')).toHaveValue(patient.dob);
      await expect(page.getByLabel('Sex')).toHaveText(patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other');
      await expect(page.getByLabel('Patient History (optional)')).toHaveValue(patient.history);
    });

    test('should validate patient information', async ({ page }) => {
      // Enable patient data toggle
      const toggle = page.locator('input[type="checkbox"]').first();
      await toggle.click();
      
      // Try to submit with invalid age
      await page.getByLabel('Age').fill('-5');
      
      // Try to submit form
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show validation error
      await expect(page.getByText(/age|invalid/i)).toBeVisible();
    });
  });

  test.describe('Clinical Information Form', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToGenerate();
    });

    test('should display clinical information fields', async ({ page }) => {
      // Check required fields
      await expect(page.getByLabel('Indication / Clinical history (required)')).toBeVisible();
      await expect(page.getByLabel('Findings (required)')).toBeVisible();
      
      // Check optional field
      await expect(page.getByLabel('Technique (optional)')).toBeVisible();
    });

    test('should fill clinical information correctly', async ({ page }) => {
      const clinical = TEST_CLINICAL_DATA[0];
      
      // Fill clinical information
      await page.getByLabel('Indication / Clinical history (required)').fill(clinical.indication);
      await page.getByLabel('Findings (required)').fill(clinical.findings);
      await page.getByLabel('Technique (optional)').fill(clinical.technique);
      
      // Verify values are set
      await expect(page.getByLabel('Indication / Clinical history (required)')).toHaveValue(clinical.indication);
      await expect(page.getByLabel('Findings (required)')).toHaveValue(clinical.findings);
      await expect(page.getByLabel('Technique (optional)')).toHaveValue(clinical.technique);
    });

    test('should validate required clinical fields', async ({ page }) => {
      // Try to submit without required fields
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show validation errors
      await expect(page.getByText(/indication.*required/i)).toBeVisible();
      await expect(page.getByText(/findings.*required/i)).toBeVisible();
    });

    test('should handle long text in clinical fields', async ({ page }) => {
      const longText = 'A'.repeat(1000);
      
      // Fill with long text
      await page.getByLabel('Indication / Clinical history (required)').fill(longText);
      await page.getByLabel('Findings (required)').fill(longText);
      
      // Should accept long text
      await expect(page.getByLabel('Indication / Clinical history (required)')).toHaveValue(longText);
      await expect(page.getByLabel('Findings (required)')).toHaveValue(longText);
    });
  });

  test.describe('Signature Form', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToGenerate();
    });

    test('should display signature fields', async ({ page }) => {
      // Check signature fields
      await expect(page.getByLabel('Signature Name')).toBeVisible();
      await expect(page.getByLabel('Date')).toBeVisible();
    });

    test('should fill signature information', async ({ page }) => {
      const signatureName = 'Dr. Jane Smith';
      const signatureDate = new Date().toLocaleDateString();
      
      // Fill signature information
      await page.getByLabel('Signature Name').fill(signatureName);
      await page.getByLabel('Date').fill(signatureDate);
      
      // Verify values are set
      await expect(page.getByLabel('Signature Name')).toHaveValue(signatureName);
      await expect(page.getByLabel('Date')).toHaveValue(signatureDate);
    });

    test('should have default date value', async ({ page }) => {
      const dateField = page.getByLabel('Date');
      const defaultValue = await dateField.inputValue();
      
      // Should have a default date value
      expect(defaultValue).toBeTruthy();
    });
  });

  test.describe('Form Submission', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToGenerate();
    });

    test('should submit form successfully', async ({ page }) => {
      const clinical = TEST_CLINICAL_DATA[0];
      
      // Mock job creation API
      await page.route('**/api/v1/jobs**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.job.queued),
        });
      });
      
      // Fill required fields
      await page.getByLabel('Indication / Clinical history (required)').fill(clinical.indication);
      await page.getByLabel('Findings (required)').fill(clinical.findings);
      
      // Submit form
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show success message
      await expect(page.getByText('Report generation started!')).toBeVisible();
      
      // Should navigate to report page
      await expect(page).toHaveURL(/.*\/app\/report\//);
    });

    test('should submit form with patient data', async ({ page }) => {
      const patient = TEST_PATIENTS[0];
      const clinical = TEST_CLINICAL_DATA[0];
      
      // Mock job creation API
      await page.route('**/api/v1/jobs**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.job.queued),
        });
      });
      
      // Enable patient data toggle
      const toggle = page.locator('input[type="checkbox"]').first();
      await toggle.click();
      
      // Fill patient information
      await page.getByLabel('Patient Name').fill(patient.name);
      await page.getByLabel('Medical Record Number').fill(patient.mrn);
      await page.getByLabel('Age').fill(patient.age.toString());
      
      // Select sex from dropdown
      await page.getByLabel('Sex').click();
      await page.getByRole('option', { name: patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other' }).click();
      
      // Fill clinical information
      await page.getByLabel('Indication / Clinical history (required)').fill(clinical.indication);
      await page.getByLabel('Findings (required)').fill(clinical.findings);
      
      // Submit form
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show success message
      await expect(page.getByText('Report generation started!')).toBeVisible();
      
      // Should navigate to report page
      await expect(page).toHaveURL(/.*\/app\/report\//);
    });

    test('should handle submission errors', async ({ page }) => {
      const clinical = TEST_CLINICAL_DATA[0];
      
      // Mock API error
      await page.route('**/api/v1/jobs**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to create job' }),
        });
      });
      
      // Fill required fields
      await page.getByLabel('Indication / Clinical history (required)').fill(clinical.indication);
      await page.getByLabel('Findings (required)').fill(clinical.findings);
      
      // Submit form
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show error message
      await expect(page.getByText(/error|failed/i)).toBeVisible();
    });

    test('should handle authentication errors', async ({ page }) => {
      const clinical = TEST_CLINICAL_DATA[0];
      
      // Mock authentication error
      await page.route('**/api/v1/jobs**', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      });
      
      // Fill required fields
      await page.getByLabel('Indication / Clinical history (required)').fill(clinical.indication);
      await page.getByLabel('Findings (required)').fill(clinical.findings);
      
      // Submit form
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should show loading state during submission', async ({ page }) => {
      const clinical = TEST_CLINICAL_DATA[0];
      
      // Mock slow API response
      await page.route('**/api/v1/jobs**', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_API_RESPONSES.job.queued),
        });
      });
      
      // Fill required fields
      await page.getByLabel('Indication / Clinical history (required)').fill(clinical.indication);
      await page.getByLabel('Findings (required)').fill(clinical.findings);
      
      // Submit form
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show loading state
      await expect(page.getByRole('button', { name: 'Generating...' })).toBeVisible();
      
      // Wait for completion
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page, navigation }) => {
      await navigation.goToGenerate();
    });

    test('should validate required fields', async ({ page }) => {
      // Try to submit empty form
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show validation errors
      await expect(page.getByText(/indication.*required/i)).toBeVisible();
      await expect(page.getByText(/findings.*required/i)).toBeVisible();
    });

    test('should validate template ID when no template selected', async ({ page }) => {
      // Try to submit without template ID
      await page.getByLabel('Indication / Clinical history (required)').fill('Test indication');
      await page.getByLabel('Findings (required)').fill('Test findings');
      
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show validation error for template ID
      await expect(page.getByText(/template.*required/i)).toBeVisible();
    });

    test('should validate patient data when toggle is enabled', async ({ page }) => {
      // Enable patient data toggle
      const toggle = page.locator('input[type="checkbox"]').first();
      await toggle.click();
      
      // Fill invalid patient data
      await page.getByLabel('Age').fill('-5');
      
      // Fill required clinical fields
      await page.getByLabel('Indication / Clinical history (required)').fill('Test indication');
      await page.getByLabel('Findings (required)').fill('Test findings');
      
      // Submit form
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show validation error for age
      await expect(page.getByText(/age.*invalid/i)).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to templates', async ({ page, navigation }) => {
      await navigation.goToGenerate();
      
      // Click "Back to Templates" button
      await page.getByRole('button', { name: 'Back to Templates' }).click();
      
      // Should navigate to templates page
      await expect(page).toHaveURL(/.*\/app\/templates/);
    });

    test('should navigate to templates from cancel button', async ({ page, navigation }) => {
      await navigation.goToGenerate();
      
      // Click "Cancel" button
      await page.getByRole('button', { name: 'Cancel' }).click();
      
      // Should navigate to templates page
      await expect(page).toHaveURL(/.*\/app\/templates/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle template not found error', async ({ page, navigation }) => {
      const invalidTemplateId = 'non-existent-template';
      
      // Mock template not found error
      await page.route(`**/api/v1/template/${invalidTemplateId}**`, route => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Template not found' }),
        });
      });
      
      await navigation.goToGenerate(invalidTemplateId);
      
      // Should handle error gracefully
      await page.waitForLoadState('networkidle');
    });

    test('should handle network errors during form submission', async ({ page, navigation }) => {
      await navigation.goToGenerate();
      
      // Mock network error
      await page.route('**/api/v1/jobs**', route => {
        route.abort('failed');
      });
      
      // Fill required fields
      await page.getByLabel('Indication / Clinical history (required)').fill('Test indication');
      await page.getByLabel('Findings (required)').fill('Test findings');
      
      // Submit form
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Should show error message
      await expect(page.getByText(/error|failed/i)).toBeVisible();
    });
  });
});
