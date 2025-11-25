import React from 'react';

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  range?: boolean;
  format?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
  disabled = false,
  range = false,
  format = 'yyyy-MM-dd',
  className = '',
}) => {
  return (
    <div className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={format}
        className="border border-primary rounded-md px-3 py-2 w-full focus:ring focus:border-primary disabled:bg-neutral-100 disabled:text-disabled"
        aria-disabled={disabled}
      />
      {range && <div className="text-xs text-neutral-400 mt-1">Range 模式</div>}
    </div>
  );
};
