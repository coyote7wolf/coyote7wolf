import type { Meta, StoryObj } from '@storybook/react';
import { Filter, FilterProps } from './Filter';

const meta: Meta<FilterProps> = {
  title: 'Business/Filter',
  component: Filter,
  tags: ['autodocs'],
  argTypes: {
    options: { control: false },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    onChange: { action: 'onChange' },
  },
};
export default meta;

type Story = StoryObj<FilterProps>;

export const Default: Story = {
  args: {
    options: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
    ],
    placeholder: 'Filter...',
  },
  parameters: {
    docs: { description: { story: 'Default Filter using design tokens.' } },
  },
};

export const DarkMode: Story = {
  args: {
    options: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
    ],
    placeholder: 'Filter...',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Filter in dark mode.' } },
  },
};

export const Skeleton: Story = {
  args: {
    options: [
      { label: 'Loading...', value: 'loading' },
      { label: 'Loading...', value: 'loading2' },
      { label: 'Loading...', value: 'loading3' },
    ],
    placeholder: 'Loading...',
  },
  parameters: {
    docs: { description: { story: 'Filter in loading state (text-only Skeleton).' } },
  },
};

export const Error: Story = {
  args: {
    options: [],
    placeholder: 'Filter...',
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
    placeholder: 'Custom Color',
  },
  parameters: {
    docs: {
      description: { story: 'Custom theme color Filter (requires token support in component).' },
    },
  },
};

export const Large: Story = {
  args: {
    options: [
      { label: 'Large', value: 'large' },
      { label: 'Normal', value: 'normal' },
    ],
    placeholder: 'Large',
  },
  parameters: {
    docs: { description: { story: 'Large Filter (requires text-lg support in component).' } },
  },
};

export const Small: Story = {
  args: {
    options: [
      { label: 'Small', value: 'small' },
      { label: 'Normal', value: 'normal' },
    ],
    placeholder: 'Small',
  },
  parameters: {
    docs: { description: { story: 'Small Filter (requires text-xs support in component).' } },
  },
};

export const Disabled: Story = {
  args: {
    options: [
      { label: 'Disabled', value: 'disabled' },
      { label: 'Normal', value: 'normal' },
    ],
    placeholder: 'Disabled',
    // If the component supports disabled prop, please add it to FilterProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state Filter (requires disabled prop support in component).',
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
    placeholder: 'Accessibility',
    // If the component supports aria-label/role, please add it to FilterProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Accessibility (A11y) Filter (requires aria/role prop support in component).',
      },
    },
  },
};
