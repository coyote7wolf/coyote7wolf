import type { Meta, StoryObj } from '@storybook/react';
import { Badge, BadgeProps } from './Badge';

type Story = StoryObj<BadgeProps>;

const meta: Meta<BadgeProps> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
    },
    closable: { control: 'boolean' },
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Badge component supporting color, size, icon, closable, and variant.',
      },
    },
  },
};
export default meta;

export const LightMode: Story = {
  args: {
    children: 'Light Mode',
    className: 'bg-primary text-white rounded px-2',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'With Icon',
    className: 'bg-primary text-white rounded px-2 flex items-center gap-1',
    icon: '✓',
  },
};

export const Closable: Story = {
  args: {
    children: 'Closable',
    className: 'bg-primary text-white rounded px-2 cursor-pointer',
    closable: true,
  },
};

export const Responsive: Story = {
  args: {
    children: 'Responsive',
    className: 'w-full sm:w-auto bg-primary text-white rounded px-2',
  },
};

export const DarkMode: Story = {
  args: {
    children: 'Dark Mode',
    className: 'bg-primary text-white rounded px-2 dark:bg-primary dark:text-white',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    className: 'bg-primary text-white rounded px-2 opacity-50 cursor-not-allowed',
    tabIndex: -1,
    'aria-disabled': true,
  },
};

export const Size: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge className="bg-primary text-white rounded px-2 text-xs">XS</Badge>
      <Badge className="bg-primary text-white rounded px-2 text-sm">SM</Badge>
      <Badge className="bg-primary text-white rounded px-2 text-lg">LG</Badge>
    </div>
  ),
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    className: 'border border-primary text-primary bg-transparent rounded',
    variant: 'outline',
  },
};

export const Dot: Story = {
  render: () => <span className="bg-primary rounded-full w-2 h-2 inline-block" />,
};

export const Count: Story = {
  args: {
    children: '8',
    className: 'bg-primary text-white rounded-full px-2 py-0.5 text-xs',
  },
};

export const CustomColor: Story = {
  args: {
    children: 'Custom Color',
    className: 'bg-primary text-white rounded px-2',
  },
};

export const Pill: Story = {
  args: {
    children: 'Pill',
    className: 'bg-primary text-white rounded-full px-3 py-0.5',
  },
};

export const Animation: Story = {
  args: {
    children: 'Animation',
    className: 'bg-primary text-white rounded px-2 animate-pulse',
  },
};
