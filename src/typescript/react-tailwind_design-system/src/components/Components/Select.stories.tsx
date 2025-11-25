import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectProps } from './Select';

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3', disabled: true },
];

const meta: Meta<SelectProps> = {
  title: 'Components/Select',
  component: Select,
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
    disabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Select component supporting options, size, color, disabled, and multi-select.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<SelectProps>;

export const Default: Story = {
  args: {
    options,
    color: 'primary',
    size: 'md',
    disabled: false,
    multiple: false,
  },
};

export const Disabled: Story = {
  args: {
    options,
    disabled: true,
  },
};

export const Multiple: Story = {
  args: {
    options,
    multiple: true,
  },
};

export const LightMode: Story = {
  args: {
    options,
    color: 'primary',
    size: 'md',
    disabled: false,
  },
};

export const DarkMode: Story = {
  args: {
    options,
    color: 'primary',
    size: 'md',
    disabled: false,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const WithOptionGroup: Story = {
  args: {
    options: [
      {
        label: 'Group 1',
        options: [
          { label: 'A', value: 'A' },
          { label: 'B', value: 'B' },
        ],
      },
      {
        label: 'Group 2',
        options: [
          { label: 'C', value: 'C' },
          { label: 'D', value: 'D' },
        ],
      },
    ],
  },
};

export const Focus: Story = {
  args: {
    options,
  },
};

export const Responsive: Story = {
  args: {
    options,
  },
};

export const Mobile: Story = {
  args: {
    options,
  },
};
