import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'
import { BaseComponentProps } from '../types'

/**
 * Button component variants using class-variance-authority
 * All classes are based on Design Tokens for easy Design System migration
 */
const buttonVariants = cva(
  // Base styles - using design tokens
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-200',
    'border border-transparent',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'whitespace-nowrap',
  ],
  {
    variants: {
      // Visual variants
      variant: {
        solid: '',
        outline:
          'bg-transparent border-current hover:bg-current hover:text-white',
        ghost: 'bg-transparent border-transparent hover:bg-opacity-10',
        subtle: 'border-transparent',
        link: 'bg-transparent border-transparent underline-offset-4 hover:underline p-0 h-auto',
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
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-11 px-6 text-base rounded-lg',
        xl: 'h-12 px-8 text-lg rounded-xl',
      },
      // Loading state
      loading: {
        true: 'cursor-wait',
        false: '',
      },
    },
    // Compound variants for color + visual combinations
    compoundVariants: [
      // Primary solid
      {
        variant: 'solid',
        colorScheme: 'primary',
        className:
          'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
      },
      // Primary outline
      {
        variant: 'outline',
        colorScheme: 'primary',
        className:
          'text-primary-500 border-primary-500 hover:bg-primary-500 focus-visible:ring-primary-500',
      },
      // Primary ghost
      {
        variant: 'ghost',
        colorScheme: 'primary',
        className:
          'text-primary-500 hover:bg-primary-50 focus-visible:ring-primary-500',
      },
      // Primary subtle
      {
        variant: 'subtle',
        colorScheme: 'primary',
        className:
          'bg-primary-50 text-primary-700 hover:bg-primary-100 focus-visible:ring-primary-500',
      },
      // Primary link
      {
        variant: 'link',
        colorScheme: 'primary',
        className:
          'text-primary-500 hover:text-primary-600 focus-visible:ring-primary-500',
      },

      // Secondary variants
      {
        variant: 'solid',
        colorScheme: 'secondary',
        className:
          'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500',
      },
      {
        variant: 'outline',
        colorScheme: 'secondary',
        className:
          'text-secondary-500 border-secondary-500 hover:bg-secondary-500 focus-visible:ring-secondary-500',
      },
      {
        variant: 'ghost',
        colorScheme: 'secondary',
        className:
          'text-secondary-500 hover:bg-secondary-50 focus-visible:ring-secondary-500',
      },
      {
        variant: 'subtle',
        colorScheme: 'secondary',
        className:
          'bg-secondary-50 text-secondary-700 hover:bg-secondary-100 focus-visible:ring-secondary-500',
      },

      // Success variants
      {
        variant: 'solid',
        colorScheme: 'success',
        className:
          'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500',
      },
      {
        variant: 'outline',
        colorScheme: 'success',
        className:
          'text-success-500 border-success-500 hover:bg-success-500 focus-visible:ring-success-500',
      },
      {
        variant: 'ghost',
        colorScheme: 'success',
        className:
          'text-success-500 hover:bg-success-50 focus-visible:ring-success-500',
      },
      {
        variant: 'subtle',
        colorScheme: 'success',
        className:
          'bg-success-50 text-success-700 hover:bg-success-100 focus-visible:ring-success-500',
      },

      // Error variants
      {
        variant: 'solid',
        colorScheme: 'error',
        className:
          'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500',
      },
      {
        variant: 'outline',
        colorScheme: 'error',
        className:
          'text-error-500 border-error-500 hover:bg-error-500 focus-visible:ring-error-500',
      },
      {
        variant: 'ghost',
        colorScheme: 'error',
        className:
          'text-error-500 hover:bg-error-50 focus-visible:ring-error-500',
      },
      {
        variant: 'subtle',
        colorScheme: 'error',
        className:
          'bg-error-50 text-error-700 hover:bg-error-100 focus-visible:ring-error-500',
      },

      // Neutral variants
      {
        variant: 'solid',
        colorScheme: 'neutral',
        className:
          'bg-neutral-500 text-white hover:bg-neutral-600 focus-visible:ring-neutral-500',
      },
      {
        variant: 'outline',
        colorScheme: 'neutral',
        className:
          'text-neutral-500 border-neutral-300 hover:bg-neutral-500 hover:border-neutral-500 focus-visible:ring-neutral-500',
      },
      {
        variant: 'ghost',
        colorScheme: 'neutral',
        className:
          'text-neutral-600 hover:bg-neutral-100 focus-visible:ring-neutral-500',
      },
      {
        variant: 'subtle',
        colorScheme: 'neutral',
        className:
          'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus-visible:ring-neutral-500',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      colorScheme: 'primary',
      size: 'md',
      loading: false,
    },
  }
)

// Loading spinner component
const LoadingSpinner = ({
  size = 'sm',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Button component props
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof buttonVariants> {
  /** Custom CSS classes */
  className?: string
  /** Loading state */
  loading?: boolean
  /** Whether component is disabled */
  disabled?: boolean
  /** Left icon */
  leftIcon?: React.ReactNode
  /** Right icon */
  rightIcon?: React.ReactNode
  /** Button content */
  children?: React.ReactNode
  /** Component data-testid for testing */
  'data-testid'?: string
}

/**
 * Professional Button component with Design Token integration
 *
 * Features:
 * - Multiple visual variants (solid, outline, ghost, subtle, link)
 * - Color schemes based on design tokens
 * - Size variants using design token spacing
 * - Loading states with spinner
 * - Icon support (left and right)
 * - Full accessibility support
 * - TypeScript strict mode compatibility
 * - Easy Design System migration path
 *
 * @example
 * ```tsx
 * <Button variant="solid" colorScheme="primary" size="md">
 *   Click me
 * </Button>
 *
 * <Button variant="outline" colorScheme="error" loading>
 *   Deleting...
 * </Button>
 *
 * <Button variant="ghost" leftIcon={<PlusIcon />}>
 *   Add Item
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'solid',
      colorScheme = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, colorScheme, size, loading }),
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && <LoadingSpinner size={size === 'xs' ? 'xs' : 'sm'} />}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { buttonVariants }
export type { VariantProps }
