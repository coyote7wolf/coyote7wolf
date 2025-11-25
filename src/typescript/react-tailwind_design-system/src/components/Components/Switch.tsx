import * as React from 'react';
import type { InputHTMLAttributes } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  a11yLabel?: string;
}

const sizeMap = {
  sm: {
    track: 'w-9 h-5',
    knob: 'w-4 h-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    knob: 'w-5 h-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-8',
    knob: 'w-7 h-7',
    translate: 'translate-x-[26px]', // 6.5*4px = 26px
  },
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    { checked = false, disabled = false, size = 'md', a11yLabel, className = '', ...props },
    ref,
  ) => {
    // 使用 tailwind.config.js 的 switch token
    const trackBase = 'transition-colors duration-200 rounded-full';
    const knobBase = 'transition-transform duration-200 rounded-full shadow';
    const sizeConf = sizeMap[size] || sizeMap.md;

    // 依據狀態組合 token class
    const trackClass = [
      trackBase,
      sizeConf.track,
      'bg-switch-track',
      'border',
      'border-switch-border',
      checked ? 'bg-switch-trackActive border-switch-trackActive' : '',
      disabled ? 'bg-switch-disabled border-switch-disabled' : '',
      'dark:bg-switch-dark-track',
      'dark:border-switch-dark-border',
      checked ? 'dark:bg-switch-dark-trackActive dark:border-switch-dark-trackActive' : '',
      disabled ? 'dark:bg-switch-dark-disabled dark:border-switch-dark-disabled' : '',
      'focus:ring focus:outline-none',
    ]
      .filter(Boolean)
      .join(' ');

    const knobClass = [
      knobBase,
      sizeConf.knob,
      'bg-switch-thumb',
      checked ? 'bg-switch-thumbActive' : '',
      disabled ? 'bg-switch-disabled' : '',
      'dark:bg-switch-dark-thumb',
      checked ? 'dark:bg-switch-dark-thumbActive' : '',
      disabled ? 'dark:bg-switch-dark-disabled' : '',
      'transform',
      checked ? sizeConf.translate : 'translate-x-0',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label
        className={`inline-flex items-center cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <input
          type="checkbox"
          role="switch"
          ref={ref}
          aria-label={a11yLabel}
          checked={checked}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className={trackClass}>
          <div className={knobClass} style={{ marginTop: '2px', marginLeft: '2px' }} />
        </div>
      </label>
    );
  },
);
Switch.displayName = 'Switch';
