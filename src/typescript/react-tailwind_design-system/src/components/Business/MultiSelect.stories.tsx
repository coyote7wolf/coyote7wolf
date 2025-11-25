import type { Meta, StoryObj } from '@storybook/react';
import { MultiSelect, MultiSelectProps } from './MultiSelect';

const meta: Meta<MultiSelectProps> = {
  title: 'Business/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  argTypes: {
    options: { control: false },
    value: { control: false },
    placeholder: { control: 'text' },
    onChange: { action: 'onChange' },
  },
};
export default meta;

type Story = StoryObj<MultiSelectProps>;

export const Default: Story = {
  args: {
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' },
      { label: 'Date', value: 'date' },
    ],
    value: ['apple', 'banana'],
    placeholder: 'Multi-select...',
  },
  parameters: {
    docs: { description: { story: 'Default MultiSelect using design token.' } },
  },
};

export const DarkMode: Story = {
  args: {
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' },
      { label: 'Date', value: 'date' },
    ],
    value: ['cherry'],
    placeholder: 'Multi-select...',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'MultiSelect in dark mode.' } },
  },
};

export const Skeleton: Story = {
  args: {
    options: [
      { label: 'Loading...', value: 'loading1' },
      { label: 'Loading...', value: 'loading2' },
      { label: 'Loading...', value: 'loading3' },
    ],
    value: [],
    placeholder: 'Loading...',
  },
  parameters: {
    docs: { description: { story: 'MultiSelect in loading state (text skeleton only).' } },
  },
};

export const Error: Story = {
  args: {
    options: [],
    value: [],
    placeholder: 'Multi-select...',
  },
  parameters: {
    docs: { description: { story: 'Error state (no options available).' } },
  },
};

export const CustomColor: Story = {
  args: {
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Green', value: 'green' },
      { label: 'Blue', value: 'blue' },
    ],
    value: ['red', 'blue'],
    placeholder: 'Custom color',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom theme color MultiSelect (token support required in component).',
      },
    },
  },
};

export const Large: Story = {
  args: {
    options: [
      { label: 'Large', value: 'large' },
      { label: 'Normal', value: 'normal' },
    ],
    value: ['large'],
    placeholder: 'Large',
  },
  parameters: {
    docs: { description: { story: 'Large MultiSelect (text-lg support required in component).' } },
  },
};

export const Small: Story = {
  args: {
    options: [
      { label: 'Small', value: 'small' },
      { label: 'Normal', value: 'normal' },
    ],
    value: ['small'],
    placeholder: 'Small',
  },
  parameters: {
    docs: { description: { story: 'Small MultiSelect (text-xs support required in component).' } },
  },
};

export const Disabled: Story = {
  args: {
    options: [
      { label: 'Disabled', value: 'disabled' },
      { label: 'Normal', value: 'normal' },
    ],
    value: [],
    placeholder: 'Disabled',
    // If the component supports the disabled prop, please add it to MultiSelectProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state MultiSelect (disabled prop support required in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    options: [
      { label: 'Accessibility', value: 'a11y' },
      { label: 'Normal', value: 'normal' },
    ],
    value: ['a11y'],
    placeholder: 'Accessibility',
    // If the component supports aria-label/role, please add it to MultiSelectProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Accessibility (A11y) MultiSelect (aria/role prop support required in component).',
      },
    },
  },
};
