import React from 'react'
import { cn } from '../utils'

/**
 * Container component for responsive layouts
 */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom CSS classes */
  className?: string
  /** Container size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Whether to center the container */
  centerContent?: boolean
  /** Component data-testid for testing */
  'data-testid'?: string
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      size = 'lg',
      centerContent = true,
      children,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'max-w-screen-sm', // 640px
      md: 'max-w-screen-md', // 768px
      lg: 'max-w-screen-lg', // 1024px
      xl: 'max-w-screen-xl', // 1280px
      full: 'max-w-full',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full px-4 sm:px-6 lg:px-8',
          sizeClasses[size],
          centerContent && 'mx-auto',
          className
        )}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </div>
    )
  }
)

/**
 * Stack component for vertical layouts
 */
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom CSS classes */
  className?: string
  /** Spacing between items */
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Alignment of items */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** Direction of stack */
  direction?: 'column' | 'row'
  /** Whether to wrap items */
  wrap?: boolean
  /** Component data-testid for testing */
  'data-testid'?: string
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      spacing = 'md',
      align = 'stretch',
      direction = 'column',
      wrap = false,
      children,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    }

    const alignClasses = {
      start: direction === 'column' ? 'items-start' : 'justify-start',
      center: direction === 'column' ? 'items-center' : 'justify-center',
      end: direction === 'column' ? 'items-end' : 'justify-end',
      stretch: direction === 'column' ? 'items-stretch' : 'justify-stretch',
    }

    const directionClasses = {
      column: 'flex-col',
      row: 'flex-row',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          spacingClasses[spacing],
          alignClasses[align],
          wrap && 'flex-wrap',
          className
        )}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </div>
    )
  }
)

/**
 * Grid component for grid layouts
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom CSS classes */
  className?: string
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  /** Gap between items */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Responsive columns */
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  }
  /** Component data-testid for testing */
  'data-testid'?: string
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      cols = 1,
      gap = 'md',
      responsive,
      children,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    const gapClasses = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    }

    const colsClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    }

    const responsiveClasses = responsive
      ? [
          responsive.sm && `sm:grid-cols-${responsive.sm}`,
          responsive.md && `md:grid-cols-${responsive.md}`,
          responsive.lg && `lg:grid-cols-${responsive.lg}`,
          responsive.xl && `xl:grid-cols-${responsive.xl}`,
        ].filter(Boolean)
      : []

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colsClasses[cols],
          gapClasses[gap],
          ...responsiveClasses,
          className
        )}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'
Stack.displayName = 'Stack'
Grid.displayName = 'Grid'
