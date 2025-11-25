import type { Meta, StoryObj } from '@storybook/react';
import { Radio, RadioProps } from './Radio';

const meta: Meta<RadioProps> = {
  title: 'Components/Radio',
  component: Radio,
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
        component: 'Industry-standard Radio component with a11y, color, size, and state variants.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<RadioProps>;

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
    color: 'danger',
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
