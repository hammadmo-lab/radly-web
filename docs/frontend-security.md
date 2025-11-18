# Frontend Security Documentation

## Overview

The Radly frontend implements comprehensive client-side security measures to protect user data and prevent common web vulnerabilities.

**Security Goals:**
- Protect user authentication credentials and session data
- Prevent common web attacks (XSS, CSRF, injection)
- Ensure secure communication with the backend API
- Comply with healthcare data protection best practices (HIPAA considerations)
- Provide audit logging and security monitoring

This document covers the security features, best practices, and compliance considerations for the frontend application.

## Security Features

### 1. Secure Authentication

**Implementation**: `src/lib/auth-security.ts`

The authentication system uses Supabase Auth with JWT tokens, providing:

- **JWT Token Management**
  - Token validation and format checking
  - Automatic token refresh (every 4 minutes before expiration)
  - Secure token storage in HTTP-only cookies (handled by Supabase)
  - **Never** stores tokens in localStorage or sessionStorage

- **Session Management**
  - Secure logout with complete data cleanup
  - Session timeout after inactivity
  - Multi-tab session synchronization

**Usage Example:**
```typescript
import { AuthSecurity } from '@/lib/auth-security'

// Get current authentication token
const token = await AuthSecurity.getSecureToken()

// Check if token is expired
const isExpired = await AuthSecurity.isTokenExpired()

// Refresh token if needed
await AuthSecurity.refreshTokenIfNeeded()

// Perform secure logout (clears session and local data)
await AuthSecurity.secureLogout()
```

**Security Notes:**
- Tokens are transmitted only over HTTPS in production
- Token expiration is enforced on both client and server
- Refresh tokens are rotated on each use
- Failed authentication attempts are logged and monitored

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

**CRITICAL: Never store PHI (Protected Health Information) in browser storage**

The storage utility provides type-safe access to browser storage with built-in security checks.

#### What is Safe to Store

✅ **Safe to store** (non-sensitive data):
- User preferences (theme, language, UI settings)
- UI state (sidebar collapsed, table column widths)
- Non-sensitive application settings
- Recent job IDs (not job content)

#### What Should Never Be Stored

❌ **Never store** (sensitive data):
- Patient names, MRN (Medical Record Number), DOB (Date of Birth)
- Clinical findings, diagnoses, or medical observations
- Generated reports or report content
- Authentication tokens or API keys
- Personal identifiable information (PII)
- Protected health information (PHI)

#### Usage Examples

```typescript
import { SecureStorage } from '@/lib/secure-storage'

// Store user preferences (safe)
SecureStorage.setItem('theme', 'dark')
SecureStorage.setItem('language', 'en')

// Store temporary workflow data in sessionStorage (cleared on tab close)
SecureStorage.setSessionItem('currentStep', 2)
SecureStorage.setSessionItem('formDraft', JSON.stringify(draftData))

// Clear all session data on logout
SecureStorage.clearSession()

// Check if storage is available (respects user privacy settings)
if (SecureStorage.isAvailable()) {
  // Safe to use storage
}
```

#### Storage Best Practices

1. **Use sessionStorage for temporary data** - Cleared when tab/window closes
2. **Use localStorage for persistent preferences** - Survives browser restarts
3. **Always clear storage on logout** - Prevent data leakage
4. **Never log storage contents** - Avoid exposing data in console
5. **Validate data before storing** - Ensure it's non-sensitive

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
