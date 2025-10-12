# Frontend Security Documentation

## Overview

Radly frontend implements comprehensive client-side security measures to protect user data and prevent common web vulnerabilities.

## Security Features

### 1. Secure Authentication

**Implementation**: `src/lib/auth-security.ts`

- JWT token validation and format checking
- Automatic token refresh (every 4 minutes)
- Secure logout with data cleanup
- No tokens in localStorage (Supabase handles securely)

**Usage**:
```typescript
import { AuthSecurity } from '@/lib/auth-security'

// Get secure token
const token = await AuthSecurity.getSecureToken()

// Check if token is expired
const expired = await AuthSecurity.isTokenExpired()

// Refresh token if needed
await AuthSecurity.refreshTokenIfNeeded()

// Secure logout
await AuthSecurity.secureLogout()
```

### 2. Request Signing

**Implementation**: `src/lib/request-signing.ts`

Matches backend HMAC-SHA256 signing for sensitive operations.

**Usage**:
```typescript
import { SecureApiClient } from '@/lib/secure-api-client'

const api = new SecureApiClient()

// Regular request
await api.post('/v1/generate', data)

// Request with signature (admin operations)
await api.post('/v1/admin/cache/clear', {}, {
  requiresSignature: true
})
```

### 3. XSS Prevention

**Implementation**: `src/lib/sanitization.ts`

- Input sanitization before display
- URL validation
- Filename sanitization
- HTML entity escaping

**Usage**:
```typescript
import { InputSanitizer } from '@/lib/sanitization'

// Sanitize user input
const clean = InputSanitizer.sanitizeText(userInput)

// Sanitize URLs
const safeUrl = InputSanitizer.sanitizeUrl(url)

// Sanitize filenames
const safeName = InputSanitizer.sanitizeFilename(filename)

// Escape HTML
const escaped = InputSanitizer.escapeHtml(html)
```

### 4. Input Validation

**Implementation**: `src/lib/validation.ts`

- Email validation
- Name validation (no special chars)
- Date validation
- Medical data validation

**Usage**:
```typescript
import { InputValidator } from '@/lib/validation'

// Validate before submission
if (!InputValidator.isValidEmail(email)) {
  throw new Error('Invalid email')
}

if (!InputValidator.isValidName(patientName)) {
  throw new Error('Invalid name format')
}
```

### 5. Secure Storage

**Implementation**: `src/lib/secure-storage.ts`

**CRITICAL: Never store PHI in browser storage**

✅ **Safe to store**:
- User preferences (theme, language)
- UI state (sidebar collapsed)
- Non-sensitive settings

❌ **Never store**:
- Patient names, MRN, DOB
- Clinical findings
- Generated reports
- Authentication tokens

**Usage**:
```typescript
import { SecureStorage } from '@/lib/secure-storage'

// Store preferences (OK)
SecureStorage.setItem('theme', 'dark')

// Store temporary workflow data (use sessionStorage)
SecureStorage.setSessionItem('currentStep', 2)

// Clear session on logout
SecureStorage.clearSession()
```

### 6. Content Security Policy

**Implementation**: `next.config.ts`

Comprehensive CSP headers prevent:
- XSS attacks
- Clickjacking
- MIME sniffing
- Unsafe inline scripts

**Headers Applied**:
- `Content-Security-Policy`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)
- `Referrer-Policy`
- `Permissions-Policy`

### 7. Security Monitoring

**Implementation**: `src/lib/security-monitoring.ts`

- Log security events client-side
- Detect suspicious patterns
- Track authentication failures
- Monitor XSS attempts

**Usage**:
```typescript
import { SecurityMonitor, SecurityEventType } from '@/lib/security-monitoring'

// Log security event
SecurityMonitor.logEvent(SecurityEventType.AUTH_FAILURE)

// Check for suspicious activity
if (SecurityMonitor.detectSuspiciousActivity()) {
  // Alert user or take action
}

// Get recent events
const events = SecurityMonitor.getRecentEvents(10)
```

## Best Practices

### Development

1. **Never commit secrets** to git
2. **Use environment variables** for configuration
3. **Validate all user input** before submission
4. **Sanitize output** when displaying user content
5. **Test security features** in CI/CD

### Production

1. **Enable HTTPS** (Strict-Transport-Security)
2. **Configure request signing** for admin operations
3. **Monitor security events** regularly
4. **Rotate secrets** every 90 days
5. **Use Content Security Policy** (already configured)

### Data Handling

**PHI (Protected Health Information)**:
- ❌ Never store in localStorage
- ❌ Never store in sessionStorage
- ❌ Never log to console in production
- ✅ Keep in memory only during workflow
- ✅ Clear on page unload

**User Preferences**:
- ✅ Can store in localStorage
- ✅ Non-sensitive only
- ✅ Clear on logout

## Common Vulnerabilities Prevented

### XSS (Cross-Site Scripting)
- ✅ Input sanitization
- ✅ Output escaping
- ✅ Content Security Policy
- ✅ React's built-in XSS protection

### CSRF (Cross-Site Request Forgery)
- ✅ SameSite cookies (Supabase)
- ✅ Token-based authentication
- ✅ Request signing for state changes

### Injection Attacks
- ✅ Input validation
- ✅ Parameterized queries (backend)
- ✅ No eval() or innerHTML usage

### Session Hijacking
- ✅ HttpOnly cookies (Supabase)
- ✅ Secure flag on cookies (HTTPS)
- ✅ Token expiration and refresh
- ✅ Automatic logout on suspicious activity

## Compliance

### HIPAA Considerations

**Radly is a clinical tool, not a Business Associate**

However, we follow security best practices:
- No PHI in browser storage
- Secure data transmission (HTTPS)
- Session management and timeouts
- Audit logging (backend)

### Data Minimization

- Collect only necessary patient data
- Don't store data longer than needed
- Clear form data after submission
- Use sessionStorage for temporary workflow data

## Testing

### Run Security Tests

```bash
# Run all tests
npm test

# Run security tests only
npm test -- src/__tests__/security.test.tsx

# Run with coverage
npm test -- --coverage
```

### Manual Security Testing

1. **Test XSS Prevention**:
   - Try entering `<script>alert('XSS')</script>` in forms
   - Should be sanitized

2. **Test CSRF Protection**:
   - Try making requests from another origin
   - Should be blocked by CORS

3. **Test Session Management**:
   - Let token expire
   - Should automatically refresh or redirect to login

## Troubleshooting

### Request Signing Errors

**Symptom**: "Invalid or expired signature"

**Solutions**:
1. Verify `NEXT_PUBLIC_API_SIGNING_SECRET` matches backend
2. Check system clock is synchronized
3. Ensure request body is not modified

### CSP Violations

**Symptom**: Console errors about blocked resources

**Solutions**:
1. Check `next.config.ts` CSP configuration
2. Add allowed domains to `connect-src`
3. Review third-party scripts

### Storage Not Available

**Symptom**: localStorage/sessionStorage errors

**Solutions**:
1. Check browser privacy settings
2. Ensure not in private/incognito mode
3. Use `SecureStorage.isAvailable()` before accessing

## Security Contacts

For security issues:
- **Email**: security@radly.app
- **Response time**: Within 24 hours

## Security Checklist

### Before Deployment

- [ ] All secrets in environment variables
- [ ] HTTPS enabled and enforced
- [ ] CSP headers configured
- [ ] Request signing enabled (if applicable)
- [ ] Security tests passing
- [ ] No PHI in browser storage
- [ ] Session timeouts configured
- [ ] Error messages don't leak information
- [ ] Dependencies updated and scanned
- [ ] Security monitoring enabled
