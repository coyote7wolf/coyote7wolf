import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox, CheckboxProps } from './Checkbox';

const meta: Meta<CheckboxProps> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Checkbox component supporting a11y, color, size, and state variants.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<CheckboxProps>;

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

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    color: 'secondary',
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

export const DarkMode: Story = {
  args: {
    checked: false,
    color: 'primary',
    size: 'md',
    disabled: false,
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
    style: { boxShadow: '0 0 0 2px #2563eb' }, // Tailwind focus:ring-primary
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

export const Docs: Story = {
  render: (args) => <Checkbox {...args} />,
  args: {
    checked: false,
    color: 'primary',
    size: 'md',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Checkbox component using only Tailwind config tokens. Covers all states, variants, and a11y.',
      },
    },
  },
};
