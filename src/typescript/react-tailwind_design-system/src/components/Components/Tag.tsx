import * as React from 'react';

export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onSelect'> {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  closable?: boolean;
  variant?: 'solid' | 'outline' | 'ghost';
  selected?: boolean; // Tag specific: selected state
  disabled?: boolean; // Tag specific: disabled state
  checkable?: boolean; // Tag specific: checkable
  onClose?: () => void;
  onSelect?: (selected: boolean) => void; // Tag specific: select callback
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    color = 'primary',
    size = 'md',
    icon,
    closable,
    variant = 'solid',
    selected = false,
    disabled = false,
    checkable = false,
    onClose,
    onSelect,
    children,
    className = '',
    onClick,
    ...props
  },
  ref,
) {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (disabled) return;

    if (checkable && onSelect) {
      onSelect(!selected);
    }

    onClick?.(e);
  };

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
  const selectedClass = selected ? 'ring-2 ring-primary' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const interactiveClass = checkable || closable ? 'cursor-pointer' : '';
  const composed = [
    'inline-flex items-center rounded font-medium',
    colorMap[color] || colorMap.primary,
    sizeMap[size] || sizeMap.md,
    variantMap[variant] || '',
    selectedClass,
    disabledClass,
    interactiveClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span ref={ref} className={composed} onClick={handleClick} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          className="ml-1 hover:text-danger"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          aria-label="Close"
          disabled={disabled}
        >
          ×
        </button>
      )}
    </span>
  );
});

Tag.displayName = 'Tag';
