import React from 'react';

// Option type for a single option
type DropdownOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

// Option group type
type DropdownOptionGroup = {
  label: string;
  options: DropdownOption[];
  disabled?: boolean;
};

// Accepts either flat options or option groups
type DropdownOptions = Array<DropdownOption | DropdownOptionGroup>;

export interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: DropdownOptions;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  multiple?: boolean;
  a11yLabel?: string;
  className?: string;
}

// Pure dropdown, styled with tailwind config tokens only

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ options, disabled, multiple, a11yLabel, className = '', ...props }, ref) => {
    // Omit 'size' from props to avoid passing string size to <select>
    // Remove 'size' if present, as only number is valid for native select
    // Omit 'size' prop if present
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { size: _size, ...restProps } = props;
    return (
      <select
        ref={ref}
        aria-label={a11yLabel}
        className={`border border-dropdown-border bg-dropdown-bg text-dropdown-text placeholder-dropdown-placeholder rounded-md px-3 py-2 dark:bg-dropdown-dark-bg dark:text-dropdown-dark-text dark:border-dropdown-dark-border dark:placeholder-dropdown-dark-placeholder focus:ring focus:outline-none ${className} ${disabled ? 'bg-dropdown-disabled text-dropdown-disabled opacity-50 dark:bg-dropdown-dark-disabled dark:text-dropdown-dark-disabled' : ''} ${multiple ? 'select-multiple' : ''}`}
        disabled={disabled}
        multiple={multiple}
        {...restProps}
      >
        {options.map((opt, i) => {
          if ('options' in opt && Array.isArray(opt.options)) {
            return (
              <optgroup key={i} label={opt.label} disabled={opt.disabled}>
                {opt.options.map((o, j) => (
                  <option key={j} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            );
          } else {
            const o = opt as DropdownOption;
            return (
              <option key={i} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            );
          }
        })}
      </select>
    );
  },
);

Dropdown.displayName = 'Dropdown';
