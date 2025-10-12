/**
 * Client-side security event monitoring
 */

export enum SecurityEventType {
  AUTH_FAILURE = 'auth_failure',
  AUTH_SUCCESS = 'auth_success',
  INVALID_INPUT = 'invalid_input',
  XSS_ATTEMPT = 'xss_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SESSION_EXPIRED = 'session_expired',
}

export interface SecurityEvent {
  type: SecurityEventType
  details?: Record<string, unknown>
  userAgent?: string
  timestamp: string
}

export class SecurityMonitor {
  private static events: SecurityEvent[] = []
  private static maxEvents = 100

  /**
   * Log a security event
   */
  static logEvent(type: SecurityEventType, details?: Record<string, unknown>) {
    const event: SecurityEvent = {
      type,
      details,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    }

    this.events.push(event)

    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event)
    }

    // In production, could send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to backend or analytics service
      // this.sendToBackend(event)
    }
  }

  /**
   * Get recent security events
   */
  static getRecentEvents(limit: number = 10): SecurityEvent[] {
    return this.events.slice(-limit)
  }

  /**
   * Clear security events
   */
  static clearEvents() {
    this.events = []
  }

  /**
   * Check for suspicious patterns
   */
  static detectSuspiciousActivity(): boolean {
    const recentEvents = this.getRecentEvents(10)
    
    // Check for multiple auth failures
    const authFailures = recentEvents.filter(
      e => e.type === SecurityEventType.AUTH_FAILURE
    )
    if (authFailures.length >= 3) {
      return true
    }

    // Check for multiple XSS attempts
    const xssAttempts = recentEvents.filter(
      e => e.type === SecurityEventType.XSS_ATTEMPT
    )
    if (xssAttempts.length >= 2) {
      return true
    }

    return false
  }
}
