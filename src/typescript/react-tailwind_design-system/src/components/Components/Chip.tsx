import * as React from 'react';
import clsx from 'clsx';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Optional avatar (e.g., user image or initial) */
  avatar?: React.ReactNode;
  /** Show a remove button */
  closable?: boolean;
  /** Callback for remove action */
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Visual variant */
  variant?: 'filled' | 'outline' | 'elevated';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Selected state (choice/filter chips) */
  selected?: boolean;
}

/** Industry-style Chip: interactive, selectable, deletable. Distinct from Badge (passive) & Tag (categorization). */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      icon,
      avatar,
      closable = false,
      onClose,
      variant = 'filled',
      size = 'md',
      selected = false,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: 'text-xs h-6 px-2',
      md: 'text-sm h-7 px-3',
      lg: 'text-sm h-8 px-4',
    }[size];

    const variantClasses = (() => {
      if (selected) {
        return 'bg-primary text-white';
      }
      switch (variant) {
        case 'outline':
          return 'border border-primary text-primary bg-transparent';
        case 'elevated':
          return 'bg-primary text-white shadow-sm';
        default:
          return 'bg-primary text-white';
      }
    })();

    const interaction = disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'hover:bg-primary/80 active:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

    const base = 'inline-flex items-center rounded-full font-medium transition-colors select-none';

    const composed = clsx(base, sizeClasses, variantClasses, interaction, className);

    return (
      <span className={clsx('inline-flex items-center gap-1', disabled && 'pointer-events-none')}>
        <button
          ref={ref}
          type="button"
          className={composed}
          disabled={disabled}
          aria-pressed={selected}
          {...rest}
        >
          {avatar && (
            <span
              className="flex-shrink-0 overflow-hidden rounded-full w-4 h-4 bg-chip-active text-[10px] flex items-center justify-center"
              aria-hidden="true"
            >
              {avatar}
            </span>
          )}
          {icon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="truncate max-w-[10rem]">{children}</span>
        </button>
        {closable && !disabled && (
          <button
            type="button"
            aria-label="Remove chip"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.(e);
            }}
            className={clsx(
              'ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs transition-colors',
              selected
                ? 'bg-chip-selected text-chip-selectedText hover:bg-chip-active'
                : 'bg-chip text-chip hover:bg-chip-hover active:bg-chip-active',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            )}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </span>
    );
  },
);

Chip.displayName = 'Chip';
