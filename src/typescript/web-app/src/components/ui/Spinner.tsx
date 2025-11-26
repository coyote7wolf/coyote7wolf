import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

/**
 * Spinner component variants using class-variance-authority
 * All classes are based on Design Tokens for easy Design System migration
 */
const spinnerVariants = cva(
  [
    'animate-spin rounded-full border-2 border-solid',
    'border-current border-r-transparent',
  ],
  {
    variants: {
      // Size variants - using design token spacing
      size: {
        xs: 'w-3 h-3 border',
        sm: 'w-4 h-4 border',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-2',
        xl: 'w-12 h-12 border-4',
      },
      // Color variants
      variant: {
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        success: 'text-success-500',
        warning: 'text-warning-500',
        error: 'text-error-500',
        info: 'text-info-500',
        neutral: 'text-neutral-500',
        current: 'text-current',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
)

// Spinner component props
export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  /** Custom CSS classes */
  className?: string
  /** Accessible label for screen readers */
  label?: string
  /** Component data-testid for testing */
  'data-testid'?: string
}

/**
 * Professional Spinner component with Design Token integration
 *
 * Features:
 * - Size variants using design token spacing
 * - Color variants based on design tokens
 * - Accessible with proper ARIA labels
 * - Smooth CSS animations
 * - TypeScript strict mode compatibility
 * - Easy Design System migration path
 *
 * @example
 * ```tsx
 * <Spinner size="md" variant="primary" />
 *
 * <Spinner size="lg" variant="success" label="Loading data..." />
 *
 * <Spinner variant="current" />
 * ```
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = 'md',
      variant = 'primary',
      label = 'Loading...',
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label={label}
        data-testid={dataTestId}
        {...props}
      >
        <span className="sr-only">{label}</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

export { spinnerVariants }
