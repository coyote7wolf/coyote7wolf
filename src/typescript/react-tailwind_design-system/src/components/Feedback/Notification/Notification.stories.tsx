import type { Meta, StoryObj } from '@storybook/react';
import { Notification, NotificationProps } from './Notification';

const meta: Meta<NotificationProps> = {
  title: 'Feedback/Notification',
  component: Notification,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    title: { control: 'text' },
    description: { control: 'text' },
    action: { control: false },
    onClose: { action: 'closed' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Notification component supporting type, title, description, and action props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<NotificationProps>;

export const Default: Story = {
  args: {
    type: 'info',
    title: 'Notification Title',
    description: 'This is the notification description.',
  },
  parameters: {
    docs: { description: { story: 'Default Notification using design tokens.' } },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="rounded px-4 py-3 shadow-md bg-skeleton animate-pulse w-96">
      <div className="h-5 bg-skeleton rounded w-1/3 mb-2" />
      <div className="h-3 bg-skeleton rounded w-2/3" />
    </div>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'Notification in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  args: {
    type: 'info',
    title: 'Custom Theme Notification',
    description: 'Custom color, requires token support in component.',
    // If the component supports className, add it to NotificationProps, otherwise wrap externally
  },
  render: (args) => (
    <div className="bg-accent/90 text-white rounded px-4 py-3 shadow-md">
      <Notification {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom theme Notification (requires token support in component).',
      },
    },
  },
};

export const Large: Story = {
  args: {
    type: 'success',
    title: 'Large Notification',
    description: 'Larger text, requires text-lg support in component.',
    // If the component supports className, add it to NotificationProps, otherwise wrap externally
  },
  render: (args) => (
    <div className="text-lg">
      <Notification {...args} />
    </div>
  ),
  parameters: {
    docs: { description: { story: 'Large Notification (requires text-lg support in component).' } },
  },
};

export const Small: Story = {
  args: {
    type: 'warning',
    title: 'Small Notification',
    description: 'Smaller text, requires text-xs support in component.',
    // If the component supports className, add it to NotificationProps, otherwise wrap externally
  },
  render: (args) => (
    <div className="text-xs">
      <Notification {...args} />
    </div>
  ),
  parameters: {
    docs: { description: { story: 'Small Notification (requires text-xs support in component).' } },
  },
};

export const Disabled: Story = {
  args: {
    type: 'info',
    title: 'Disabled Notification',
    description: 'This notification is disabled.',
    // If the component supports disabled prop, add it to NotificationProps, otherwise wrap externally
  },
  render: (args) => (
    <div className="opacity-50 pointer-events-none">
      <Notification {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled Notification (requires disabled prop support in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    type: 'info',
    title: 'A11y Accessible Notification',
    description: 'Accessibility test.',
    // If the component supports aria-label/role, add it to NotificationProps
  },
  render: (args) => (
    <div role="status">
      <Notification {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A11y (accessible) Notification (requires aria/role prop support in component).',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    type: 'info',
    title: 'Dark Mode Notification',
    description: 'Displayed on dark background.',
  },
  render: (args) => (
    <div className="dark bg-background-dark min-h-screen p-8">
      <div className="bg-info/90 text-white rounded px-4 py-3 shadow-md">
        <Notification {...args} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Notification in dark mode.' } },
  },
};

export const RWD: Story = {
  args: {
    type: 'info',
    title: 'RWD Responsive Notification',
    description: 'Responsive display.',
  },
  render: (args) => (
    <div className="p-2 w-full sm:w-96">
      <Notification {...args} />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive Notification.' } },
  },
};
