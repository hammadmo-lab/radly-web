/**
 * FormError Component
 *
 * Displays form-level validation errors or system errors.
 * Use for errors that apply to the entire form or multiple fields.
 *
 * @example
 * ```tsx
 * {formError && <FormError>{formError}</FormError>}
 * ```
 *
 * @component
 */

import * as React from "react"
import { AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormErrorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Error message text
   */
  children: React.ReactNode

  /**
   * Whether to show a close button
   */
  dismissible?: boolean

  /**
   * Callback when dismiss button is clicked
   */
  onDismiss?: () => void
}

/**
 * FormError - Displays form-level errors
 *
 * Features:
 * - Alert icon and styling
 * - Optional dismissible close button
 * - Accessible with aria-role="alert"
 * - Responsive styling
 */
const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
  ({ children, dismissible = true, onDismiss, className, ...props }, ref) => {
    const [isDismissed, setIsDismissed] = React.useState(false)

    if (isDismissed) return null

    const handleDismiss = () => {
      setIsDismissed(true)
      onDismiss?.()
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-2",
          className
        )}
        {...props}
      >
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">{children}</div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-destructive/20 rounded transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)

FormError.displayName = "FormError"

export { FormError }
