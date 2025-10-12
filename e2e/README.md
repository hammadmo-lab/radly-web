# E2E Testing with Playwright

This document describes the end-to-end (E2E) testing setup for the Radly application using Playwright.

## Overview

The E2E tests validate complete user workflows from start to finish, ensuring that all critical user journeys work correctly across different browsers and devices.

## Test Coverage

### 1. Authentication Flow (`e2e/auth.spec.ts`)
- Sign-in page display and validation
- Magic link authentication flow
- OAuth authentication (Google, Apple)
- Protected route access control
- Authentication state management
- Sign-out functionality
- Error handling for auth failures

### 2. Templates Management (`e2e/templates.spec.ts`)
- Templates page display
- Template search and filtering
- Template card information
- Navigation to report generation
- Loading states and error handling
- Responsive design validation

### 3. Report Generation (`e2e/report-generation.spec.ts`)
- Generate page display
- Patient information form
- Clinical information form
- Signature form
- Form validation
- Report submission
- Error handling

### 4. Settings Management (`e2e/settings.spec.ts`)
- Settings page display
- Account information display
- Default settings management
- System status monitoring
- Form validation and persistence
- Error handling

## Test Structure

```
e2e/
├── auth.spec.ts                 # Authentication flow tests
├── report-generation.spec.ts    # Report generation tests
├── settings.spec.ts             # Settings management tests
├── templates.spec.ts            # Template browsing tests
├── fixtures/
│   ├── auth.ts                  # Auth fixtures and helpers
│   └── test-data.ts             # Shared test data
└── helpers/
    ├── navigation.ts            # Navigation helpers
    └── assertions.ts            # Custom assertions
```

## Running Tests

### Local Development

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Show test report
npm run test:e2e:report
```

### Specific Test Suites

```bash
# Run only authentication tests
npx playwright test e2e/auth.spec.ts

# Run only templates tests
npx playwright test e2e/templates.spec.ts

# Run only report generation tests
npx playwright test e2e/report-generation.spec.ts

# Run only settings tests
npx playwright test e2e/settings.spec.ts
```

### Browser-Specific Tests

```bash
# Run tests in Chromium only
npx playwright test --project=chromium

# Run tests in Firefox only
npx playwright test --project=firefox

# Run tests in WebKit only
npx playwright test --project=webkit

# Run tests on mobile devices
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Configuration

### Playwright Configuration (`playwright.config.ts`)

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile Testing**: Mobile Chrome, Mobile Safari
- **Screenshots**: On failure
- **Videos**: On first retry
- **Traces**: On first retry
- **Parallel Execution**: 4 workers
- **Retries**: 2 on CI, 0 locally

### Environment Variables

The tests use the following environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ALLOW_MAGIC_LINK=1
NEXT_PUBLIC_ALLOW_GOOGLE=0
NEXT_PUBLIC_ALLOW_APPLE=0
```

## Test Data

### Test Users (`e2e/fixtures/test-data.ts`)

```typescript
export const TEST_USERS = {
  validUser: {
    email: 'test@radly.com',
    password: 'testpassword123',
  },
  magicLinkUser: {
    email: 'magic@radly.com',
  },
  googleUser: {
    email: 'google@radly.com',
  },
};
```

### Test Templates

```typescript
export const TEST_TEMPLATES = [
  {
    id: 'chest-ct-angio',
    name: 'Chest CT Angiography',
    modality: 'CT',
    bodySystem: 'Chest',
    description: 'Template for chest CT angiography reports',
  },
  // ... more templates
];
```

### Test Clinical Data

```typescript
export const TEST_CLINICAL_DATA = [
  {
    indication: 'Chest pain and shortness of breath. Rule out pulmonary embolism.',
    findings: '- No acute pulmonary embolism\n- Mild cardiomegaly\n- Clear lung fields',
    technique: 'CT angiography of the chest with contrast',
  },
  // ... more clinical data
];
```

## Authentication Testing

### Magic Link Testing

Magic link authentication is challenging to test in E2E because it requires email verification. The current approach:

1. **Limitation**: Cannot test the complete magic link flow without email interception
2. **Workaround**: Tests the UI flow and simulates the callback
3. **Recommendation**: Use email/password authentication for E2E tests

### OAuth Testing

OAuth flows (Google, Apple) are also challenging because they require real OAuth credentials:

1. **Limitation**: Cannot test complete OAuth flow without test credentials
2. **Workaround**: Tests the UI flow and simulates redirects
3. **Recommendation**: Mock OAuth responses for E2E tests

## API Mocking

Tests use Playwright's `page.route()` to mock API responses:

```typescript
// Mock successful templates API
await page.route('**/api/v1/templates**', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_API_RESPONSES.templates.success),
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow (`.github/workflows/e2e.yml`)

The workflow includes:

1. **Matrix Testing**: Tests across different browsers and devices
2. **Artifact Upload**: Uploads test results, screenshots, and videos
3. **Environment Setup**: Configures Node.js and Playwright
4. **Application Build**: Builds and starts the application
5. **Test Execution**: Runs E2E tests with proper environment variables

### Required Secrets

Set these secrets in your GitHub repository:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Best Practices

### 1. Test Independence
- Each test should be independent and can run in isolation
- Use `test.beforeEach()` to set up test state
- Clear authentication state between tests

### 2. Reliable Selectors
- Use `data-testid` attributes for key elements
- Prefer role-based selectors: `page.getByRole('button', { name: 'Sign In' })`
- Use label selectors for form fields: `page.getByLabel('Email')`

### 3. Wait Strategies
- Use `page.waitForLoadState('networkidle')` after navigation
- Use `page.waitForSelector()` for dynamic content
- Use `page.waitForResponse()` for API calls

### 4. Error Handling
- Test both success and error scenarios
- Mock API errors to test error handling
- Verify error messages are displayed correctly

### 5. Data Management
- Use realistic test data
- Clean up test data after each test
- Use fixtures for shared test data

## Debugging

### 1. Debug Mode
```bash
npm run test:e2e:debug
```
Opens Playwright Inspector for step-by-step debugging.

### 2. UI Mode
```bash
npm run test:e2e:ui
```
Opens Playwright UI for interactive test development.

### 3. Headed Mode
```bash
npm run test:e2e:headed
```
Runs tests with visible browser windows.

### 4. Screenshots and Videos
- Screenshots are automatically taken on test failures
- Videos are recorded on first retry
- Traces are captured on first retry
- All artifacts are uploaded to GitHub Actions

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Ensure test user accounts exist in Supabase
   - Check environment variables are set correctly
   - Verify Supabase configuration

2. **API Mocking Issues**
   - Ensure route patterns match actual API calls
   - Check that mocks are set up before navigation
   - Verify mock responses have correct structure

3. **Timing Issues**
   - Add appropriate waits for dynamic content
   - Use `page.waitForLoadState('networkidle')`
   - Increase timeouts for slow operations

4. **Selector Issues**
   - Use Playwright's `page.pause()` to inspect elements
   - Check that selectors are unique and stable
   - Use `data-testid` attributes for critical elements

### Performance Optimization

1. **Parallel Execution**: Tests run in parallel by default
2. **Browser Reuse**: Browsers are reused across tests when possible
3. **Selective Testing**: Run only relevant tests during development
4. **Mock External Services**: Mock slow external APIs

## Future Enhancements

### 1. Visual Regression Testing
- Add visual regression tests for UI components
- Use Playwright's screenshot comparison features
- Test across different screen sizes and devices

### 2. Performance Testing
- Add performance metrics to E2E tests
- Test page load times and Core Web Vitals
- Monitor API response times

### 3. Accessibility Testing
- Add accessibility tests using Playwright's accessibility features
- Test keyboard navigation
- Verify ARIA labels and roles

### 4. Cross-Browser Testing
- Expand browser coverage
- Test on different operating systems
- Add browser-specific test cases

## Contributing

When adding new E2E tests:

1. **Follow the existing structure** in the `e2e/` directory
2. **Use the provided fixtures** for authentication and test data
3. **Add appropriate waits** for dynamic content
4. **Test both success and error scenarios**
5. **Update this documentation** if adding new test categories

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [GitHub Actions with Playwright](https://playwright.dev/docs/ci)
