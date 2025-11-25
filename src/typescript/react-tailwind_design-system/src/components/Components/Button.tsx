import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<globalThis.HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none';
  const sizeMap = {
    sm: 'text-sm px-3 py-1.5 h-8',
    md: 'text-base px-4 py-2 h-10',
    lg: 'text-lg px-6 py-3 h-12',
  };
  const variantMap = {
    primary:
      'bg-primary text-primary-text border border-primary rounded-md shadow-md hover:bg-primary/90 active:bg-primary-dark disabled:bg-disabled disabled:text-white opacity-100 dark:bg-primary.dark dark:text-primary.text dark:border-primary.dark dark:hover:bg-primary/80 dark:active:bg-primary.dark dark:disabled:bg-disabled',
    secondary:
      'bg-secondary text-secondary-text border border-secondary rounded-md shadow-md hover:bg-secondary/90 active:bg-secondary.dark disabled:bg-disabled dark:bg-secondary.dark dark:text-secondary.text dark:border-secondary.dark dark:hover:bg-secondary/80 dark:active:bg-secondary.dark dark:disabled:bg-disabled',
    outline:
      'border border-primary text-primary bg-transparent rounded-md hover:bg-primary/10 active:bg-primary/20 disabled:border-disabled disabled:text-disabled dark:border-primary.dark dark:text-primary.dark dark:hover:bg-primary.dark/10 dark:active:bg-primary.dark/20 dark:disabled:border-disabled dark:disabled:text-disabled',
    ghost:
      'bg-transparent text-primary hover:bg-primary/10 rounded-md disabled:text-disabled dark:text-primary.dark dark:hover:bg-primary.dark/10 dark:disabled:text-disabled',
    text: 'bg-transparent text-primary hover:underline rounded-md disabled:text-disabled dark:text-primary.dark dark:disabled:text-disabled',
  };
  return (
    <button
      className={[
        base,
        sizeMap[size] || sizeMap.md,
        variantMap[variant] || variantMap.primary,
        className,
      ].join(' ')}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : leftIcon ? (
        <span className="mr-2 flex-shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
