import React, { forwardRef, HTMLAttributes } from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'muted';
export type SpinnerSpeed = 'slow' | 'normal' | 'fast';
export type SpinnerThickness = 'thin' | 'normal' | 'thick';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Base size token */
  size?: SpinnerSize;
  /** Semantic color variant */
  variant?: SpinnerVariant;
  /** Animation speed token */
  speed?: SpinnerSpeed;
  /** Border thickness token */
  thickness?: SpinnerThickness;
  /** Accessible label (screen readers). */
  label?: string;
  /** Show visual label next to spinner (common in buttons or loaders). */
  showLabel?: boolean;
  /** Overlay style (centered mask). */
  overlay?: boolean;
  /** Enable responsive preset: sm breakpoint upsizes spinner (sm -> md). */
  responsive?: boolean;
}

// Contract:
// Inputs: token props (size, variant, speed, thickness, overlay, responsive)
// Output: <span role="status" aria-busy="true"> spinner element (optionally with label or overlay wrapper)
// Error Modes: none (defensive defaults). Missing tokens fallback to md size / primary variant / normal thickness / normal speed.
// Accessibility: role="status" + aria-live polite + aria-label when provided. Visual label optional.

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  {
    size = 'md',
    variant = 'primary',
    speed = 'normal',
    thickness = 'normal',
    label = 'Loading…',
    showLabel = false,
    overlay = false,
    responsive = false,
    ...rest
  },
  ref,
) {
  const sizeClass = `spinner-${size}`; // base size token
  const variantClass = `spinner-${variant}`;
  const speedClass = `spinner-speed-${speed}`;
  const thicknessClass = `spinner-thickness-${thickness}`;
  // Responsive preset: sm breakpoint shifts to md (industry common pattern)
  const responsiveClass = responsive ? 'spinner-sm sm:spinner-md' : '';

  const classes = ['spinner', sizeClass, variantClass, speedClass, thicknessClass, responsiveClass]
    .filter(Boolean)
    .join(' ');

  const spinnerEl = (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={classes}
      {...rest}
    />
  );

  const labeled = showLabel ? (
    <div className="flex items-center gap-2">
      {spinnerEl}
      <span>{label}</span>
    </div>
  ) : (
    spinnerEl
  );

  if (overlay) {
    return <div className="spinner-overlay">{labeled}</div>;
  }
  return labeled;
});

export default Spinner;
