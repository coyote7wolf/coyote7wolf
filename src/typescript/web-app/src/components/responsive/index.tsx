'use client'

import React from 'react'
import {
  cn,
  getResponsiveProps,
  type ResponsiveProps,
} from '@/utils/responsive'

/**
 * Enhanced responsive wrapper component
 */
export interface ResponsiveBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ResponsiveProps {
  /** Element tag to render */
  as?: keyof JSX.IntrinsicElements
  /** Custom CSS classes */
  className?: string
  /** Component data-testid for testing */
  'data-testid'?: string
}

export const ResponsiveBox = React.forwardRef<
  HTMLDivElement,
  ResponsiveBoxProps
>(
  (
    {
      as: Component = 'div',
      className,
      children,
      'data-testid': dataTestId,
      // Extract responsive props
      display,
      p,
      px,
      py,
      pt,
      pb,
      pl,
      pr,
      m,
      mx,
      my,
      mt,
      mb,
      ml,
      mr,
      w,
      h,
      textSize,
      textAlign,
      ...rest
    },
    ref
  ) => {
    // Filter out undefined values for responsive props
    const responsiveProps: Partial<ResponsiveProps> = {}
    if (display !== undefined) responsiveProps.display = display
    if (p !== undefined) responsiveProps.p = p
    if (px !== undefined) responsiveProps.px = px
    if (py !== undefined) responsiveProps.py = py
    if (pt !== undefined) responsiveProps.pt = pt
    if (pb !== undefined) responsiveProps.pb = pb
    if (pl !== undefined) responsiveProps.pl = pl
    if (pr !== undefined) responsiveProps.pr = pr
    if (m !== undefined) responsiveProps.m = m
    if (mx !== undefined) responsiveProps.mx = mx
    if (my !== undefined) responsiveProps.my = my
    if (mt !== undefined) responsiveProps.mt = mt
    if (mb !== undefined) responsiveProps.mb = mb
    if (ml !== undefined) responsiveProps.ml = ml
    if (mr !== undefined) responsiveProps.mr = mr
    if (w !== undefined) responsiveProps.w = w
    if (h !== undefined) responsiveProps.h = h
    if (textSize !== undefined) responsiveProps.textSize = textSize
    if (textAlign !== undefined) responsiveProps.textAlign = textAlign

    const responsiveClasses = getResponsiveProps(
      responsiveProps as ResponsiveProps
    )

    return React.createElement(
      Component,
      {
        ref,
        className: cn(responsiveClasses, className),
        'data-testid': dataTestId,
        ...rest,
      },
      children
    )
  }
)

ResponsiveBox.displayName = 'ResponsiveBox'

/**
 * Responsive Grid component with enhanced breakpoint support
 */
export interface ResponsiveGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Grid columns for different breakpoints */
  cols?: {
    xs?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    '2xl'?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  }
  /** Gap between grid items */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Custom CSS classes */
  className?: string
}

export const ResponsiveGrid = React.forwardRef<
  HTMLDivElement,
  ResponsiveGridProps
>(
  (
    {
      cols = { xs: 1, sm: 2, md: 3, lg: 4 },
      gap = 'md',
      className,
      children,
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

    const gridColsClasses = Object.entries(cols)
      .map(([breakpoint, colCount]) => {
        if (breakpoint === 'xs') {
          return `grid-cols-${colCount}`
        }
        return `${breakpoint}:grid-cols-${colCount}`
      })
      .join(' ')

    return (
      <div
        ref={ref}
        className={cn('grid', gridColsClasses, gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = 'ResponsiveGrid'

/**
 * Responsive Card component optimized for different screen sizes
 */
export interface ResponsiveCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Card padding for different breakpoints */
  padding?: {
    xs?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    sm?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    md?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    lg?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }
  /** Card variant */
  variant?: 'outline' | 'filled' | 'elevated' | 'ghost'
  /** Custom CSS classes */
  className?: string
}

export const ResponsiveCard = React.forwardRef<
  HTMLDivElement,
  ResponsiveCardProps
>(
  (
    {
      padding = { xs: 'sm', md: 'md', lg: 'lg' },
      variant = 'outline',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const paddingClasses = Object.entries(padding)
      .map(([breakpoint, size]) => {
        const paddingValues = {
          xs: 'p-3',
          sm: 'p-4',
          md: 'p-6',
          lg: 'p-8',
          xl: 'p-10',
        }

        if (breakpoint === 'xs') {
          return paddingValues[size]
        }
        return `${breakpoint}:${paddingValues[size]}`
      })
      .join(' ')

    const variantClasses = {
      outline: 'border border-neutral-200 bg-white',
      filled: 'bg-neutral-50 border-0',
      elevated: 'bg-white shadow-md hover:shadow-lg border-0',
      ghost: 'bg-transparent border-0',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          variantClasses[variant],
          paddingClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveCard.displayName = 'ResponsiveCard'

/**
 * Responsive Stack component for flex layouts
 */
export interface ResponsiveStackProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Stack direction for different breakpoints */
  direction?: {
    xs?: 'row' | 'column'
    sm?: 'row' | 'column'
    md?: 'row' | 'column'
    lg?: 'row' | 'column'
    xl?: 'row' | 'column'
  }
  /** Stack spacing */
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Alignment */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  /** Whether to wrap items */
  wrap?: boolean
  /** Custom CSS classes */
  className?: string
}

export const ResponsiveStack = React.forwardRef<
  HTMLDivElement,
  ResponsiveStackProps
>(
  (
    {
      direction = { xs: 'column', md: 'row' },
      spacing = 'md',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      className,
      children,
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
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    }

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }

    const directionClasses = Object.entries(direction)
      .map(([breakpoint, dir]) => {
        const dirMap = { row: 'flex-row', column: 'flex-col' }

        if (breakpoint === 'xs') {
          return dirMap[dir]
        }
        return `${breakpoint}:${dirMap[dir]}`
      })
      .join(' ')

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses,
          spacingClasses[spacing],
          alignClasses[align],
          justifyClasses[justify],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveStack.displayName = 'ResponsiveStack'

/**
 * Responsive Typography component
 */
export interface ResponsiveTextProps extends React.HTMLAttributes<HTMLElement> {
  /** HTML element to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  /** Text size for different breakpoints */
  size?: {
    xs?:
      | 'xs'
      | 'sm'
      | 'base'
      | 'lg'
      | 'xl'
      | '2xl'
      | '3xl'
      | '4xl'
      | '5xl'
      | '6xl'
    sm?:
      | 'xs'
      | 'sm'
      | 'base'
      | 'lg'
      | 'xl'
      | '2xl'
      | '3xl'
      | '4xl'
      | '5xl'
      | '6xl'
    md?:
      | 'xs'
      | 'sm'
      | 'base'
      | 'lg'
      | 'xl'
      | '2xl'
      | '3xl'
      | '4xl'
      | '5xl'
      | '6xl'
    lg?:
      | 'xs'
      | 'sm'
      | 'base'
      | 'lg'
      | 'xl'
      | '2xl'
      | '3xl'
      | '4xl'
      | '5xl'
      | '6xl'
  }
  /** Text alignment for different breakpoints */
  align?: {
    xs?: 'left' | 'center' | 'right'
    sm?: 'left' | 'center' | 'right'
    md?: 'left' | 'center' | 'right'
    lg?: 'left' | 'center' | 'right'
  }
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  /** Text color */
  color?: 'primary' | 'secondary' | 'muted' | 'destructive'
  /** Custom CSS classes */
  className?: string
}

export const ResponsiveText = React.forwardRef<
  HTMLElement,
  ResponsiveTextProps
>(
  (
    {
      as: Component = 'p',
      size = { xs: 'base', lg: 'lg' },
      align = { xs: 'left' },
      weight = 'normal',
      color = 'primary',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = Object.entries(size)
      .map(([breakpoint, textSize]) => {
        if (breakpoint === 'xs') {
          return `text-${textSize}`
        }
        return `${breakpoint}:text-${textSize}`
      })
      .join(' ')

    const alignClasses = Object.entries(align)
      .map(([breakpoint, textAlign]) => {
        if (breakpoint === 'xs') {
          return `text-${textAlign}`
        }
        return `${breakpoint}:text-${textAlign}`
      })
      .join(' ')

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    }

    const colorClasses = {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
      destructive: 'text-red-600',
    }

    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          sizeClasses,
          alignClasses,
          weightClasses[weight],
          colorClasses[color],
          className
        ),
        ...props,
      },
      children
    )
  }
)

ResponsiveText.displayName = 'ResponsiveText'
