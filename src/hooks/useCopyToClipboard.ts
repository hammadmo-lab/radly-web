/**
 * useCopyToClipboard Hook
 *
 * Provides copy-to-clipboard functionality with feedback.
 * Automatically handles browser API differences and fallbacks.
 *
 * @example
 * ```tsx
 * const { copy, isCopied } = useCopyToClipboard()
 *
 * return (
 *   <button onClick={() => copy(text)}>
 *     {isCopied ? '✓ Copied!' : 'Copy'}
 *   </button>
 * )
 * ```
 */

import { useState, useCallback } from 'react'

export function useCopyToClipboard(timeoutMs = 2000) {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      // Try modern Clipboard API first
      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text)
          setIsCopied(true)
        } catch (err) {
          console.error('Failed to copy to clipboard:', err)
          // Fallback to older method
          fallbackCopy(text)
          setIsCopied(true)
        }
      } else {
        // Fallback for older browsers
        fallbackCopy(text)
        setIsCopied(true)
      }

      // Reset the "copied" state after timeout
      setTimeout(() => {
        setIsCopied(false)
      }, timeoutMs)
    },
    [timeoutMs]
  )

  return { copy, isCopied }
}

/**
 * Fallback copy method for older browsers
 * Creates a temporary textarea and executes document.execCommand
 */
function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    document.execCommand('copy')
  } catch (err) {
    console.error('Fallback copy failed:', err)
  } finally {
    document.body.removeChild(textarea)
  }
}
