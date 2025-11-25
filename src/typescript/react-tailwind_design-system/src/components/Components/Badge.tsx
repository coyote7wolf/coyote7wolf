import * as React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  closable?: boolean;
  variant?: 'solid' | 'outline' | 'ghost';
  onClose?: () => void;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    color = 'primary',
    size = 'md',
    icon,
    closable,
    variant = 'solid',
    onClose,
    children,
    className = '',
    ...props
  },
  ref,
) {
  // Unified color className
  const colorMap = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-danger text-white',
  };
  const sizeMap = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  const variantMap = {
    solid: '',
    outline: 'bg-transparent border border-current',
    ghost: 'bg-opacity-10',
  };
  const composed = [
    'inline-flex items-center rounded font-medium',
    colorMap[color] || colorMap.primary,
    sizeMap[size] || sizeMap.md,
    variantMap[variant] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span ref={ref} className={composed} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          className="ml-1 text-lg leading-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </span>
  );
});

Badge.displayName = 'Badge';
