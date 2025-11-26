import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

/**
 * Badge component variants using class-variance-authority
 * All classes are based on Design Tokens for easy Design System migration
 */
const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
  ],
  {
    variants: {
      // Visual variants
      variant: {
        solid: '',
        outline: 'bg-transparent border',
        subtle: 'border-transparent',
        ghost: 'bg-transparent border-transparent',
      },
      // Color variants - using design token colors
      colorScheme: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        error: '',
        info: '',
        neutral: '',
      },
      // Size variants - using design token spacing
      size: {
        xs: 'px-1.5 py-0.5 text-xs rounded',
        sm: 'px-2 py-0.5 text-xs rounded-md',
        md: 'px-2.5 py-1 text-sm rounded-md',
        lg: 'px-3 py-1 text-sm rounded-lg',
      },
    },
    // Compound variants for color + visual combinations
    compoundVariants: [
      // Primary variants
      {
        variant: 'solid',
        colorScheme: 'primary',
        className: 'bg-primary-500 text-white',
      },
      {
        variant: 'outline',
        colorScheme: 'primary',
        className: 'text-primary-500 border-primary-500',
      },
      {
        variant: 'subtle',
        colorScheme: 'primary',
        className: 'bg-primary-50 text-primary-700',
      },
      {
        variant: 'ghost',
        colorScheme: 'primary',
        className: 'text-primary-500',
      },

      // Success variants
      {
        variant: 'solid',
        colorScheme: 'success',
        className: 'bg-success-500 text-white',
      },
      {
        variant: 'outline',
        colorScheme: 'success',
        className: 'text-success-500 border-success-500',
      },
      {
        variant: 'subtle',
        colorScheme: 'success',
        className: 'bg-success-50 text-success-700',
      },

      // Error variants
      {
        variant: 'solid',
        colorScheme: 'error',
        className: 'bg-error-500 text-white',
      },
      {
        variant: 'outline',
        colorScheme: 'error',
        className: 'text-error-500 border-error-500',
      },
      {
        variant: 'subtle',
        colorScheme: 'error',
        className: 'bg-error-50 text-error-700',
      },

      // Warning variants
      {
        variant: 'solid',
        colorScheme: 'warning',
        className: 'bg-warning-500 text-white',
      },
      {
        variant: 'outline',
        colorScheme: 'warning',
        className: 'text-warning-600 border-warning-500',
      },
      {
        variant: 'subtle',
        colorScheme: 'warning',
        className: 'bg-warning-50 text-warning-700',
      },

      // Neutral variants
      {
        variant: 'solid',
        colorScheme: 'neutral',
        className: 'bg-neutral-500 text-white',
      },
      {
        variant: 'outline',
        colorScheme: 'neutral',
        className: 'text-neutral-600 border-neutral-300',
      },
      {
        variant: 'subtle',
        colorScheme: 'neutral',
        className: 'bg-neutral-100 text-neutral-700',
      },
    ],
    defaultVariants: {
      variant: 'subtle',
      colorScheme: 'neutral',
      size: 'md',
    },
  }
)

// Badge component props
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Custom CSS classes */
  className?: string
  /** Left icon */
  leftIcon?: React.ReactNode
  /** Right icon */
  rightIcon?: React.ReactNode
  /** Whether badge is removable */
  removable?: boolean
  /** Remove handler */
  onRemove?: () => void
  /** Component data-testid for testing */
  'data-testid'?: string
}

/**
 * Professional Badge component with Design Token integration
 *
 * Features:
 * - Multiple visual variants (solid, outline, subtle, ghost)
 * - Color schemes based on design tokens
 * - Size variants using design token spacing
 * - Icon support (left and right)
 * - Removable functionality
 * - Full accessibility support
 * - TypeScript strict mode compatibility
 * - Easy Design System migration path
 *
 * @example
 * ```tsx
 * <Badge variant="solid" colorScheme="primary">
 *   New
 * </Badge>
 *
 * <Badge
 *   variant="subtle"
 *   colorScheme="success"
 *   leftIcon={<CheckIcon />}
 * >
 *   Completed
 * </Badge>
 *
 * <Badge removable onRemove={() => console.log('removed')}>
 *   Tag
 * </Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'subtle',
      colorScheme = 'neutral',
      size = 'md',
      leftIcon,
      rightIcon,
      removable = false,
      onRemove,
      children,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, colorScheme, size }), className)}
        data-testid={dataTestId}
        {...props}
      >
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {rightIcon && !removable && (
          <span className="shrink-0">{rightIcon}</span>
        )}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
            aria-label="Remove badge"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { badgeVariants }
