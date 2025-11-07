/**
 * FormField Component
 *
 * A wrapper component for form fields that handles validation styling,
 * error messages, labels, and help text automatically.
 * Works with React Hook Form for seamless integration.
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   error={errors.email?.message}
 *   required
 *   helpText="We'll never share your email"
 * >
 *   <Input
 *     {...register('email')}
 *     placeholder="your@email.com"
 *     type="email"
 *   />
 * </FormField>
 * ```
 *
 * @component
 */

import * as React from "react"
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Props for the FormField wrapper component
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Field label text
   */
  label?: string

  /**
   * Error message to display (if any)
   */
  error?: string

  /**
   * Help text displayed below field
   */
  helpText?: string

  /**
   * Whether the field is required
   */
  required?: boolean

  /**
   * Whether the field is optional (shows Optional label)
   */
  optional?: boolean

  /**
   * Show success state (green checkmark)
   */
  success?: boolean

  /**
   * Show loading/disabled state
   */
  disabled?: boolean

  /**
   * Field ID for label association
   */
  htmlFor?: string

  /**
   * The form field content (Input, Textarea, etc.)
   */
  children: React.ReactNode
}

/**
 * FormField - Wrapper for form inputs with validation styling
 *
 * Automatically handles:
 * - Label rendering with required/optional indicators
 * - Error message display with icon
 * - Success state with checkmark
 * - Help text below field
 * - Accessible error associations (aria-describedby)
 * - Responsive styling
 */
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      error,
      helpText,
      required,
      optional,
      success,
      disabled,
      htmlFor,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const errorId = React.useId()
    const helpId = React.useId()
    const descriptionIds = [error && errorId, helpText && helpId]
      .filter(Boolean)
      .join(" ")

    return (
      <div ref={ref} className={cn("w-full space-y-2", className)} {...props}>
        {/* Label with required/optional indicators */}
        {label && (
          <label
            htmlFor={htmlFor}
            className={cn(
              "block text-sm font-semibold transition-colors",
              disabled
                ? "text-[rgba(207,207,207,0.5)]"
                : "text-[rgba(207,207,207,0.9)]"
            )}
          >
            <span>{label}</span>
            {required && (
              <span
                className="ml-1 text-destructive"
                aria-label="required field"
              >
                *
              </span>
            )}
            {optional && (
              <span className="ml-2 text-xs text-[rgba(207,207,207,0.55)]">
                (Optional)
              </span>
            )}
          </label>
        )}

        {/* Input wrapper with conditional state styling */}
        <div
          className={cn(
            "relative transition-all",
            error && "[&>input]:border-destructive [&>input]:focus-visible:ring-destructive",
            success &&
              !error &&
              "[&>input]:border-success [&>input]:focus-visible:ring-success",
            disabled && "[&>input]:opacity-50 [&>input]:cursor-not-allowed"
          )}
        >
          {children}

          {/* Success checkmark icon */}
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          )}

          {/* Error icon */}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          )}
        </div>

        {/* Error message or help text */}
        <div className="space-y-1">
          {error && (
            <p
              id={errorId}
              className="text-xs text-destructive flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {error}
            </p>
          )}

          {helpText && !error && (
            <p
              id={helpId}
              className="text-xs text-[rgba(207,207,207,0.6)] flex items-center gap-1"
            >
              <HelpCircle className="h-3 w-3 flex-shrink-0" />
              {helpText}
            </p>
          )}
        </div>

        {/* Hidden aria-describedby for screen readers */}
        {descriptionIds && (
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {error && `Error: ${error}`}
            {helpText && !error && `Help: ${helpText}`}
          </div>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"

export { FormField }
