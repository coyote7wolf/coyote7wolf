import React from 'react';

export interface WizardStepFormProps {
  steps: Array<{
    title: string;
    content: React.ReactNode;
  }>;
  currentStep: number;
  onStepChange?: (step: number) => void;
  onSubmit?: () => void;
  responsive?: boolean;
}

const WizardStepForm: React.FC<WizardStepFormProps> = ({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  responsive = true,
}) => {
  return (
    <div className={responsive ? 'p-6 max-w-xl mx-auto space-y-6' : 'p-4'}>
      <div className="flex items-center mb-6">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div
              className={`flex items-center ${
                i === currentStep ? 'font-bold text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="rounded-full border w-8 h-8 flex items-center justify-center mr-2">
                {i + 1}
              </span>
              {step.title}
            </div>
            {i < steps.length - 1 && <span className="mx-2 text-gray-300">→</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="bg-white rounded shadow p-6">{steps[currentStep]?.content}</div>
      <div className="flex justify-between mt-4">
        <button
          className="btn"
          disabled={currentStep === 0}
          onClick={() => onStepChange && onStepChange(currentStep - 1)}
        >
          上一步
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => onStepChange && onStepChange(currentStep + 1)}
          >
            下一步
          </button>
        ) : (
          <button className="btn btn-success" onClick={onSubmit}>
            完成
          </button>
        )}
      </div>
    </div>
  );
};

export default WizardStepForm;
