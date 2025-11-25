import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import WizardStepForm, { WizardStepFormProps } from './WizardStepForm';

const meta: Meta<WizardStepFormProps> = {
  title: 'Dashboard/Wizard StepForm',
  component: WizardStepForm,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Wizard StepForm, displays multi-step forms, step switching, and is responsive.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<WizardStepFormProps>;

export const Default: Story = {
  render: (args) => {
    const [currentStep, setCurrentStep] = useState(0);
    return <WizardStepForm {...args} currentStep={currentStep} onStepChange={setCurrentStep} />;
  },
  args: {
    steps: [
      { title: 'Basic Info', content: <div>Please enter basic info form content</div> },
      { title: 'Contact', content: <div>Please enter contact form content</div> },
      { title: 'Complete', content: <div>Form completed, thank you!</div> },
    ],
    currentStep: 0,
    responsive: true,
  },
  parameters: {
    docs: { description: { story: '預設 WizardStepForm，使用設計 token。' } },
  },
};

export const Skeleton: Story = {
  render: () => <div className="animate-pulse bg-neutral-200 rounded-lg p-6 w-full h-40" />,
  args: {
    steps: [
      { title: 'Loading...', content: <div className="h-6 bg-neutral-300 rounded w-1/2 mb-2" /> },
      { title: 'Loading...', content: <div className="h-6 bg-neutral-300 rounded w-1/3 mb-2" /> },
    ],
    currentStep: 0,
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'WizardStepForm in loading state (Skeleton style).' } },
  },
};

export const Error: Story = {
  render: () => (
    <div className="text-danger bg-danger/10 p-4 rounded">
      Form failed to load, please try again later.
    </div>
  ),
  args: {
    steps: [],
    currentStep: 0,
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'Error state (no data).' } },
  },
};

export const CustomColor: Story = {
  render: (args) => {
    const [currentStep, setCurrentStep] = useState(0);
    return (
      <div className="bg-accent/10 border border-accent rounded">
        <WizardStepForm {...args} currentStep={currentStep} onStepChange={setCurrentStep} />
      </div>
    );
  },
  args: {
    steps: [{ title: 'Custom Color', content: <div>Custom theme color step content</div> }],
    currentStep: 0,
    responsive: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom theme color WizardStepForm (requires token support in component).',
      },
    },
  },
};

export const Large: Story = {
  render: (args) => {
    const [currentStep, setCurrentStep] = useState(0);
    return (
      <div className="text-lg">
        <WizardStepForm {...args} currentStep={currentStep} onStepChange={setCurrentStep} />
      </div>
    );
  },
  args: {
    steps: [{ title: 'Large', content: <div>Large form content</div> }],
    currentStep: 0,
    responsive: true,
  },
  parameters: {
    docs: {
      description: { story: 'Large WizardStepForm (requires text-lg support in component).' },
    },
  },
};

export const Small: Story = {
  render: (args) => {
    const [currentStep, setCurrentStep] = useState(0);
    return (
      <div className="text-xs">
        <WizardStepForm {...args} currentStep={currentStep} onStepChange={setCurrentStep} />
      </div>
    );
  },
  args: {
    steps: [{ title: 'Small', content: <div>Small form content</div> }],
    currentStep: 0,
    responsive: true,
  },
  parameters: {
    docs: {
      description: { story: 'Small WizardStepForm (requires text-xs support in component).' },
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [currentStep, setCurrentStep] = useState(0);
    return (
      <div className="opacity-50 pointer-events-none">
        <WizardStepForm {...args} currentStep={currentStep} onStepChange={setCurrentStep} />
      </div>
    );
  },
  args: {
    steps: [{ title: 'Disabled', content: <div>This step is disabled</div> }],
    currentStep: 0,
    responsive: true,
    // If the component supports disabled prop, please add it to WizardStepFormProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state WizardStepForm (requires disabled prop support in component).',
      },
    },
  },
};

export const A11y: Story = {
  render: (args) => {
    const [currentStep, setCurrentStep] = useState(0);
    return (
      <div role="form" aria-label="Multi-step Form">
        <WizardStepForm {...args} currentStep={currentStep} onStepChange={setCurrentStep} />
      </div>
    );
  },
  args: {
    steps: [{ title: 'A11y', content: <div>Accessibility feature test</div> }],
    currentStep: 0,
    responsive: true,
    // If the component supports aria-label/role, please add it to WizardStepFormProps
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility (A11y) WizardStepForm (requires aria/role prop support in component).',
      },
    },
  },
};

export const DarkMode: Story = {
  render: (args) => {
    const [currentStep, setCurrentStep] = useState(0);
    return (
      <div className="text-mute bg-background">
        <WizardStepForm {...args} currentStep={currentStep} onStepChange={setCurrentStep} />
      </div>
    );
  },
  args: {
    ...Default.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'In dark mode, main text is .' } },
  },
};

export const Mobile: Story = {
  render: (args) => {
    const [currentStep, setCurrentStep] = useState(0);
    return (
      <div className="max-w-[375px] mx-auto border border-dashboard-border rounded-dashboard shadow-dashboard bg-dashboard-bg px-2 py-4">
        <WizardStepForm {...args} currentStep={currentStep} onStepChange={setCurrentStep} />
      </div>
    );
  },
  args: {
    ...Default.args,
    responsive: true,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'Displays WizardStepForm at mobile width.' } },
  },
};

export const RWD: Story = {
  render: (args) => {
    const [currentStep, setCurrentStep] = useState(0);
    return <WizardStepForm {...args} currentStep={currentStep} onStepChange={setCurrentStep} />;
  },
  args: {
    ...Default.args,
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'RWD responsive display of WizardStepForm.' } },
  },
};
