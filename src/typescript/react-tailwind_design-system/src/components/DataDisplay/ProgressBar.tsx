import React from 'react';

export type ProgressBarProps = {
  value?: number;
  max?: number;
  label?: string;
  percentage?: boolean;
  size?: 'small' | 'large' | 'default';
  color?: 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'gradient';
  striped?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  steps?: number;
  icon?: React.ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'info';
  animation?: boolean;
  responsive?: boolean;
  mobile?: boolean;
  circular?: boolean;
  a11yLabel?: string;
  className?: string;
};

const getBarColor = (color: ProgressBarProps['color'], status: ProgressBarProps['status']) => {
  if (color === 'gradient') return 'bg-gradient-to-r from-primary to-secondary';
  if (status === 'success') return 'bg-success';
  if (status === 'warning') return 'bg-warning';
  if (status === 'danger') return 'bg-danger';
  switch (color) {
    case 'success':
      return 'bg-success';
    case 'warning':
      return 'bg-warning';
    case 'danger':
      return 'bg-danger';
    case 'primary':
      return 'bg-primary';
    default:
      return 'bg-primary'; // Always fallback to a strong color
  }
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  label,
  percentage,
  size = 'default',
  color = 'default',
  striped,
  indeterminate,
  disabled,
  steps,
  icon,
  status,
  animation,
  responsive,
  mobile,
  circular,
  a11yLabel,
  className,
}) => {
  if (circular) {
    // Circular progress bar
    return (
      <div
        className={`w-16 h-16 rounded-full border-4 border-gray-200 border-t-primary animate-spin ${className || ''}`}
        aria-label={a11yLabel}
        role="progressbar"
      />
    );
  }

  let height = 'h-2';
  if (size === 'small') height = 'h-1';
  if (size === 'large') height = 'h-4';

  let barColor = getBarColor(color, status);
  let bgColor = 'bg-neutral-200';
  if (disabled) bgColor = 'bg-neutral-100';

  let barClass = `${barColor} border border-primary`;
  if (striped) barClass += ' bg-stripes';
  if (indeterminate) barClass += ' animate-pulse';
  if (animation) barClass += ' animate-pulse';
  if (disabled) barClass += ' opacity-50 cursor-not-allowed';
  if (responsive) height += ' sm:h-4';
  if (mobile) barClass += ' max-w-[375px] mx-auto';

  // Steps variant
  if (steps && steps > 1) {
    const stepWidth = 100 / steps;
    return (
      <div
        className={`w-full ${height} ${bgColor} rounded-full flex overflow-hidden ${className || ''}`}
        aria-label={a11yLabel}
        role="progressbar"
      >
        {[...Array(steps)].map((_, i) => (
          <div
            key={i}
            className={`${barColor} ${i < Math.round((value / max) * steps) ? '' : 'opacity-30'} flex-1`}
            style={{ width: `${stepWidth}%` }}
          />
        ))}
      </div>
    );
  }

  // Regular progress bar
  return (
    <div
      className={`w-full ${height} ${bgColor} rounded-full overflow-hidden ${className || ''}`}
      aria-label={a11yLabel}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className={barClass} style={{ width: `${Math.min((value / max) * 100, 100)}%` }}>
        {icon && <span className="inline-block ml-2">{icon}</span>}
      </div>
      {label && <span className="text-sm text-neutral-600 mt-1 block">{label}</span>}
      {percentage && (
        <span className="text-sm text-neutral-600 mt-1 block">
          {Math.round((value / max) * 100)}%
        </span>
      )}
    </div>
  );
};
