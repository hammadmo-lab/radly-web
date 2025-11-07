/**
 * Collapsible Component
 *
 * An expandable/collapsible container for showing/hiding content.
 * Built on Radix UI's Collapsible primitive with smooth animations.
 *
 * @example
 * ```tsx
 * <Collapsible>
 *   <CollapsibleTrigger asChild>
 *     <Button variant="ghost">Advanced Options</Button>
 *   </CollapsibleTrigger>
 *   <CollapsibleContent>
 *     Advanced options content goes here
 *   </CollapsibleContent>
 * </Collapsible>
 * ```
 */

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

import { cn } from "@/lib/utils"

/**
 * Collapsible - Container for collapsible content
 * Manages open/closed state and animation
 */
const Collapsible = CollapsiblePrimitive.Root

/**
 * CollapsibleTrigger - Button to toggle collapsible content
 * Must be inside a Collapsible component
 */
const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-colors",
      className
    )}
    {...props}
  />
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName

/**
 * CollapsibleContent - Expandable content area
 * Smoothly animates in/out when parent Collapsible is toggled
 */
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2 transition-all",
      className
    )}
    {...props}
  />
))
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
