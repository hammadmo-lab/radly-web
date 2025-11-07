/**
 * Button Component
 *
 * A versatile button component with multiple style variants and sizes.
 * Supports keyboard navigation, focus states, and disabled states.
 *
 * @example
 * ```tsx
 * // Default button
 * <Button>Click me</Button>
 *
 * // Different variants
 * <Button variant="outline">Outline</Button>
 * <Button variant="destructive">Delete</Button>
 * <Button variant="ghost">Ghost</Button>
 * <Button variant="link">Link</Button>
 *
 * // Different sizes
 * <Button size="sm">Small</Button>
 * <Button size="lg">Large</Button>
 * <Button size="icon"><ChevronRight /></Button>
 *
 * // As child component
 * <Button asChild>
 *   <a href="/path">Navigate</a>
 * </Button>
 * ```
 *
 * @component
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button variants powered by CVA
 * Variants:
 * - default: Primary gradient button
 * - destructive: Red destructive action button
 * - outline: Glassmorphic outline button
 * - secondary: Soft secondary button
 * - ghost: Transparent ghost button
 * - link: Text link button
 *
 * Sizes:
 * - default: Standard button
 * - sm: Small button
 * - lg: Large button
 * - icon: Icon-only square button
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "button-primary-gradient",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "button-outline-glass",
        secondary:
          "button-secondary-soft",
        ghost:
          "text-foreground hover:bg-[rgba(255,255,255,0.08)] hover:text-foreground",
        link: "text-info underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
