'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

/**
 * Tabs component variants
 */
const tabsVariants = cva(['w-full'])

const tabsListVariants = cva([
  'inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 p-1 text-neutral-500',
  'w-full',
])

const tabsTriggerVariants = cva([
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5',
  'text-sm font-medium ring-offset-white transition-all',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  'data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm',
  'hover:bg-neutral-200/50',
])

const tabsContentVariants = cva([
  'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-neutral-950 focus-visible:ring-offset-2',
])

// Tabs Context
interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({
  value: '',
  onValueChange: () => {},
})

const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (
    !context ||
    (context.value === '' && context.onValueChange === (() => {}))
  ) {
    throw new Error('Tabs components must be used within a Tabs component')
  }
  return context
}

// Component Props
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

/**
 * Tabs Component
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { className, value, defaultValue, onValueChange, children, ...props },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const handleValueChange = (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <TabsContext.Provider
        value={{ value: currentValue, onValueChange: handleValueChange }}
      >
        <div ref={ref} className={cn(tabsVariants(), className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)

/**
 * TabsList Component
 */
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(tabsListVariants(), className)}
      {...props}
    >
      {children}
    </div>
  )
)

/**
 * TabsTrigger Component
 */
export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, children, disabled, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = useTabsContext()
  const isSelected = selectedValue === value

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? 'active' : 'inactive'}
      disabled={disabled}
      className={cn(tabsTriggerVariants(), className)}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
})

/**
 * TabsContent Component
 */
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext()
    const isSelected = selectedValue === value

    if (!isSelected) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isSelected ? 'active' : 'inactive'}
        className={cn(tabsContentVariants(), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Tabs.displayName = 'Tabs'
TabsList.displayName = 'TabsList'
TabsTrigger.displayName = 'TabsTrigger'
TabsContent.displayName = 'TabsContent'

export {
  tabsVariants,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
}
