/**
 * Popover Component
 *
 * A floating content container that appears relative to a trigger element.
 * Built on Radix UI's Popover primitive with positioning and focus management.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button>Open</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     Popover content goes here
 *   </PopoverContent>
 * </Popover>
 * ```
 */

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * Popover - Container for popover content
 */
const Popover = PopoverPrimitive.Root

/**
 * PopoverTrigger - Button to open/close popover
 */
const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * PopoverAnchor - Anchor point for popover positioning
 */
const PopoverAnchor = PopoverPrimitive.Anchor

/**
 * PopoverContent - Content that appears in the popover
 * Positioned relative to trigger with arrow indicator
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.95)] p-4 text-white shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "backdrop-blur-sm",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent }
