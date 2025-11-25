import type { Meta, StoryObj } from '@storybook/react';
import { Stepper, StepperProps } from './Stepper';

const meta: Meta<StepperProps> = {
  title: 'Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    steps: { control: { type: 'object' }, description: 'Step labels' },
    activeStep: { control: 'number', description: 'Current active step' },
    status: { control: 'text', description: 'Status color token' },
    className: { control: 'text' },
    onStepChange: { action: 'stepChange' },
  },
  args: {
    steps: ['Step 1', 'Step 2', 'Step 3'],
    activeStep: 1,
    className: 'flex items-center step-active',
    status: '',
    onStepChange: () => {},
  },
};
export default meta;

type Story = StoryObj<StepperProps>;

export const Default: Story = {};

export const Status: Story = {
  args: {
    className: 'flex items-center step-active text-success', // uses token
    activeStep: 2,
  },
};

// --- Added industry-standard stories for Stepper ---
export const Skeleton: Story = {
  args: {
    className: 'flex items-center step-active',
    steps: ['Step 1', 'Step 2', 'Step 3'],
    activeStep: 0,
    status: '',
    // Simulate skeleton loading state by overlay or prop if supported
  },
};

export const Loading: Story = {
  args: {
    className: 'flex items-center step-active',
    steps: ['Step 1', 'Step 2', 'Step 3'],
    activeStep: 1,
    status: '',
    // Simulate loading state by overlay/spinner if supported
  },
};

export const DarkMode: Story = {
  args: {
    className: 'flex items-center step-active bg-background-dark text-text-dark',
    steps: ['Step 1', 'Step 2', 'Step 3'],
    activeStep: 1,
    status: '',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Error: Story = {
  args: {
    className: 'flex items-center step-active text-danger',
    steps: ['Step 1', 'Step 2', 'Step 3'],
    activeStep: 2,
    status: 'error',
  },
};

export const WithNavBar: Story = {
  args: {
    className: 'flex items-center step-active',
    steps: ['Login', 'Shipping', 'Payment', 'Review'],
    activeStep: 1,
    status: '',
  },
};

export const WithDescription: Story = {
  args: {
    className: 'flex items-center step-active',
    steps: ['Step 1: Info', 'Step 2: Details', 'Step 3: Confirm'],
    activeStep: 0,
    status: '',
  },
};

export const Disabled: Story = {
  args: {
    className: 'flex items-center step-active text-disabled opacity-50', // replaced gray-400 with token
  },
};

export const Responsive: Story = {
  args: {
    className: 'flex flex-col sm:flex-row items-center step-active',
    steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
    activeStep: 2,
  },
};
