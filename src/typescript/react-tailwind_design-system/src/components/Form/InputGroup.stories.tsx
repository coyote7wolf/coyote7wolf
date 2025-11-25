import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { InputGroup, InputGroupProps } from './InputGroup';

import * as FaIcons from 'react-icons/fa';
const FaUser = FaIcons.FaUser as React.FC;
const FaLock = FaIcons.FaLock as React.FC;

const meta: Meta<InputGroupProps> = {
  title: 'Form/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    prefix: { control: false },
    suffix: { control: false },
    disabled: { control: 'boolean' },
    className: { control: 'text' },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: 'InputGroup component supporting prefix, suffix, size, and disabled props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<InputGroupProps>;

export const Default: Story = {
  args: {
    size: 'md',
    prefix: <FaUser />,
    suffix: <FaLock />,
    children: <input className="input" placeholder="Enter content" />,
    disabled: false,
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
    docs: { description: { story: 'InputGroup in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  args: {
    size: 'md',
    prefix: (
      <span className="text-accent">
        <FaUser />
      </span>
    ),
    suffix: (
      <span className="text-accent">
        <FaLock />
      </span>
    ),
    children: (
      <input className="input border-accent focus:border-accent" placeholder="Custom Color" />
    ),
    className: 'border-accent',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom theme InputGroup (requires token support in component).',
      },
    },
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    prefix: <FaUser />,
    suffix: <FaLock />,
    children: <input className="input text-lg" placeholder="Large" />,
    disabled: false,
  },
  parameters: {
    docs: { description: { story: 'Large InputGroup.' } },
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    prefix: <FaUser />,
    suffix: <FaLock />,
    children: <input className="input text-xs" placeholder="Small" />,
    disabled: false,
  },
  parameters: {
    docs: { description: { story: 'Small InputGroup.' } },
  },
};

export const Disabled: Story = {
  args: {
    size: 'md',
    prefix: <FaUser />,
    suffix: <FaLock />,
    children: (
      <input
        className="input bg-muted text-white opacity-50 cursor-not-allowed"
        placeholder="Disabled"
        disabled
      />
    ),
    disabled: true,
  },
  parameters: {
    docs: { description: { story: 'Disabled InputGroup.' } },
  },
};

export const A11y: Story = {
  args: {
    size: 'md',
    prefix: <FaUser />,
    suffix: <FaLock />,
    children: <input className="input" placeholder="Account" aria-label="Account" />,
    disabled: false,
  },
  parameters: {
    docs: { description: { story: 'A11y (accessible) InputGroup.' } },
  },
};

export const DarkMode: Story = {
  args: {
    size: 'md',
    prefix: (
      <span className="text-white">
        <FaUser />
      </span>
    ),
    suffix: (
      <span className="text-white">
        <FaLock />
      </span>
    ),
    children: (
      <input
        className="input bg-neutral-800 text-white border-neutral-700 focus:border-primary"
        placeholder="Dark Mode"
      />
    ),
    className: 'bg-neutral-900',
    disabled: false,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'InputGroup in dark mode.' } },
  },
};

export const RWD: Story = {
  args: {
    size: 'md',
    prefix: (
      <span className="text-primary">
        <FaUser />
      </span>
    ),
    suffix: (
      <span className="text-primary">
        <FaLock />
      </span>
    ),
    children: <input className="input w-full" placeholder="RWD Responsive" />,
    className: 'w-full max-w-xs sm:max-w-md',
    disabled: false,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive InputGroup.' } },
  },
};
