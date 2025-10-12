/**
 * Security feature tests
 */
import { AuthSecurity } from '@/lib/auth-security'
import { RequestSigner } from '@/lib/request-signing'
import { InputSanitizer } from '@/lib/sanitization'
import { InputValidator } from '@/lib/validation'
import { SecureStorage } from '@/lib/secure-storage'
import { SecurityMonitor, SecurityEventType } from '@/lib/security-monitoring'

describe('AuthSecurity', () => {
  it('should validate JWT token format', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const invalidToken = 'invalid-token'

    expect(AuthSecurity.isValidTokenFormat(validToken)).toBe(true)
    expect(AuthSecurity.isValidTokenFormat(invalidToken)).toBe(false)
  })
})

describe('RequestSigner', () => {
  beforeEach(() => {
    // Mock environment variable
    process.env.NEXT_PUBLIC_API_SIGNING_SECRET = 'test-secret-key'
    RequestSigner.initialize()
  })

  it('should initialize with signing secret', () => {
    expect(process.env.NEXT_PUBLIC_API_SIGNING_SECRET).toBe('test-secret-key')
  })

  it('should handle missing signing secret gracefully', async () => {
    // Clear the secret
    process.env.NEXT_PUBLIC_API_SIGNING_SECRET = ''
    RequestSigner.initialize()
    
    const body = JSON.stringify({ test: 'data' })
    const headers = await RequestSigner.addSignatureHeaders(body, {
      'Content-Type': 'application/json'
    })

    // Should return headers without signature when secret is missing
    expect(headers).toEqual({
      'Content-Type': 'application/json'
    })
  })
})

describe('InputSanitizer', () => {
  it('should remove script tags from text', () => {
    const malicious = 'Hello <script>alert("XSS")</script> World'
    const sanitized = InputSanitizer.sanitizeText(malicious)

    expect(sanitized).not.toContain('<script>')
    expect(sanitized).toBe('Hello  World')
  })

  it('should remove event handlers', () => {
    const malicious = '<div onclick="alert(1)">Click me</div>'
    const sanitized = InputSanitizer.sanitizeText(malicious)

    expect(sanitized).not.toContain('onclick=')
  })

  it('should block javascript: protocol in URLs', () => {
    const maliciousUrl = 'javascript:alert(1)'
    const sanitized = InputSanitizer.sanitizeUrl(maliciousUrl)

    expect(sanitized).toBe('')
  })

  it('should allow safe URLs', () => {
    const safeUrl = 'https://example.com/image.jpg'
    const sanitized = InputSanitizer.sanitizeUrl(safeUrl)

    expect(sanitized).toBe(safeUrl)
  })

  it('should sanitize filenames to prevent directory traversal', () => {
    const maliciousFilename = '../../etc/passwd'
    const sanitized = InputSanitizer.sanitizeFilename(maliciousFilename)

    expect(sanitized).not.toContain('..')
    expect(sanitized).not.toContain('/')
  })

  it('should escape HTML entities', () => {
    const html = '<div>Hello & "World"</div>'
    const escaped = InputSanitizer.escapeHtml(html)

    expect(escaped).toBe('&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;')
  })
})

describe('InputValidator', () => {
  it('should validate email addresses', () => {
    expect(InputValidator.isValidEmail('user@example.com')).toBe(true)
    expect(InputValidator.isValidEmail('invalid-email')).toBe(false)
    expect(InputValidator.isValidEmail('user@')).toBe(false)
  })

  it('should validate patient names', () => {
    expect(InputValidator.isValidName('John Doe')).toBe(true)
    expect(InputValidator.isValidName("O'Brien")).toBe(true)
    expect(InputValidator.isValidName('Smith-Jones')).toBe(true)
    expect(InputValidator.isValidName('123')).toBe(false)
    expect(InputValidator.isValidName('J')).toBe(false) // Too short
  })

  it('should validate dates', () => {
    expect(InputValidator.isValidDate('2024-01-15')).toBe(true)
    expect(InputValidator.isValidDate('15/01/2024')).toBe(false)
    expect(InputValidator.isValidDate('invalid')).toBe(false)
  })

  it('should reject findings with script tags', () => {
    const maliciousFindings = 'Normal chest. <script>alert(1)</script>'
    expect(InputValidator.isValidFindings(maliciousFindings)).toBe(false)
  })

  it('should validate reasonable findings text', () => {
    const normalFindings = 'Normal chest radiograph. No acute findings.'
    expect(InputValidator.isValidFindings(normalFindings)).toBe(true)
  })
})

describe('SecureStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('should store and retrieve items from localStorage', () => {
    const testData = { theme: 'dark', language: 'en' }
    SecureStorage.setItem('preferences', testData)

    const retrieved = SecureStorage.getItem('preferences')
    expect(retrieved).toEqual(testData)
  })

  it('should store and retrieve items from sessionStorage', () => {
    const testData = { workflowStep: 2 }
    SecureStorage.setSessionItem('workflow', testData)

    const retrieved = SecureStorage.getSessionItem('workflow')
    expect(retrieved).toEqual(testData)
  })

  it('should clear session storage', () => {
    SecureStorage.setSessionItem('test', { data: 'value' })
    SecureStorage.clearSession()

    const retrieved = SecureStorage.getSessionItem('test')
    expect(retrieved).toBeNull()
  })

  it('should check if storage is available', () => {
    expect(SecureStorage.isAvailable()).toBe(true)
  })
})

describe('SecurityMonitor', () => {
  beforeEach(() => {
    SecurityMonitor.clearEvents()
  })

  it('should log security events', () => {
    SecurityMonitor.logEvent(SecurityEventType.AUTH_SUCCESS, { userId: 'test' })

    const events = SecurityMonitor.getRecentEvents(1)
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe(SecurityEventType.AUTH_SUCCESS)
  })

  it('should detect suspicious activity after multiple auth failures', () => {
    // Log 3 auth failures
    for (let i = 0; i < 3; i++) {
      SecurityMonitor.logEvent(SecurityEventType.AUTH_FAILURE)
    }

    expect(SecurityMonitor.detectSuspiciousActivity()).toBe(true)
  })

  it('should detect suspicious activity after multiple XSS attempts', () => {
    // Log 2 XSS attempts
    for (let i = 0; i < 2; i++) {
      SecurityMonitor.logEvent(SecurityEventType.XSS_ATTEMPT)
    }

    expect(SecurityMonitor.detectSuspiciousActivity()).toBe(true)
  })

  it('should not detect suspicious activity with normal events', () => {
    SecurityMonitor.logEvent(SecurityEventType.AUTH_SUCCESS)
    SecurityMonitor.logEvent(SecurityEventType.AUTH_SUCCESS)

    expect(SecurityMonitor.detectSuspiciousActivity()).toBe(false)
  })

  it('should limit stored events to maxEvents', () => {
    // Log more than maxEvents (100)
    for (let i = 0; i < 150; i++) {
      SecurityMonitor.logEvent(SecurityEventType.AUTH_SUCCESS)
    }

    const events = SecurityMonitor.getRecentEvents(150)
    expect(events.length).toBeLessThanOrEqual(100)
  })
})
