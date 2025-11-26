'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

/**
 * Switch component variants
 */
const switchVariants = cva([
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2',
  'focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50',
  'data-[state=checked]:bg-neutral-900 data-[state=unchecked]:bg-neutral-200',
])

const switchThumbVariants = cva([
  'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
  'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
])

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof switchVariants> {
  /** Whether the switch is checked */
  checked?: boolean
  /** Whether the switch is checked by default */
  defaultChecked?: boolean
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void
  /** Whether the switch is required */
  required?: boolean
  /** Name attribute for form submission */
  name?: string
  /** Value attribute for form submission */
  value?: string
}

/**
 * Switch Component
 *
 * A control that allows the user to toggle between checked and not checked.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      required,
      name,
      value,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked || false
    )
    const isControlled = checked !== undefined
    const isChecked = isControlled ? checked : internalChecked

    const handleClick = () => {
      if (disabled) return

      const newChecked = !isChecked
      if (!isControlled) {
        setInternalChecked(newChecked)
      }
      onCheckedChange?.(newChecked)
    }

    return (
      <div className="relative">
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={isChecked}
          data-state={isChecked ? 'checked' : 'unchecked'}
          disabled={disabled}
          className={cn(switchVariants(), className)}
          onClick={handleClick}
          {...props}
        >
          <span
            data-state={isChecked ? 'checked' : 'unchecked'}
            className={switchThumbVariants()}
          />
        </button>
        {/* Hidden input for form submission */}
        {name && (
          <input
            type="checkbox"
            name={name}
            value={value}
            checked={isChecked}
            required={required}
            onChange={() => {}} // Controlled by button click
            className="absolute opacity-0 pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>
    )
  }
)

Switch.displayName = 'Switch'

export { switchVariants, switchThumbVariants }
