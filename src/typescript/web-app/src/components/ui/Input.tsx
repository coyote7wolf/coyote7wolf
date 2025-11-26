import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

/**
 * Input component variants using class-variance-authority
 * All classes are based on Design Tokens for easy Design System migration
 */
const inputVariants = cva(
  [
    'flex w-full border transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'placeholder:text-neutral-400',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  ],
  {
    variants: {
      // Visual variants
      variant: {
        outline:
          'bg-transparent border-neutral-300 hover:border-neutral-400 focus-visible:border-primary-500 focus-visible:ring-primary-500',
        filled:
          'bg-neutral-50 border-transparent hover:bg-neutral-100 focus-visible:bg-white focus-visible:border-primary-500 focus-visible:ring-primary-500',
        flushed:
          'bg-transparent border-0 border-b border-neutral-300 rounded-none hover:border-neutral-400 focus-visible:border-primary-500 focus-visible:ring-0 focus-visible:ring-offset-0',
        unstyled:
          'bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
      },
      // Size variants - using design token spacing
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-3 text-sm rounded-lg',
        lg: 'h-11 px-4 text-base rounded-lg',
        xl: 'h-12 px-4 text-lg rounded-xl',
      },
      // State variants
      state: {
        default: '',
        error:
          'border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500',
        success:
          'border-success-500 focus-visible:border-success-500 focus-visible:ring-success-500',
        warning:
          'border-warning-500 focus-visible:border-warning-500 focus-visible:ring-warning-500',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      state: 'default',
    },
  }
)

// Input component props
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Custom CSS classes */
  className?: string
  /** Left addon element */
  leftAddon?: React.ReactNode
  /** Right addon element */
  rightAddon?: React.ReactNode
  /** Left icon element */
  leftIcon?: React.ReactNode
  /** Right icon element */
  rightIcon?: React.ReactNode
  /** Helper text below input */
  helperText?: string
  /** Error message */
  errorMessage?: string
  /** Success message */
  successMessage?: string
  /** Warning message */
  warningMessage?: string
  /** Input label */
  label?: string
  /** Whether label is required */
  required?: boolean
  /** Component data-testid for testing */
  'data-testid'?: string
}

/**
 * Professional Input component with Design Token integration
 *
 * Features:
 * - Multiple visual variants (outline, filled, flushed, unstyled)
 * - Size variants using design token spacing
 * - State variants (default, error, success, warning)
 * - Left and right addons/icons
 * - Helper text and validation messages
 * - Label support with required indicator
 * - Full accessibility support
 * - TypeScript strict mode compatibility
 * - Easy Design System migration path
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   required
 *   leftIcon={<EmailIcon />}
 * />
 *
 * <Input
 *   variant="filled"
 *   state="error"
 *   errorMessage="This field is required"
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'outline',
      size = 'md',
      state = 'default',
      leftAddon,
      rightAddon,
      leftIcon,
      rightIcon,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      label,
      required,
      id,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    // Auto-generate ID if not provided and label exists
    const inputId =
      id ||
      (label ? `input-${Math.random().toString(36).substr(2, 9)}` : undefined)

    // Determine current state based on messages
    const currentState = errorMessage
      ? 'error'
      : successMessage
        ? 'success'
        : warningMessage
          ? 'warning'
          : state

    // Helper message based on state
    const currentMessage =
      errorMessage || successMessage || warningMessage || helperText

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
            {required && (
              <span className="ml-1 text-error-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left addon */}
          {leftAddon && (
            <div className="absolute left-0 top-0 h-full flex items-center">
              {leftAddon}
            </div>
          )}

          {/* Left icon */}
          {leftIcon && !leftAddon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            {...props}
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, state: currentState }),
              leftIcon && !leftAddon && 'pl-10',
              rightIcon && !rightAddon && 'pr-10',
              leftAddon && 'pl-12',
              rightAddon && 'pr-12',
              className
            )}
            aria-invalid={currentState === 'error'}
            aria-describedby={currentMessage ? `${inputId}-message` : undefined}
            data-testid={dataTestId}
          />

          {/* Right icon */}
          {rightIcon && !rightAddon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}

          {/* Right addon */}
          {rightAddon && (
            <div className="absolute right-0 top-0 h-full flex items-center">
              {rightAddon}
            </div>
          )}
        </div>

        {/* Helper/Error/Success/Warning message */}
        {currentMessage && (
          <p
            id={inputId ? `${inputId}-message` : undefined}
            className={cn(
              'text-xs',
              currentState === 'error' && 'text-error-500',
              currentState === 'success' && 'text-success-500',
              currentState === 'warning' && 'text-warning-500',
              currentState === 'default' && 'text-neutral-500'
            )}
          >
            {currentMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { inputVariants }
