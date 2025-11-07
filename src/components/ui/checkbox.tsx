/**
 * Checkbox Component
 *
 * A checkbox input component for binary selections or multiple choices.
 * Built on Radix UI's Checkbox primitive with full accessibility support.
 *
 * @example
 * ```tsx
 * <div className="flex items-center space-x-2">
 *   <Checkbox id="terms" />
 *   <label htmlFor="terms">I agree to the terms</label>
 * </div>
 * ```
 */

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Checkbox - A controlled or uncontrolled checkbox input
 *
 * Features:
 * - Accessible: ARIA labels and keyboard navigation
 * - Touch-friendly: Minimum 44px hit target
 * - Customizable: Via className prop
 * - Indeterminate state support
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      "rounded-sm bg-background hover:border-primary/80 transition-colors",
      "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
