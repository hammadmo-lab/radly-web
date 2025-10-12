/**
 * Input validation utilities
 */

export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate MRN (Medical Record Number) format
   * Adjust based on your requirements
   */
  static isValidMRN(mrn: string): boolean {
    // Example: 8-12 alphanumeric characters
    return /^[A-Z0-9]{8,12}$/i.test(mrn)
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  static isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) return false

    const dateObj = new Date(date)
    return !isNaN(dateObj.getTime())
  }

  /**
   * Validate patient name (letters, spaces, hyphens, apostrophes only)
   */
  static isValidName(name: string): boolean {
    return /^[a-zA-Z\s'-]+$/.test(name) && name.length >= 2 && name.length <= 100
  }

  /**
   * Validate template ID (alphanumeric, underscores, hyphens)
   */
  static isValidTemplateId(templateId: string): boolean {
    return /^[a-z0-9_-]+$/i.test(templateId) && templateId.length <= 50
  }

  /**
   * Validate findings text (reasonable length, no script tags)
   */
  static isValidFindings(findings: string): boolean {
    if (!findings || findings.length > 10000) return false
    
    // Check for script tags
    if (/<script/i.test(findings)) return false
    
    return true
  }
}
