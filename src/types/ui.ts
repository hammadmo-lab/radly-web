/**
 * UI Component Type Utilities
 *
 * Shared type definitions and utility types for UI components.
 * Used across the design system for consistency and reusability.
 */

import { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button'
import { badgeVariants } from '@/components/ui/badge'
import { inputVariants } from '@/components/ui/input'
import { textareaVariants } from '@/components/ui/textarea'

/**
 * Button Component Types
 */
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

/**
 * Badge Component Types
 */
export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

/**
 * Input Component Types
 */
export type InputSize = NonNullable<VariantProps<typeof inputVariants>['size']>
export type InputState = NonNullable<VariantProps<typeof inputVariants>['state']>

/**
 * Textarea Component Types
 */
export type TextareaSize = NonNullable<VariantProps<typeof textareaVariants>['size']>
export type TextareaState = NonNullable<VariantProps<typeof textareaVariants>['state']>

/**
 * Common Component Props
 */

/**
 * Props for components that support child element composition
 */
export interface AsChildProps {
  /**
   * If true, the component will render as its child component
   * Useful for composition with links, navigation, etc.
   */
  asChild?: boolean
}

/**
 * Props for components with variant styling
 */
export interface VariantComponentProps<T extends Record<string, any>> {
  /**
   * CSS class names to merge with variant styles
   */
  className?: string
}

/**
 * Props for form input components
 */
export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional error state for validation styling
   */
  state?: InputState
  /**
   * Optional size variant
   */
  size?: InputSize
  /**
   * Optional error message to display
   */
  error?: string
  /**
   * Optional help text below input
   */
  helpText?: string
}

/**
 * Props for form textarea components
 */
export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Optional error state for validation styling
   */
  state?: TextareaState
  /**
   * Optional size variant
   */
  size?: TextareaSize
  /**
   * Optional error message to display
   */
  error?: string
  /**
   * Optional help text below textarea
   */
  helpText?: string
}

/**
 * Props for interactive components with focus management
 */
export interface FocusableProps extends HTMLAttributes<HTMLElement> {
  /**
   * Whether the component is disabled
   */
  disabled?: boolean
  /**
   * Callback when component receives focus
   */
  onFocus?: () => void
  /**
   * Callback when component loses focus
   */
  onBlur?: () => void
}

/**
 * State types for form validation
 */
export type ValidationState = 'default' | 'error' | 'success' | 'warning'

/**
 * Component size types
 */
export type ComponentSize = 'sm' | 'default' | 'lg'

/**
 * Utility type to extract variant props from a component
 * @example
 * type MyButtonProps = ExtractVariantProps<typeof Button>
 */
export type ExtractVariantProps<T> = T extends VariantProps<infer U> ? U : never

/**
 * Utility type for components with forward refs
 * @example
 * type ButtonRef = React.ForwardedRef<HTMLButtonElement>
 */
export type ForwardRefComponent<T extends keyof JSX.IntrinsicElements> =
  React.ForwardRefExoticComponent<
    React.PropsWithoutRef<JSX.IntrinsicElements[T]> & React.RefAttributes<HTMLElementTagNameMap[T]>
  >

/**
 * Color palette type for themed components
 */
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'

/**
 * Size variants for responsive components
 */
export const COMPONENT_SIZES = {
  sm: 'sm',
  default: 'default',
  lg: 'lg',
} as const

/**
 * Validation states for form components
 */
export const VALIDATION_STATES = {
  default: 'default',
  error: 'error',
  success: 'success',
  warning: 'warning',
} as const

/**
 * Button variants enumeration
 */
export const BUTTON_VARIANTS = {
  default: 'default',
  destructive: 'destructive',
  outline: 'outline',
  secondary: 'secondary',
  ghost: 'ghost',
  link: 'link',
} as const

/**
 * Badge variants enumeration
 */
export const BADGE_VARIANTS = {
  default: 'default',
  secondary: 'secondary',
  destructive: 'destructive',
  outline: 'outline',
} as const
