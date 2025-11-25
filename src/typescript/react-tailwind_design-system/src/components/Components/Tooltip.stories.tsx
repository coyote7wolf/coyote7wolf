import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    multiline: { control: 'boolean' },
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'success', 'warning', 'info'],
    },
    triggerRounded: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    animate: { control: 'boolean' },
    triggerMode: { control: 'select', options: ['hover', 'click'] },
    arrow: { control: 'boolean' },
    className: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Tooltip component supporting multiple colors, sizes, positions, animation, disabled, and loading states.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Light: Story = {
  args: {
    content: 'This is a tooltip',
    placement: 'top',
    multiline: false,
    label: 'Hover me',
    triggerRounded: 'rounded',
    size: 'md',
    variant: 'primary',
    animate: true,
    defaultOpen: true,
    arrow: true,
  },
};

export const Dark: Story = {
  args: {
    content: 'This is a dark tooltip',
    placement: 'top',
    multiline: false,
    label: 'Hover me',
    triggerRounded: 'rounded',
    size: 'md',
    variant: 'primary',
    dark: true,
    animate: true,
    defaultOpen: true,
    arrow: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Placement: Story = {
  render: (args) => (
    <div className="flex gap-8 justify-center items-center mt-8">
      <Tooltip {...args} placement="top" content="Top tooltip" label="Top" />
      <Tooltip {...args} placement="right" content="Right tooltip" label="Right" />
      <Tooltip {...args} placement="bottom" content="Bottom tooltip" label="Bottom" />
      <Tooltip {...args} placement="left" content="Left tooltip" label="Left" />
    </div>
  ),
  args: {
    multiline: false,
    triggerRounded: 'rounded',
    size: 'sm',
    variant: 'primary',
    animate: true,
    arrow: true,
  },
};

export const Multiline: Story = {
  args: {
    content: 'This is a tooltip with\nmultiple lines of text for demonstration.',
    placement: 'top',
    multiline: true,
    label: 'Hover me',
    triggerRounded: 'rounded',
    size: 'md',
    variant: 'primary',
    animate: true,
    defaultOpen: true,
    arrow: true,
  },
};

export const Responsive: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8 items-center mt-8">
      <Tooltip
        {...args}
        content="Tooltip on mobile"
        placement="top"
        label="Responsive Button"
        size="md"
        variant="primary"
      />
      <Tooltip
        {...args}
        content="Tooltip on desktop"
        placement="bottom"
        label="Another Button"
        size="md"
        variant="primary"
      />
    </div>
  ),
  args: {
    multiline: false,
    triggerRounded: 'rounded',
    animate: true,
    arrow: true,
  },
};

// Variants showcase
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-6 mt-8">
      {(['primary', 'secondary', 'danger', 'success', 'warning', 'info'] as const).map((v) => (
        <Tooltip key={v} {...args} variant={v} label={v} content={`Tooltip (${v})`} />
      ))}
    </div>
  ),
  args: {
    placement: 'top',
    multiline: false,
    size: 'sm',
    animate: true,
    arrow: true,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    content: 'Disabled trigger tooltip',
    placement: 'top',
    label: 'Disabled',
    size: 'md',
    variant: 'secondary',
    disabled: true,
    animate: true,
    arrow: true,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    content: 'Loading...',
    placement: 'top',
    label: 'Processing',
    size: 'md',
    variant: 'info',
    loading: true,
    animate: true,
    arrow: true,
  },
};

// Animation off
export const NoAnimation: Story = {
  args: {
    content: 'No animation tooltip',
    placement: 'top',
    label: 'Static',
    size: 'md',
    variant: 'primary',
    animate: false,
    arrow: true,
  },
};

// Click interaction (toggle open on click)
export const ClickInteraction: Story = {
  args: {
    content: 'Click again to close',
    placement: 'bottom',
    label: 'Click me',
    size: 'md',
    variant: 'success',
    triggerMode: 'click',
    arrow: true,
    animate: true,
  },
};

// Reduced motion simulated (animate false demonstrates no motion)
export const ReducedMotionSimulated: Story = {
  args: {
    content: 'Reduced motion (simulate prefers-reduced-motion)',
    placement: 'top',
    label: 'No motion',
    size: 'md',
    variant: 'info',
    animate: false,
    arrow: true,
  },
};
