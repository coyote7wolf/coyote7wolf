import React, { useState, useCallback } from 'react';

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  multiline?: boolean;
  dark?: boolean;
  responsive?: boolean;
  // Trigger element token props (remove custom className in stories)
  label?: string; // Trigger button text
  triggerBg?: string; // e.g. 'primary' / 'primary-dark'
  triggerTextColor?: string; // e.g. 'primary-text' / 'white'
  triggerRounded?: string; // e.g. 'rounded' / 'rounded-md' / 'rounded-full'
  size?: 'sm' | 'md' | 'lg'; // Controls padding / font size
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  disabled?: boolean;
  loading?: boolean;
  animate?: boolean; // Use entrance animation token
  open?: boolean; // Controlled: force show
  defaultOpen?: boolean; // Uncontrolled: initial show
  arrow?: boolean; // Show arrow
  triggerMode?: 'hover' | 'click'; // Interaction mode
}

/**
 * Tooltip component, all styles are controlled by tooltip tokens in tailwind.config.js
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      placement = 'top',
      multiline = false,
      dark = false,
      responsive = false,
      className = '',
      style,
      label,
      triggerRounded = 'rounded',
      size = 'md',
      variant = 'primary',
      disabled = false,
      loading = false,
      animate = true,
      open,
      defaultOpen = false,
      arrow = true,
      triggerMode = 'hover',
      ...props
    },
    ref,
  ) => {
    // Internal display state (use controlled if open is provided)
    const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
    const isOpen = open !== undefined ? open : internalOpen;

    const show = useCallback(() => {
      if (!disabled && !loading && open === undefined) setInternalOpen(true);
    }, [disabled, loading, open]);
    const hide = useCallback(() => {
      if (open === undefined) setInternalOpen(false);
    }, [open]);
    const toggle = useCallback(() => {
      if (open === undefined && !disabled && !loading) setInternalOpen((prev) => !prev);
    }, [open, disabled, loading]);

    // Combine token classes
    const classes = [
      'tooltip',
      multiline ? 'tooltip-multiline' : '',
      responsive ? 'w-full sm:w-auto' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Placement style (for demonstration, use popper.js or custom in real project)
    const placementStyle: React.CSSProperties =
      placement === 'top'
        ? { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 }
        : placement === 'bottom'
          ? { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 }
          : placement === 'left'
            ? { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 }
            : placement === 'right'
              ? { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 }
              : {};

    // Trigger button size token (utility only, keep token prefix)

    const triggerClasses = [
      'tooltip-trigger',
      `tooltip-trigger-${size}`,
      `tooltip-trigger-${variant}`,
      triggerRounded === 'rounded-full' ? 'tooltip-trigger-rounded' : '',
      disabled ? 'tooltip-trigger-disabled' : '',
      loading ? 'tooltip-trigger-loading' : '',
    ]
      .filter(Boolean)
      .join(' ');

    // Wrapper needs relative to support absolute positioning of tooltip
    return (
      <div className="relative inline-block">
        {label && (
          <button
            type="button"
            className={triggerClasses}
            aria-describedby={props.id || undefined}
            aria-disabled={disabled || undefined}
            aria-busy={loading || undefined}
            disabled={disabled}
            onMouseEnter={triggerMode === 'hover' ? show : undefined}
            onMouseLeave={triggerMode === 'hover' ? hide : undefined}
            onFocus={triggerMode === 'hover' ? show : undefined}
            onBlur={triggerMode === 'hover' ? hide : undefined}
            onClick={triggerMode === 'click' ? toggle : undefined}
            aria-expanded={triggerMode === 'click' ? isOpen : undefined}
          >
            <span className={loading ? 'opacity-0' : ''}>{label}</span>
            {loading && <span className="tooltip-spinner" aria-hidden="true" />}
          </button>
        )}
        {isOpen && (
          <div
            ref={ref}
            className={classes + (dark ? ' dark' : '') + (animate ? ' tooltip-animate' : '')}
            style={{ ...placementStyle, ...style }}
            role="tooltip"
            {...props}
          >
            {content}
            {arrow && (
              <span
                className={
                  'tooltip-arrow ' +
                  (placement === 'top'
                    ? 'tooltip-arrow-top'
                    : placement === 'bottom'
                      ? 'tooltip-arrow-bottom'
                      : placement === 'left'
                        ? 'tooltip-arrow-left'
                        : 'tooltip-arrow-right')
                }
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';
