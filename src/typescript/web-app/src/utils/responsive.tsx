import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Enhanced responsive utility functions
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Responsive breakpoints
 */
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export type Breakpoint = keyof typeof breakpoints

/**
 * Responsive value type - can be a single value or responsive object
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

/**
 * Convert responsive value to Tailwind classes
 */
export function getResponsiveClasses<T>(
  value: ResponsiveValue<T>,
  prefix: string = '',
  transform?: (val: T) => string
): string {
  if (typeof value === 'string' || typeof value === 'number') {
    const val = transform ? transform(value as T) : String(value)
    return prefix ? `${prefix}${val}` : val
  }

  const classes: string[] = []
  const responsiveObj = value as Partial<Record<Breakpoint, T>>

  // Base value (mobile first)
  if (responsiveObj.xs !== undefined) {
    const val = transform
      ? transform(responsiveObj.xs)
      : String(responsiveObj.xs)
    classes.push(prefix ? `${prefix}${val}` : val)
  }

  // Responsive breakpoints
  Object.entries(responsiveObj).forEach(([bp, val]) => {
    if (bp !== 'xs' && val !== undefined) {
      const transformedVal = transform ? transform(val) : String(val)
      const className = prefix ? `${prefix}${transformedVal}` : transformedVal
      classes.push(`${bp}:${className}`)
    }
  })

  return classes.join(' ')
}

/**
 * Common responsive patterns
 */

// Spacing utilities
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const

export type SpacingValue = keyof typeof spacing

// Generate responsive spacing classes
export function getSpacing(
  value: ResponsiveValue<SpacingValue>,
  type:
    | 'p'
    | 'm'
    | 'px'
    | 'py'
    | 'pt'
    | 'pb'
    | 'pl'
    | 'pr'
    | 'mx'
    | 'my'
    | 'mt'
    | 'mb'
    | 'ml'
    | 'mr'
): string {
  return getResponsiveClasses(value, `${type}-`, val => String(val))
}

// Generate responsive grid columns
export function getGridCols(
  value: ResponsiveValue<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
): string {
  return getResponsiveClasses(value, 'grid-cols-', val => String(val))
}

// Generate responsive flexbox classes
export function getFlexDirection(
  value: ResponsiveValue<'row' | 'col' | 'row-reverse' | 'col-reverse'>
): string {
  return getResponsiveClasses(value, 'flex-')
}

export function getJustifyContent(
  value: ResponsiveValue<
    'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  >
): string {
  return getResponsiveClasses(value, 'justify-')
}

export function getAlignItems(
  value: ResponsiveValue<'start' | 'end' | 'center' | 'baseline' | 'stretch'>
): string {
  return getResponsiveClasses(value, 'items-')
}

// Generate responsive text classes
export function getTextSize(
  value: ResponsiveValue<
    'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  >
): string {
  return getResponsiveClasses(value, 'text-')
}

export function getTextAlign(
  value: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>
): string {
  return getResponsiveClasses(value, 'text-')
}

// Generate responsive display classes
export function getDisplay(
  value: ResponsiveValue<
    | 'block'
    | 'inline-block'
    | 'inline'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
    | 'hidden'
  >
): string {
  return getResponsiveClasses(value, '')
}

// Generate responsive width/height classes
export function getWidth(
  value: ResponsiveValue<
    'auto' | 'full' | 'screen' | 'min' | 'max' | 'fit' | string
  >
): string {
  return getResponsiveClasses(value, 'w-')
}

export function getHeight(
  value: ResponsiveValue<
    'auto' | 'full' | 'screen' | 'min' | 'max' | 'fit' | string
  >
): string {
  return getResponsiveClasses(value, 'h-')
}

/**
 * Responsive component helper
 */
export interface ResponsiveProps {
  /** Responsive display */
  display?: ResponsiveValue<
    | 'block'
    | 'inline-block'
    | 'inline'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
    | 'hidden'
  >
  /** Responsive padding */
  p?: ResponsiveValue<SpacingValue>
  px?: ResponsiveValue<SpacingValue>
  py?: ResponsiveValue<SpacingValue>
  pt?: ResponsiveValue<SpacingValue>
  pb?: ResponsiveValue<SpacingValue>
  pl?: ResponsiveValue<SpacingValue>
  pr?: ResponsiveValue<SpacingValue>
  /** Responsive margin */
  m?: ResponsiveValue<SpacingValue>
  mx?: ResponsiveValue<SpacingValue>
  my?: ResponsiveValue<SpacingValue>
  mt?: ResponsiveValue<SpacingValue>
  mb?: ResponsiveValue<SpacingValue>
  ml?: ResponsiveValue<SpacingValue>
  mr?: ResponsiveValue<SpacingValue>
  /** Responsive width/height */
  w?: ResponsiveValue<
    'auto' | 'full' | 'screen' | 'min' | 'max' | 'fit' | string
  >
  h?: ResponsiveValue<
    'auto' | 'full' | 'screen' | 'min' | 'max' | 'fit' | string
  >
  /** Responsive text */
  textSize?: ResponsiveValue<
    'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  >
  textAlign?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>
}

/**
 * Generate responsive classes from props
 */
export function getResponsiveProps(props: ResponsiveProps): string {
  const classes: string[] = []

  if (props.display) classes.push(getDisplay(props.display))

  // Padding
  if (props.p) classes.push(getSpacing(props.p, 'p'))
  if (props.px) classes.push(getSpacing(props.px, 'px'))
  if (props.py) classes.push(getSpacing(props.py, 'py'))
  if (props.pt) classes.push(getSpacing(props.pt, 'pt'))
  if (props.pb) classes.push(getSpacing(props.pb, 'pb'))
  if (props.pl) classes.push(getSpacing(props.pl, 'pl'))
  if (props.pr) classes.push(getSpacing(props.pr, 'pr'))

  // Margin
  if (props.m) classes.push(getSpacing(props.m, 'm'))
  if (props.mx) classes.push(getSpacing(props.mx, 'mx'))
  if (props.my) classes.push(getSpacing(props.my, 'my'))
  if (props.mt) classes.push(getSpacing(props.mt, 'mt'))
  if (props.mb) classes.push(getSpacing(props.mb, 'mb'))
  if (props.ml) classes.push(getSpacing(props.ml, 'ml'))
  if (props.mr) classes.push(getSpacing(props.mr, 'mr'))

  // Dimensions
  if (props.w) classes.push(getWidth(props.w))
  if (props.h) classes.push(getHeight(props.h))

  // Text
  if (props.textSize) classes.push(getTextSize(props.textSize))
  if (props.textAlign) classes.push(getTextAlign(props.textAlign))

  return classes.filter(Boolean).join(' ')
}

/**
 * Media query hook for detecting breakpoints in JavaScript
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('xs')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width >= 1536) setBreakpoint('2xl')
      else if (width >= 1280) setBreakpoint('xl')
      else if (width >= 1024) setBreakpoint('lg')
      else if (width >= 768) setBreakpoint('md')
      else if (width >= 640) setBreakpoint('sm')
      else setBreakpoint('xs')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

/**
 * Responsive visibility hook
 */
export function useResponsiveVisibility(
  breakpoints: Partial<Record<Breakpoint, boolean>>
): boolean {
  const currentBreakpoint = useBreakpoint()

  // Find the visibility setting for current breakpoint or closest smaller one
  const orderedBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = orderedBreakpoints.indexOf(currentBreakpoint)

  for (let i = currentIndex; i >= 0; i--) {
    const bp = orderedBreakpoints[i]
    if (bp && breakpoints[bp] !== undefined) {
      return breakpoints[bp]!
    }
  }

  return true // Default to visible
}

/**
 * React component imports for responsive utilities
 */
import React from 'react'
