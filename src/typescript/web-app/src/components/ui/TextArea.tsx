import React from 'react'
import { cn } from '../utils'

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Custom CSS classes */
  className?: string
  /** Visual variant */
  variant?: 'outline' | 'filled' | 'flushed'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** State variant */
  state?: 'default' | 'error' | 'success' | 'warning'
  /** Helper text */
  helperText?: string
  /** Error message */
  errorMessage?: string
  /** Success message */
  successMessage?: string
  /** Warning message */
  warningMessage?: string
  /** Whether to auto-resize */
  autoResize?: boolean
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      variant = 'outline',
      size = 'md',
      state = 'default',
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      autoResize = false,
      ...props
    },
    ref
  ) => {
    const currentState = errorMessage
      ? 'error'
      : successMessage
        ? 'success'
        : warningMessage
          ? 'warning'
          : state

    const currentMessage =
      errorMessage || successMessage || warningMessage || helperText

    const variantClasses = {
      outline:
        'border border-neutral-300 bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20',
      filled:
        'border border-transparent bg-neutral-50 hover:bg-neutral-100 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20',
      flushed:
        'border-0 border-b border-neutral-300 rounded-none bg-transparent hover:border-neutral-400 focus:border-primary-500 focus:ring-0',
    }

    const sizeClasses = {
      sm: 'min-h-[80px] px-3 py-2 text-sm rounded-md',
      md: 'min-h-[100px] px-3 py-2.5 text-sm rounded-lg',
      lg: 'min-h-[120px] px-4 py-3 text-base rounded-lg',
    }

    const stateClasses = {
      default: '',
      error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
      success:
        'border-success-500 focus:border-success-500 focus:ring-success-500',
      warning:
        'border-warning-500 focus:border-warning-500 focus:ring-warning-500',
    }

    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          ref={ref}
          className={cn(
            'w-full transition-colors duration-200 resize-y',
            'focus:outline-none placeholder:text-neutral-400',
            'disabled:cursor-not-allowed disabled:opacity-50',
            variantClasses[variant],
            sizeClasses[size],
            stateClasses[currentState],
            autoResize && 'resize-none',
            className
          )}
          aria-invalid={currentState === 'error'}
          {...props}
        />

        {currentMessage && (
          <p
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

TextArea.displayName = 'TextArea'
