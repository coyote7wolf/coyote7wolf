import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker, DatePickerProps } from './DatePicker';

const meta: Meta<DatePickerProps> = {
  title: 'Form/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    range: { control: 'boolean' },
    format: { control: 'text' },
    className: { control: 'text' },
    onChange: { action: 'onChange' },
  },
  parameters: {
    docs: {
      description: {
        component: 'DatePicker component supporting value, disabled, range, and format props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<DatePickerProps>;

export const Default: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? '');
    return <DatePicker {...args} value={val} onChange={setVal} />;
  },
  args: {
    value: '2025-10-30',
    disabled: false,
    range: false,
    format: 'yyyy-MM-dd',
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-60">
      <div className="h-10 bg-skeleton rounded animate-pulse" />
    </div>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'DatePicker in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? '');
    return (
      <DatePicker
        {...args}
        value={val}
        onChange={setVal}
        className="border-accent text-accent focus:border-accent focus:ring-accent"
      />
    );
  },
  args: {
    value: '2025-10-30',
    disabled: false,
    range: false,
    format: 'yyyy-MM-dd',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom theme DatePicker (requires token support in component).',
      },
    },
  },
};

export const Range: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? '');
    return <DatePicker {...args} value={val} onChange={setVal} range />;
  },
  args: {
    value: '2025-10-30',
    disabled: false,
    range: true,
    format: 'yyyy-MM-dd',
  },
  parameters: {
    docs: { description: { story: 'Range mode DatePicker.' } },
  },
};

export const Format: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? '');
    return <DatePicker {...args} value={val} onChange={setVal} format="MM/dd/yyyy" />;
  },
  args: {
    value: '10/30/2025',
    disabled: false,
    range: false,
    format: 'MM/dd/yyyy',
  },
  parameters: {
    docs: { description: { story: 'Custom format DatePicker.' } },
  },
};

export const Disabled: Story = {
  args: {
    value: '2025-10-30',
    disabled: true,
    range: false,
    format: 'yyyy-MM-dd',
  },
  parameters: {
    docs: { description: { story: 'Disabled DatePicker.' } },
  },
};

export const A11y: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? '');
    return (
      <DatePicker
        {...args}
        value={val}
        onChange={setVal}
        className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        aria-label="Select date"
      />
    );
  },
  args: {
    value: '2025-10-30',
    disabled: false,
    range: false,
    format: 'yyyy-MM-dd',
  },
  parameters: {
    docs: { description: { story: 'A11y (accessible) DatePicker.' } },
  },
};

export const DarkMode: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? '');
    return (
      <div className="dark bg-neutral-900 p-4">
        <DatePicker
          {...args}
          value={val}
          onChange={setVal}
          className="bg-neutral-800 text-mute border-neutral-700 focus:border-primary"
        />
      </div>
    );
  },
  args: {
    value: '2025-10-30',
    disabled: false,
    range: false,
    format: 'yyyy-MM-dd',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'DatePicker in dark mode.' } },
  },
};

export const RWD: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? '');
    return (
      <div className="w-full max-w-xs sm:max-w-md">
        <DatePicker {...args} value={val} onChange={setVal} className="w-full" />
      </div>
    );
  },
  args: {
    value: '2025-10-30',
    disabled: false,
    range: false,
    format: 'yyyy-MM-dd',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive DatePicker.' } },
  },
};
