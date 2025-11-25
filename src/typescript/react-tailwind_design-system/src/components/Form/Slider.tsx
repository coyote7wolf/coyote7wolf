import React from 'react';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  marks?: { [key: number]: string };
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange,
  disabled = false,
  marks,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        disabled={disabled}
        className="slider w-full"
      />
      {marks && (
        <div className="flex justify-between mt-2 text-xs text-neutral-400">
          {Object.entries(marks).map(([k, v]) => (
            <span key={k}>{v}</span>
          ))}
        </div>
      )}
    </div>
  );
};
