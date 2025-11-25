import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ProgressBar, ProgressBarProps } from './ProgressBar';

const meta: Meta<ProgressBarProps> = {
  title: 'Data Display/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: false },
    value: { control: 'number', description: 'Current progress value' },
    max: { control: 'number', description: 'Maximum value' },
    label: { control: 'text', description: 'Label text' },
    percentage: { control: 'boolean', description: 'Show percentage' },
    size: { control: 'select', options: ['small', 'large', 'default'] },
    color: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'primary', 'gradient'],
    },
    striped: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    steps: { control: 'number' },
    status: { control: 'select', options: ['success', 'warning', 'danger', 'info'] },
    animation: { control: 'boolean' },
    responsive: { control: 'boolean' },
    mobile: { control: 'boolean' },
    circular: { control: 'boolean' },
    a11yLabel: { control: 'text' },
    className: { control: 'text' },
  },
  args: {
    value: 40,
    max: 100,
  },
};
export default meta;

type Story = StoryObj<ProgressBarProps>;

export const Default: Story = {
  args: {
    value: 40,
  },
};

export const LightMode: Story = {
  args: {
    value: 60,
    color: 'primary',
  },
};

export const DarkMode: Story = {
  args: {
    value: 70,
    color: 'primary',
  },
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-4">
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    value: 50,
    disabled: true,
  },
};

export const WithLabel: Story = {
  args: {
    value: 80,
    label: 'Uploading...',
  },
};

export const WithPercentage: Story = {
  args: {
    value: 75,
    percentage: true,
  },
};

export const SizeLarge: Story = {
  args: {
    value: 90,
    size: 'large',
  },
};

export const ColorSuccess: Story = {
  args: {
    value: 100,
    color: 'success',
  },
};

export const ColorWarning: Story = {
  args: {
    value: 50,
    color: 'warning',
  },
};

export const ColorDanger: Story = {
  args: {
    value: 20,
    color: 'danger',
  },
};

export const Striped: Story = {
  args: {
    value: 60,
    striped: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const Status: Story = {
  args: {
    value: 80,
    status: 'success',
  },
};

export const Animation: Story = {
  args: {
    value: 40,
    animation: true,
  },
};

export const Responsive: Story = {
  args: {
    value: 60,
    responsive: true,
  },
};

export const Mobile: Story = {
  args: {
    value: 60,
    mobile: true,
  },
};

export const Circular: Story = {
  args: {
    circular: true,
  },
};

export const Steps: Story = {
  args: {
    value: 60,
    steps: 5,
  },
};

export const WithIcon: Story = {
  args: {
    value: 70,
    icon: <span>🚀</span>,
  },
};

export const Gradient: Story = {
  args: {
    value: 80,
    color: 'gradient',
  },
};

export const A11y: Story = {
  args: {
    value: 50,
    a11yLabel: 'Loading progress',
  },
};

// --- Added industry-standard stories for ProgressBar ---
export const Skeleton: Story = {
  args: {
    value: 0,
    max: 100,
    className: 'bg-skeleton',
    // Simulate skeleton loading state
    label: 'Loading...',
  },
};

export const Error: Story = {
  args: {
    value: 10,
    color: 'danger',
    status: 'danger',
    label: 'Error',
  },
};

export const CustomColor: Story = {
  args: {
    value: 55,
    color: 'primary',
    className: 'bg-progressbar-fill text-progressbar-label',
  },
};

export const LargeData: Story = {
  args: {
    value: 9999,
    max: 10000,
    label: 'Large Data',
    percentage: true,
  },
};

export const WithFooter: Story = {
  args: {
    value: 80,
    label: 'Uploading... (footer)',
    className: 'mb-4',
  },
  render: (args: ProgressBarProps) => (
    <>
      <ProgressBar {...args} />
      <div className="text-xs text-muted mt-1">Footer: Progress details</div>
    </>
  ),
};

export const Focus: Story = {
  args: {
    value: 40,
    className: 'focus:ring focus:outline-none',
  },
};

export const Hover: Story = {
  args: {
    value: 40,
    className: 'hover:bg-progressbar-fill',
  },
};

export const A11yDark: Story = {
  args: {
    value: 50,
    a11yLabel: 'Loading progress',
    color: 'primary',
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background-dark p-4">
        <Story />
      </div>
    ),
  ],
};
