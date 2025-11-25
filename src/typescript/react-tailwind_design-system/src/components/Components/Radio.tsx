import React from 'react';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<globalThis.HTMLInputElement>, 'size'> {
  checked?: boolean;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  a11yLabel?: string;
  className?: string;
}

export const Radio = React.forwardRef<globalThis.HTMLInputElement, RadioProps>(
  (
    { checked, disabled, color = 'primary', size = 'md', a11yLabel, className = '', ...props },
    ref,
  ) => {
    const colorMap = {
      primary:
        'accent-primary border border-primary bg-white text-primary focus:ring-primary/50 dark:bg-primary-dark dark:border-primary-dark dark:accent-primary',
      secondary:
        'accent-secondary border border-secondary bg-white text-secondary focus:ring-secondary/50 dark:bg-secondary-dark dark:border-secondary-dark dark:accent-secondary',
      success:
        'accent-success border border-success bg-white text-success focus:ring-success/50 dark:bg-success-dark dark:border-success-dark dark:accent-success',
      warning:
        'accent-warning border border-warning bg-white text-warning focus:ring-warning/50 dark:bg-warning-dark dark:border-warning-dark dark:accent-warning',
      danger:
        'accent-danger border border-danger bg-white text-danger focus:ring-danger/50 dark:bg-danger-dark dark:border-danger-dark dark:accent-danger',
    };
    const sizeMap = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };
    return (
      <input
        type="radio"
        ref={ref}
        checked={checked}
        disabled={disabled}
        aria-label={a11yLabel}
        className={[
          'rounded-full border focus:outline-none transition-colors duration-150',
          colorMap[color],
          sizeMap[size],
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    );
  },
);
