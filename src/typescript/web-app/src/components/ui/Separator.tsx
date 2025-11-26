'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

/**
 * Separator component variants
 */
const separatorVariants = cva([], {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
    variant: {
      default: 'bg-neutral-200',
      muted: 'bg-neutral-100',
      strong: 'bg-neutral-300',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'default',
  },
})

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  /** Orientation of the separator */
  orientation?: 'horizontal' | 'vertical'
  /** Visual variant */
  variant?: 'default' | 'muted' | 'strong'
  /** Whether separator is decorative (for screen readers) */
  decorative?: boolean
}

/**
 * Separator Component
 *
 * A visual or semantic separator element.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className,
      orientation = 'horizontal',
      variant = 'default',
      decorative = true,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation}
      className={cn(separatorVariants({ orientation, variant }), className)}
      {...props}
    />
  )
)

Separator.displayName = 'Separator'

export { separatorVariants }
