# Environment Configuration for Test Mode

## Required Environment Files

Create these files in your project root:

### `.env.local` (for development)
```bash
# Test Mode (disabled in development by default)
NEXT_PUBLIC_TEST_MODE=false
NEXT_PUBLIC_BYPASS_AUTH=false
```

### `.env.test` (for E2E tests)
```bash
# Test Mode (enabled for E2E tests)
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_BYPASS_AUTH=true
```

## Environment Variables Explained

- `NEXT_PUBLIC_TEST_MODE`: Controls whether the application runs in test mode
- `NEXT_PUBLIC_BYPASS_AUTH`: Controls whether authentication is bypassed

## How Test Mode Works

1. **Playwright Configuration**: Sets test mode environment variables when running tests
2. **Middleware**: Checks for test mode and bypasses authentication
3. **Auth Hooks**: Return mock data when in test mode
4. **Test Mode Indicator**: Shows visual indicator when test mode is active

## Security Notes

- Test mode is **disabled by default** in production
- Environment variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Test mode can be detected via headers, query parameters, or environment variables
- Production deployments should not have these variables set

## Usage

### Running E2E Tests
```bash
npx playwright test
```

### Manual Test Mode Activation
Add `?test=true` to any URL to enable test mode (development only)

### Checking Test Mode Status
The test mode indicator will appear in the bottom-right corner when active.
