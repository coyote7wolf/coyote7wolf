import type { Meta, StoryObj } from '@storybook/react';
import { Toast, ToastProps } from './Toast';

const meta: Meta<ToastProps> = {
  title: 'Feedback/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    duration: { control: 'number' },
    closable: { control: 'boolean' },
    multiple: { control: 'boolean' },
    message: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Toast message component supporting type, duration, closable, and multiple props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<ToastProps>;

export const Default: Story = {
  args: {
    type: 'info',
    duration: 3000,
    closable: true,
    multiple: false,
    message: 'This is a Toast message',
  },
  parameters: {
    docs: { description: { story: 'Default Toast using design tokens.' } },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="rounded px-4 py-2 bg-skeleton animate-pulse w-64">
      <div className="h-4 bg-skeleton rounded w-2/3 mb-2" />
      <div className="h-3 bg-skeleton rounded w-1/2" />
    </div>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'Toast in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  args: {
    type: 'info',
    duration: 3000,
    closable: true,
    multiple: false,
    message: 'Custom Theme Toast',
    // If the component supports className, add it to ToastProps, otherwise wrap externally
  },
  render: (args) => (
    <div className="bg-accent/90 text-white rounded px-4 py-2">
      <Toast {...args} />
    </div>
  ),
  parameters: {
    docs: { description: { story: 'Custom theme Toast (requires token support in component).' } },
  },
};

export const Large: Story = {
  args: {
    type: 'success',
    duration: 3000,
    closable: true,
    multiple: false,
    message: 'Large Toast',
    // If the component supports className, add it to ToastProps, otherwise wrap externally
  },
  render: (args) => (
    <div className="text-lg">
      <Toast {...args} />
    </div>
  ),
  parameters: {
    docs: { description: { story: 'Large Toast (requires text-lg support in component).' } },
  },
};

export const Small: Story = {
  args: {
    type: 'warning',
    duration: 3000,
    closable: true,
    multiple: false,
    message: 'Small Toast',
    // If the component supports className, add it to ToastProps, otherwise wrap externally
  },
  render: (args) => (
    <div className="text-xs">
      <Toast {...args} />
    </div>
  ),
  parameters: {
    docs: { description: { story: 'Small Toast (requires text-xs support in component).' } },
  },
};

export const Disabled: Story = {
  args: {
    type: 'info',
    duration: 3000,
    closable: true,
    multiple: false,
    message: 'Disabled Toast',
    // If the component supports disabled prop, add it to ToastProps, otherwise wrap externally
  },
  render: (args) => (
    <div className="opacity-50 pointer-events-none">
      <Toast {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled Toast (requires disabled prop support in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    type: 'info',
    duration: 3000,
    closable: true,
    multiple: false,
    message: 'A11y Accessible Toast',
    // If the component supports aria-label/role, add it to ToastProps
  },
  render: (args) => (
    <div role="status">
      <Toast {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A11y (accessible) Toast (requires aria/role prop support in component).',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    type: 'info',
    duration: 3000,
    closable: true,
    multiple: false,
    message: 'Dark Mode Toast',
  },
  render: (args) => (
    <div className="dark bg-background-dark min-h-screen p-8">
      <div className="bg-info/90 text-white rounded px-4 py-2">
        <Toast {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Toast in dark mode.' } },
  },
};

export const RWD: Story = {
  args: {
    type: 'info',
    duration: 3000,
    closable: true,
    multiple: false,
    message: 'RWD Responsive Toast',
  },
  render: (args) => (
    <div className="p-2 w-full sm:w-64">
      <Toast {...args} />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive Toast.' } },
  },
};
