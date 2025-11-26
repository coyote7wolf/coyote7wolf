import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

/**
 * Label component variants using class-variance-authority
 * All classes are based on Design Tokens for easy Design System migration
 */
const labelVariants = cva(
  [
    'font-medium leading-none',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  ],
  {
    variants: {
      // Size variants - using design token typography
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
      },
      // Color variants
      variant: {
        default: 'text-neutral-700',
        muted: 'text-neutral-500',
        subtle: 'text-neutral-600',
        accent: 'text-primary-600',
        success: 'text-success-600',
        warning: 'text-warning-600',
        error: 'text-error-600',
      },
      // Weight variants
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      weight: 'medium',
    },
  }
)

// Label component props
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  /** Custom CSS classes */
  className?: string
  /** Whether the associated field is required */
  required?: boolean
  /** Optional indicator text/symbol */
  optionalText?: string
  /** Required indicator text/symbol */
  requiredText?: string
  /** Component data-testid for testing */
  'data-testid'?: string
}

/**
 * Professional Label component with Design Token integration
 *
 * Features:
 * - Size variants using design token typography
 * - Color variants based on design tokens
 * - Weight variants for different emphasis levels
 * - Required/optional indicators
 * - Full accessibility support with proper association
 * - TypeScript strict mode compatibility
 * - Easy Design System migration path
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   Email Address
 * </Label>
 *
 * <Label variant="muted" size="sm">
 *   Optional field
 * </Label>
 *
 * <Label variant="error" required requiredText="(必填)">
 *   必填欄位
 * </Label>
 * ```
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      weight = 'medium',
      required = false,
      optionalText = '(optional)',
      requiredText = '*',
      children,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ size, variant, weight }), className)}
        data-testid={dataTestId}
        {...props}
      >
        {children}
        {required && (
          <span
            className={cn(
              'ml-1',
              variant === 'error' ? 'text-error-500' : 'text-error-500'
            )}
            aria-label="required"
          >
            {requiredText}
          </span>
        )}
        {!required && optionalText && (
          <span
            className={cn(
              'ml-1 font-normal',
              variant === 'default'
                ? 'text-neutral-400'
                : 'text-current opacity-70'
            )}
            aria-label="optional"
          >
            {optionalText}
          </span>
        )}
      </label>
    )
  }
)

Label.displayName = 'Label'

export { labelVariants }
