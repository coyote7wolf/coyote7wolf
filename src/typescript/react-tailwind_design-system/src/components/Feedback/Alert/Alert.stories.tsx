import * as React from 'react';
import { Alert, AlertProps } from './Alert';
import type { Meta, StoryObj } from '@storybook/react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import type { FC } from 'react';

const IconInfo = FaInfoCircle as unknown as FC<{ className?: string }>;
const IconSuccess = FaCheckCircle as unknown as FC<{ className?: string }>;
const IconWarning = FaExclamationTriangle as unknown as FC<{
  className?: string;
}>;
const IconError = FaTimesCircle as unknown as FC<{ className?: string }>;

const meta: Meta<AlertProps> = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    controls: { expanded: true },
    a11y: { disable: false },
  },
};
export default meta;
type Story = StoryObj<AlertProps>;

export const Info: Story = {
  args: {
    type: 'info',
    message: 'This is an info alert',
    description: 'More description...',
    showIcon: true,
    icon: <IconInfo className="text-info" />,
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Operation successful!',
    description: 'Your operation was completed successfully.',
    showIcon: true,
    icon: <IconSuccess className="text-success" />,
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'Warning!',
    description: 'Please be aware of potential risks.',
    showIcon: true,
    icon: <IconWarning className="text-warning" />,
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    message: 'An error occurred!',
    description: 'Please try again later.',
    showIcon: true,
    icon: <IconError className="text-danger" />,
  },
};

export const Closable: Story = {
  args: {
    type: 'info',
    message: 'Closable alert',
    closable: true,
    showIcon: true,
    icon: <IconInfo className="text-info" />,
  },
};

// --- All story exports moved below meta and icon declarations ---

export const Default: Story = {
  args: {
    type: 'info',
    message: 'This is a default alert',
    description: 'Default style, using design token.',
    showIcon: true,
    icon: <IconInfo className="text-info" />,
  },
  parameters: {
    docs: { description: { story: 'Default Alert using design token.' } },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4 rounded bg-neutral-100 animate-pulse w-full max-w-md">
      <div className="w-6 h-6 bg-neutral-300 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-neutral-300 rounded w-1/2 mb-2" />
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
      </div>
    </div>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'Alert in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  args: {
    type: 'info',
    message: 'Custom theme color alert',
    description: 'Custom color, token support required in component.',
    showIcon: true,
    icon: <IconInfo className="text-accent" />,
    // 若組件支援 className，請於 AlertProps 補上，否則請於外層包裝
  },
  parameters: {
    docs: {
      description: { story: 'Custom theme color Alert (token support required in component).' },
    },
  },
};

export const Large: Story = {
  args: {
    type: 'success',
    message: 'Large alert',
    description: 'Larger font size, text-lg support required in component.',
    showIcon: true,
    icon: <IconSuccess className="text-success text-2xl" />,
    // 若組件支援 className，請於 AlertProps 補上，否則請於外層包裝
  },
  parameters: {
    docs: { description: { story: 'Large Alert (text-lg support required in component).' } },
  },
};

export const Small: Story = {
  args: {
    type: 'warning',
    message: 'Small alert',
    description: 'Smaller font size, text-xs support required in component.',
    showIcon: true,
    icon: <IconWarning className="text-warning text-xs" />,
    // 若組件支援 className，請於 AlertProps 補上，否則請於外層包裝
  },
  parameters: {
    docs: { description: { story: 'Small Alert (text-xs support required in component).' } },
  },
};

export const Disabled: Story = {
  args: {
    type: 'info',
    message: 'Disabled alert',
    description: 'This alert is disabled.',
    showIcon: true,
    icon: <IconInfo className="text-muted" />,
    // 若組件支援 className/disabled prop，請於 AlertProps 補上，否則請於外層包裝
  },
  parameters: {
    docs: {
      description: { story: 'Disabled state Alert (disabled prop support required in component).' },
    },
  },
};

export const A11y: Story = {
  render: (args) => (
    <div role="alert">
      <Alert {...args} />
    </div>
  ),
  args: {
    type: 'info',
    message: 'A11y accessible alert',
    description: 'Accessibility feature test.',
    showIcon: true,
    icon: <IconInfo className="text-info" />,
    // 若組件支援 aria-label/role，請於 AlertProps 補上
  },
  parameters: {
    docs: {
      description: {
        story: 'Accessibility (A11y) Alert (aria/role prop support required in component).',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    type: 'info',
    message: 'Dark mode alert',
    description: 'Displayed on dark background.',
    showIcon: true,
    icon: <IconInfo className="text-info text-white" />, // 亮色icon
    // 若組件支援 className，請於 AlertProps 補上，否則請於外層包裝
    className: 'text-white', // 亮色文字
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Alert in dark mode.' } },
  },
};

export const RWD: Story = {
  args: {
    type: 'info',
    message: 'RWD responsive alert',
    description: 'Responsive display.',
    showIcon: true,
    icon: <IconInfo className="text-info" />,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive Alert.' } },
  },
};
