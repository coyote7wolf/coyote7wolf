import React from 'react';

export type TabItem = {
  label: React.ReactNode;
  value: string;
};

export type TabsProps = {
  tabs?: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  closable?: boolean;
  vertical?: boolean;
  // Accepts additional props
  [key: string]: unknown;
};

export const Tabs: React.FC<TabsProps> = ({
  tabs = [],
  // value,
  onChange,
  className,
  disabled,
  closable,
  vertical,
  ...rest
}) => {
  // Tailwind token classes
  const baseTabClass = [
    'bg-navigationTabs-bg',
    'text-navigationTabs-text',
    'border-b',
    'border-navigationTabs-border',
    'transition-colors',
    'duration-200',
    'tab-active',
  ].join(' ');
  const disabledClass = 'text-navigationTabs-disabledText opacity-50 cursor-not-allowed';
  const verticalClass = vertical ? 'flex-col border-l border-navigationTabs-border' : '';

  return (
    <div
      className={`flex ${verticalClass} ${className || ''} bg-navigationTabs-bg border-navigationTabs-border`}
      {...rest}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          disabled={disabled}
          className={`${baseTabClass} ${disabled ? disabledClass : ''}`}
          onClick={() => !disabled && onChange && onChange(tab.value)}
        >
          {tab.label}
          {closable && (
            <span className="close-btn cursor-pointer ml-2 text-navigationTabs-activeText">×</span>
          )}
        </button>
      ))}
    </div>
  );
};
