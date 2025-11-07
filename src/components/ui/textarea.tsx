/**
 * Textarea Component
 *
 * A flexible textarea component with support for multiple sizes and validation states.
 * Built with CVA for type-safe variant management and smooth transitions.
 *
 * @example
 * ```tsx
 * // Basic textarea
 * <Textarea placeholder="Enter your message..." />
 *
 * // With size variant
 * <Textarea size="lg" placeholder="Large textarea" />
 *
 * // With error state
 * <Textarea state="error" placeholder="Error message" />
 *
 * // With rows
 * <Textarea rows={6} placeholder="Custom height" />
 * ```
 *
 * @component
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Textarea size and state variants
 * Sizes: sm (60px), default (80px), lg (120px)
 * States: default, error (red), success (green), warning (orange)
 */
export const textareaVariants = cva(
  "flex w-full rounded-md border bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none",
  {
    variants: {
      size: {
        sm: "min-h-[60px] px-2 py-1 text-xs",
        default: "min-h-[80px] px-3 py-2 text-sm",
        lg: "min-h-[120px] px-4 py-3 text-base",
      },
      state: {
        default: "border-input hover:border-input/80",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
        warning: "border-warning focus-visible:ring-warning",
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, state, ...props }, ref) => (
    <textarea
      className={cn(textareaVariants({ size, state }), className)}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

export { Textarea }
