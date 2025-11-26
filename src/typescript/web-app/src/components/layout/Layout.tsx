/**
 * 容器和佈局組件
 *
 * 提供響應式佈局組件
 */

import React from 'react'
import { cn } from '@/utils/cn'

// Container 組件
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
}

export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  centered = true,
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        'w-full px-4',
        sizeClasses[size],
        centered && 'mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Stack 組件 (垂直堆疊)
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export const Stack: React.FC<StackProps> = ({
  spacing = 'md',
  align = 'stretch',
  className,
  children,
  ...props
}) => {
  const spacingClasses = {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  return (
    <div
      className={cn(
        'flex flex-col',
        spacingClasses[spacing],
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Grid 組件
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

export const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 'md',
  responsive = true,
  className,
  children,
  ...props
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  }

  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const responsiveClasses = responsive
    ? {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
        12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12',
      }
    : colsClasses

  return (
    <div
      className={cn(
        'grid',
        responsive ? responsiveClasses[cols] : colsClasses[cols],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
