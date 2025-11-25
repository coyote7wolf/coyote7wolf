import { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Slider, SliderProps } from './Slider';

const meta: Meta<SliderProps> = {
  title: 'Form/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    value: { control: 'number' },
    disabled: { control: 'boolean' },
    marks: { control: false },
    className: { control: 'text' },
    onChange: { action: 'onChange' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Slider component supporting min, max, step, value, disabled, and marks props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<SliderProps>;

export const Default: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? 0);
    return <Slider {...args} value={val} onChange={setVal} />;
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 50,
    marks: { 0: '0', 50: '50', 100: '100' },
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 30,
    marks: { 0: '0', 50: '50', 100: '100' },
    disabled: true,
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-60">
      <div className="h-2 bg-skeleton animate-pulse rounded-full" />
    </div>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'Slider in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? 0);
    return (
      <Slider
        {...args}
        value={val}
        onChange={setVal}
        className="[&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-accent"
      />
    );
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 70,
    marks: { 0: '0', 50: '50', 100: '100' },
    disabled: false,
  },
  parameters: {
    docs: { description: { story: 'Custom theme Slider (requires token support in component).' } },
  },
};

export const Large: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? 0);
    return (
      <Slider
        {...args}
        value={val}
        onChange={setVal}
        className="h-3 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6"
      />
    );
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 80,
    marks: { 0: '0', 50: '50', 100: '100' },
    disabled: false,
  },
  parameters: {
    docs: { description: { story: 'Large Slider.' } },
  },
};

export const Small: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? 0);
    return (
      <Slider
        {...args}
        value={val}
        onChange={setVal}
        className="h-1 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3"
      />
    );
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 20,
    marks: { 0: '0', 50: '50', 100: '100' },
    disabled: false,
  },
  parameters: {
    docs: { description: { story: 'Small Slider.' } },
  },
};

export const A11y: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? 0);
    return <Slider {...args} value={val} onChange={setVal} aria-label="Value selection slider" />;
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 40,
    marks: { 0: '0', 50: '50', 100: '100' },
    disabled: false,
  },
  parameters: {
    docs: { description: { story: 'A11y (accessible) Slider.' } },
  },
};

export const DarkMode: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? 0);
    return (
      <div className="bg-background-dark p-4">
        <Slider
          {...args}
          value={val}
          onChange={setVal}
          className="bg-neutral-800 [&::-webkit-slider-thumb]:bg-primary-dark [&::-webkit-slider-thumb]:border-primary-dark"
        />
      </div>
    );
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 60,
    marks: { 0: '0', 50: '50', 100: '100' },
    disabled: false,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Slider in dark mode.' } },
  },
};

export const RWD: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.value ?? 0);
    return (
      <div className="w-full max-w-xs sm:max-w-md">
        <Slider {...args} value={val} onChange={setVal} className="w-full" />
      </div>
    );
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 10,
    marks: { 0: '0', 50: '50', 100: '100' },
    disabled: false,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive Slider.' } },
  },
};
