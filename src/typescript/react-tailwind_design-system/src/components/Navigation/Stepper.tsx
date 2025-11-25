import React from 'react';

export type StepperProps = {
  steps: string[];
  activeStep: number;
  status?: string;
  className?: string;
  onStepChange?: (step: number) => void;
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  status = '',
  className = '',
  onStepChange,
}) => {
  return (
    <nav className={className} aria-label="stepper">
      {steps.map((label, idx) => {
        const isActive = idx === activeStep;
        const isDisabled = status === 'disabled';
        const isSuccess = status === 'success';
        return (
          <button
            key={label}
            className={`px-3 py-2 rounded mx-1 border border-stepper-border dark:border-stepper-dark-border
              ${isActive ? 'bg-stepper-active text-stepper-active dark:bg-stepper-dark-active dark:text-stepper-dark-activeText font-bold ring-2 ring-stepper-active shadow-md' : 'bg-stepper-bg text-stepper-text dark:bg-stepper-dark-bg dark:text-stepper-dark-text'}
              ${isDisabled ? 'text-stepper-disabled dark:text-stepper-dark-disabled opacity-50 cursor-not-allowed' : 'hover:bg-stepper-hover dark:hover:bg-stepper-dark-hover'}
              ${isSuccess ? 'text-stepper-success dark:text-stepper-dark-success' : ''}
            `}
            aria-current={isActive ? 'step' : undefined}
            disabled={isDisabled}
            onClick={() => onStepChange && onStepChange(idx)}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
};

export default Stepper;
