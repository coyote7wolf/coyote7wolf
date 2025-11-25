import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterProps {
  options: FilterOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const Filter: React.FC<FilterProps> = ({
  options,
  value = '',
  onChange,
  placeholder = 'Filter...',
}) => {
  return (
    <select
      className="p-2 border rounded"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label="Filter"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default Filter;
