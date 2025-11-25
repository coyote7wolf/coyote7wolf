import React from 'react';

// Option type for a single option
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// Option group type
export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
  disabled?: boolean;
}

// Accepts either flat options or option groups
export type SelectOptions = Array<SelectOption | SelectOptionGroup>;

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOptions;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  disabled?: boolean;
  multiple?: boolean;
  a11yLabel?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, size = 'md', color = 'primary', disabled, multiple, a11yLabel, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-label={a11yLabel}
      className={`select select-${color} select-${size} ${props.className ?? ''}`}
      disabled={disabled}
      multiple={multiple}
      {...props}
    >
      {options.map((opt, i) => {
        if ('options' in opt && Array.isArray(opt.options)) {
          // Option group
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
          // Flat option
          const o = opt as SelectOption;
          return (
            <option key={i} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          );
        }
      })}
    </select>
  );
});

Select.displayName = 'Select';
