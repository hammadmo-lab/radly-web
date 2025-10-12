/**
 * Input sanitization utilities for XSS prevention
 */

export class InputSanitizer {
  /**
   * Sanitize text input (remove HTML tags, scripts, etc.)
   */
  static sanitizeText(input: string): string {
    if (!input) return ''

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:text\/html/gi, '') // Remove data:text/html
      .trim()
  }

  /**
   * Sanitize HTML (allow safe tags only)
   */
  static sanitizeHtml(input: string): string {
    if (!input) return ''

    // Allow only safe tags: p, br, strong, em, u, ol, ul, li
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'b', 'i']
    const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi

    return input.replace(tagRegex, (match, tagName) => {
      return allowedTags.includes(tagName.toLowerCase()) ? match : ''
    })
  }

  /**
   * Sanitize URL (prevent javascript: and data: protocols)
   */
  static sanitizeUrl(url: string): string {
    if (!url) return ''

    const trimmed = url.trim().toLowerCase()

    // Block dangerous protocols
    if (
      trimmed.startsWith('javascript:') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('vbscript:') ||
      trimmed.startsWith('file:')
    ) {
      return ''
    }

    // Allow only http, https, and relative URLs
    if (
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('/')
    ) {
      return ''
    }

    return url
  }

  /**
   * Sanitize filename (prevent directory traversal)
   */
  static sanitizeFilename(filename: string): string {
    if (!filename) return ''

    return filename
      .replace(/\.\./g, '') // Remove ..
      .replace(/[/\\]/g, '') // Remove path separators
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
      .slice(0, 255) // Limit length
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }

    return text.replace(/[&<>"']/g, (char) => map[char])
  }
}
