import React from 'react';

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<globalThis.HTMLInputElement>,
    'size' | 'prefix' | 'suffix'
  > {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
  inputSize?: 'sm' | 'md' | 'lg' | 'full';
  error?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  loading?: boolean;
}
export const Input: React.FC<InputProps> = ({
  variant = 'primary',
  inputSize = 'md',
  error,
  prefix,
  suffix,
  loading = false,
  disabled,
  className = '',
  ...rest
}) => {
  // 對應 token class
  const base =
    'block w-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md';
  const sizeMap = {
    sm: 'text-sm px-3 py-1.5 h-8',
    md: 'text-base px-4 py-2 h-10',
    lg: 'text-lg px-6 py-3 h-12',
    full: 'w-full',
  };
  const variantMap = {
    primary:
      'bg-white border border-primary text-primary placeholder-gray-400 dark:bg-primary-dark dark:text-primary-darkText dark:border-primary-dark',
    secondary:
      'bg-secondary-light border border-secondary text-secondary-text placeholder-gray-400 dark:bg-secondary-dark dark:text-secondary-darkText dark:border-secondary-dark',
    outline:
      'bg-transparent border border-primary text-primary placeholder-gray-400 dark:bg-transparent dark:text-primary-darkText dark:border-primary-dark',
    ghost: 'bg-transparent border-0 text-primary placeholder-gray-400 dark:text-primary-darkText',
    text: 'bg-transparent border-0 text-primary placeholder-gray-400 dark:text-primary-darkText',
  };
  const errorClass = error
    ? 'border-danger text-danger placeholder-danger focus:ring-danger/50 dark:border-danger dark:text-danger dark:placeholder-danger'
    : '';
  const loadingClass = loading ? 'animate-pulse' : '';

  return (
    <div
      className={`flex items-center gap-2 ${sizeMap[inputSize] || ''} ${disabled ? 'opacity-50' : ''}`}
    >
      {prefix && <span className="text-primary dark:text-primary-darkText">{prefix}</span>}
      <input
        className={[
          base,
          sizeMap[inputSize] || '',
          variantMap[variant],
          errorClass,
          loadingClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        aria-invalid={!!error}
        aria-busy={loading}
        {...rest}
      />
      {suffix && <span className="text-primary dark:text-primary-darkText">{suffix}</span>}
    </div>
  );
};
