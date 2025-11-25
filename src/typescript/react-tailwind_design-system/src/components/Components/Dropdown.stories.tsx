import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown, DropdownProps } from './Dropdown';

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3', disabled: true },
];

const optionGroups = [
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
];

const meta: Meta<DropdownProps> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Dropdown component supporting options, option groups, multi-select, disabled, and responsive.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<DropdownProps>;

export const LightMode: Story = {
  args: {
    options,
    className: 'bg-white border text-gray-900 rounded-md',
  },
};

export const DarkMode: Story = {
  args: {
    options,
    className: 'bg-gray-900 border text-mute rounded-md dark:bg-gray-900 dark:text-mute',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Disabled: Story = {
  args: {
    options,
    disabled: true,
    className: 'bg-gray-100 border text-gray-400 rounded-md opacity-50',
  },
};

export const Multiple: Story = {
  args: {
    options,
    multiple: true,
    className: 'bg-white border text-gray-900 rounded-md select-multiple',
  },
};

export const WithOptionGroup: Story = {
  args: {
    options: optionGroups,
    className: 'bg-white border text-gray-900 rounded-md',
  },
};

export const Focus: Story = {
  args: {
    options,
    className: 'focus:ring focus:outline-none',
  },
};

export const Responsive: Story = {
  args: {
    options,
    className: 'w-full sm:w-auto',
  },
};

export const Mobile: Story = {
  args: {
    options,
    className: 'max-w-[375px] mx-auto',
  },
};
