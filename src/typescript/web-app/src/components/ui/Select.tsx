'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'
// Simple ChevronDown icon component
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
)

/**
 * Select component variants
 */
const selectTriggerVariants = cva([
  'flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2',
  'text-sm ring-offset-white placeholder:text-neutral-500',
  'focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
])

const selectContentVariants = cva([
  'absolute z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-neutral-200 bg-white',
  'text-neutral-950 shadow-md animate-in fade-in-0 zoom-in-95',
])

const selectItemVariants = cva([
  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm',
  'outline-none focus:bg-neutral-100 focus:text-neutral-900',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
])

const selectLabelVariants = cva(['py-1.5 pl-8 pr-2 text-sm font-semibold'])

const selectSeparatorVariants = cva(['-mx-1 my-1 h-px bg-neutral-100'])

// Context for Select components
interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within a Select component')
  }
  return context
}

// Component Props
export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export interface SelectValueProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

export interface SelectLabelProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface SelectSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Select Component
 */
export const Select: React.FC<SelectProps> = ({
  value,
  defaultValue,
  onValueChange,
  children,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const [open, setOpen] = React.useState(false)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

/**
 * SelectTrigger Component
 */
export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelectContext()

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      className={cn(selectTriggerVariants(), className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})

/**
 * SelectValue Component
 */
export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => {
    const { value } = useSelectContext()

    return (
      <span ref={ref} className={cn(className)} {...props}>
        {value || placeholder}
      </span>
    )
  }
)

/**
 * SelectContent Component
 */
export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelectContext()
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={node => {
        if (contentRef.current !== node) {
          ;(
            contentRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node
        }
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      role="listbox"
      className={cn(selectContentVariants(), className)}
      {...props}
    >
      {children}
    </div>
  )
})

/**
 * SelectItem Component
 */
export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const { onValueChange, value: selectedValue } = useSelectContext()
    const isSelected = selectedValue === value

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        data-disabled={disabled}
        className={cn(selectItemVariants(), className)}
        onClick={() => !disabled && onValueChange(value)}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <div className="h-2 w-2 rounded-full bg-current" />}
        </span>
        {children}
      </div>
    )
  }
)

/**
 * SelectLabel Component
 */
export const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(selectLabelVariants(), className)}
      {...props}
    />
  )
)

/**
 * SelectSeparator Component
 */
export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn(selectSeparatorVariants(), className)}
    {...props}
  />
))

SelectTrigger.displayName = 'SelectTrigger'
SelectValue.displayName = 'SelectValue'
SelectContent.displayName = 'SelectContent'
SelectItem.displayName = 'SelectItem'
SelectLabel.displayName = 'SelectLabel'
SelectSeparator.displayName = 'SelectSeparator'

export {
  selectTriggerVariants,
  selectContentVariants,
  selectItemVariants,
  selectLabelVariants,
  selectSeparatorVariants,
}
