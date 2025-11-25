import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'muted'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Spinner component supporting multiple colors, sizes, speeds, thickness, label, overlay, and responsive.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

// Light Mode (primary)
export const Light: Story = {
  args: {
    size: 'md',
    variant: 'primary',
    speed: 'normal',
    thickness: 'normal',
    label: 'Loading…',
  },
};

// Dark Mode (primary) - use dark background
export const Dark: Story = {
  args: {
    size: 'md',
    variant: 'primary',
    speed: 'normal',
    thickness: 'normal',
    label: 'Loading…',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Sizes showcase
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <Spinner {...args} size="xs" />
      <Spinner {...args} size="sm" />
      <Spinner {...args} size="md" />
      <Spinner {...args} size="lg" />
      <Spinner {...args} size="xl" />
    </div>
  ),
  args: {
    variant: 'primary',
    speed: 'normal',
    thickness: 'normal',
  },
};

// Responsive (sm -> md)
export const Responsive: Story = {
  args: {
    size: 'sm',
    responsive: true,
    variant: 'primary',
    label: 'Loading…',
  },
};

// With visual label
export const WithLabel: Story = {
  args: {
    size: 'md',
    variant: 'primary',
    showLabel: true,
    label: 'Processing data…',
  },
};

// Overlay form (simulate full-screen or container mask)
export const Overlay: Story = {
  render: (args) => (
    <div
      style={{
        position: 'relative',
        height: '120px',
        width: '100%',
        background: '#f1f5f9',
        borderRadius: '8px',
      }}
    >
      <Spinner {...args} />
      <p style={{ padding: '12px' }}>Content underneath is masked.</p>
    </div>
  ),
  args: {
    overlay: true,
    size: 'lg',
    variant: 'primary',
    label: 'Loading…',
  },
};

// Speeds
export const Speeds: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Spinner {...args} speed="slow" />
        <span className="text-xs">slow</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner {...args} speed="normal" />
        <span className="text-xs">normal</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner {...args} speed="fast" />
        <span className="text-xs">fast</span>
      </div>
    </div>
  ),
  args: {
    size: 'md',
    variant: 'primary',
  },
};

// Thickness variants
export const Thickness: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Spinner {...args} thickness="thin" />
        <span className="text-xs">thin</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner {...args} thickness="normal" />
        <span className="text-xs">normal</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner {...args} thickness="thick" />
        <span className="text-xs">thick</span>
      </div>
    </div>
  ),
  args: {
    size: 'md',
    variant: 'primary',
  },
};

// Color variants
export const ColorVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      {(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'muted'] as const).map(
        (v) => (
          <div key={v} className="flex flex-col items-center gap-2">
            <Spinner {...args} variant={v} />
            <span className="text-xs">{v}</span>
          </div>
        ),
      )}
    </div>
  ),
  args: {
    size: 'md',
    speed: 'normal',
    thickness: 'normal',
  },
};
