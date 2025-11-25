import type { Meta, StoryObj } from '@storybook/react';
import { Switch, SwitchProps } from './Switch';

const meta: Meta<SwitchProps> = {
  title: 'Components/Switch',
  component: Switch,
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
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Switch component supporting a11y, color, size, and state switching.',
      },
    },
  },
};
export default meta;

export const ThemeContrast: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <div className="mb-2 font-bold">Light Theme</div>
        <div className="flex items-center gap-8 bg-[#f8fafc] p-6 rounded">
          <div className="flex flex-col items-center gap-2">
            <Switch checked={false} size="md" />
            <span className="text-xs">Unchecked</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Switch checked size="md" />
            <span className="text-xs">Checked</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Switch checked disabled size="md" />
            <span className="text-xs text-gray-400">Disabled</span>
          </div>
        </div>
      </div>
      <div>
        <div className="mb-2 font-bold">Dark Theme</div>
        <div className="flex items-center gap-8 bg-[#10172a] p-6 rounded">
          <div className="flex flex-col items-center gap-2">
            <Switch checked={false} size="md" className="dark" />
            <span className="text-xs text-gray-200">Unchecked</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Switch checked size="md" className="dark" />
            <span className="text-xs text-gray-200">Checked</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Switch checked disabled size="md" className="dark" />
            <span className="text-xs text-gray-500">Disabled</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'light' },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8 bg-[#f8fafc] p-6 rounded">
      <div className="flex flex-col items-center gap-2">
        <Switch checked size="sm" />
        <span className="text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch checked size="md" />
        <span className="text-xs">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch checked size="lg" />
        <span className="text-xs">Large</span>
      </div>
    </div>
  ),
};

type Story = StoryObj<SwitchProps>;

export const Default: Story = {
  args: {
    checked: false,
    color: 'primary',
    size: 'md',
    disabled: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    color: 'primary',
    size: 'md',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    checked: false,
    color: 'error',
    size: 'md',
  },
};

export const LightMode: Story = {
  args: {
    checked: false,
    color: 'primary',
    size: 'md',
    disabled: false,
    className: 'accent-primary border rounded bg-white',
  },
};

export const DarkMode: Story = {
  args: {
    checked: false,
    color: 'primary',
    size: 'md',
    disabled: false,
    className: 'accent-primary border rounded bg-gray-900 dark:bg-gray-900',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Focus: Story = {
  args: {
    checked: false,
    color: 'primary',
    size: 'md',
    disabled: false,
    className: 'focus:ring focus:outline-none',
  },
};

export const Responsive: Story = {
  args: {
    checked: false,
    color: 'primary',
    size: 'md',
    disabled: false,
    className: 'w-full sm:w-auto',
  },
};

export const Mobile: Story = {
  args: {
    checked: false,
    color: 'primary',
    size: 'md',
    disabled: false,
    className: 'max-w-[375px] mx-auto',
  },
};
