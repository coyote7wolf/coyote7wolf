import React from 'react';

export interface InputGroupProps {
  size?: 'sm' | 'md' | 'lg';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  size = 'md',
  prefix,
  suffix,
  disabled = false,
  children,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center border border-primary rounded-md px-3 py-2 ${
        size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : ''
      } ${disabled ? 'bg-neutral-100 opacity-60' : ''} ${className}`}
    >
      {prefix && <span className="mr-2 text-neutral-400">{prefix}</span>}
      {children}
      {suffix && <span className="ml-2 text-neutral-400">{suffix}</span>}
    </div>
  );
};
