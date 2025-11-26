import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

/**
 * Card component variants using class-variance-authority
 * All classes are based on Design Tokens for easy Design System migration
 */
const cardVariants = cva(
  [
    'relative overflow-hidden transition-all duration-200',
    'bg-white border border-neutral-200',
  ],
  {
    variants: {
      // Visual variants
      variant: {
        outline: 'border border-neutral-200',
        filled: 'border-0 bg-neutral-50',
        elevated: 'border-0 shadow-md hover:shadow-lg',
        ghost: 'border-0 bg-transparent',
      },
      // Size/Padding variants
      size: {
        xs: 'p-3',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      // Border radius variants
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
        full: 'rounded-3xl',
      },
      // Interactive states
      interactive: {
        true: 'cursor-pointer hover:shadow-md hover:border-neutral-300 transition-all',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      radius: 'md',
      interactive: false,
    },
  }
)

// Card header variants
const cardHeaderVariants = cva([
  'flex items-center justify-between',
  'pb-4 mb-4 border-b border-neutral-200',
])

// Card footer variants
const cardFooterVariants = cva([
  'flex items-center justify-between',
  'pt-4 mt-4 border-t border-neutral-200',
])

// Card component props
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Custom CSS classes */
  className?: string
  /** Card header content */
  header?: React.ReactNode
  /** Card footer content */
  footer?: React.ReactNode
  /** Whether card is clickable */
  interactive?: boolean
  /** Click handler for interactive cards */
  onCardClick?: () => void
  /** Component data-testid for testing */
  'data-testid'?: string
}

// Card Header component props
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

// Card Body component props
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

// Card Footer component props
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

/**
 * Professional Card component with Design Token integration
 *
 * Features:
 * - Multiple visual variants (outline, filled, elevated, ghost)
 * - Size variants using design token spacing
 * - Border radius variants from design tokens
 * - Interactive states with hover effects
 * - Header and footer support
 * - Composable sub-components
 * - Full accessibility support
 * - TypeScript strict mode compatibility
 * - Easy Design System migration path
 *
 * @example
 * ```tsx
 * <Card variant="elevated" size="md">
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardBody>
 *     Card content goes here
 *   </CardBody>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 *
 * <Card
 *   interactive
 *   onCardClick={() => console.log('clicked')}
 *   header={<h3>Interactive Card</h3>}
 *   footer={<span>Click me</span>}
 * >
 *   This card is clickable
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'outline',
      size = 'md',
      radius = 'md',
      interactive = false,
      header,
      footer,
      onCardClick,
      children,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    const handleClick = interactive && onCardClick ? onCardClick : undefined
    const isClickable = interactive && !!onCardClick

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, radius, interactive }),
          className
        )}
        onClick={handleClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-pressed={isClickable ? false : undefined}
        onKeyDown={
          isClickable
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onCardClick?.()
                }
              }
            : undefined
        }
        data-testid={dataTestId}
        {...props}
      >
        {/* Header */}
        {header && <div className={cardHeaderVariants()}>{header}</div>}

        {/* Content */}
        <div className="flex-1">{children}</div>

        {/* Footer */}
        {footer && <div className={cardFooterVariants()}>{footer}</div>}
      </div>
    )
  }
)

/**
 * Card Header component
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(cardHeaderVariants(), className)} {...props}>
      {children}
    </div>
  )
)

/**
 * Card Body component
 */
export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1', className)} {...props}>
      {children}
    </div>
  )
)

/**
 * Card Footer component
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(cardFooterVariants(), className)} {...props}>
      {children}
    </div>
  )
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardBody.displayName = 'CardBody'
CardFooter.displayName = 'CardFooter'

export { cardVariants, cardHeaderVariants, cardFooterVariants }
