/**
 * Client-side request signing for sensitive operations
 *
 * NOTE: Signing secrets should NEVER be exposed in client bundles.
 * If you need request signing, perform it on a trusted server or edge function.
 * This class is deprecated and kept for backwards compatibility only.
 */

export class RequestSigner {
  private static signingSecret: string | null = null

  /**
   * Initialize signing secret
   *
   * DEPRECATED: Do not use NEXT_PUBLIC_API_SIGNING_SECRET.
   * Signing must be done server-side only.
   */
  static initialize() {
    // Never load signing secrets from public environment variables
    this.signingSecret = null
  }

  /**
   * Generate HMAC-SHA256 signature for request
   */
  static async signRequest(body: string): Promise<{
    timestamp: number
    signature: string
  }> {
    if (!this.signingSecret) {
      throw new Error('Request signing not configured')
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const message = body + timestamp.toString()

    // Use Web Crypto API for HMAC
    const encoder = new TextEncoder()
    const keyData = encoder.encode(this.signingSecret)
    const messageData = encoder.encode(message)

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      messageData
    )

    // Convert to hex string
    const signatureArray = Array.from(new Uint8Array(signatureBuffer))
    const signature = signatureArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return { timestamp, signature }
  }

  /**
   * Add signature headers to fetch options
   */
  static async addSignatureHeaders(
    body: string,
    headers: Record<string, string> = {}
  ): Promise<Record<string, string>> {
    if (!this.signingSecret) {
      // Signing not configured, return headers as-is
      return headers
    }

    try {
      const { timestamp, signature } = await this.signRequest(body)

      return {
        ...headers,
        'X-Request-Timestamp': timestamp.toString(),
        'X-Request-Signature': signature,
      }
    } catch (error) {
      console.error('Failed to sign request:', error)
      return headers
    }
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  RequestSigner.initialize()
}
