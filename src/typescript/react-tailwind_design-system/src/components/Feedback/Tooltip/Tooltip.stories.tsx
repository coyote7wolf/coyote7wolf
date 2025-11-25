import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Tooltip, TooltipProps } from './Tooltip';

const meta: Meta<TooltipProps> = {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    trigger: { control: 'select', options: ['hover', 'click', 'focus'] },
    multiline: { control: 'boolean' },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: 'Tooltip component supporting placement, trigger, and multiline props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<TooltipProps>;

export const Default: Story = {
  args: {
    content: 'This is the Tooltip content',
    placement: 'top',
    trigger: 'hover',
    multiline: false,
    children: (
      <button className="btn bg-primary text-primary-text px-4 py-2 rounded">Hover me</button>
    ),
  },
  parameters: {
    docs: { description: { story: 'Default Tooltip using design tokens.' } },
  },
};

export const Skeleton: Story = {
  render: () => (
    <span className="inline-block">
      <span className="inline-block w-20 h-8 bg-skeleton rounded animate-pulse" />
    </span>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'Tooltip in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  args: {
    content: <span className="text-accent">Custom Theme Tooltip</span>,
    placement: 'top',
    trigger: 'hover',
    multiline: false,
    children: <button className="btn bg-accent text-white px-4 py-2 rounded">Custom Color</button>,
  },
  parameters: {
    docs: { description: { story: 'Custom theme Tooltip (requires token support in component).' } },
  },
};

export const Large: Story = {
  args: {
    content: <span className="text-lg">Large Tooltip</span>,
    placement: 'top',
    trigger: 'hover',
    multiline: false,
    children: (
      <button className="btn bg-primary text-primary-text px-6 py-3 text-lg rounded">
        Large Button
      </button>
    ),
  },
  parameters: {
    docs: { description: { story: 'Large Tooltip (requires text-lg support in component).' } },
  },
};

export const Small: Story = {
  args: {
    content: <span className="text-xs">Small Tooltip</span>,
    placement: 'top',
    trigger: 'hover',
    multiline: false,
    children: (
      <button className="btn bg-primary text-primary-text px-2 py-1 text-xs rounded">
        Small Button
      </button>
    ),
  },
  parameters: {
    docs: { description: { story: 'Small Tooltip (requires text-xs support in component).' } },
  },
};

export const Disabled: Story = {
  args: {
    content: 'Disabled Tooltip',
    placement: 'top',
    trigger: 'hover',
    multiline: false,
    children: (
      <button
        className="btn bg-muted text-white px-4 py-2 rounded opacity-50 cursor-not-allowed"
        disabled
      >
        Disabled
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled Tooltip (requires disabled prop support in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    content: 'A11y Accessible Tooltip',
    placement: 'top',
    trigger: 'hover',
    multiline: false,
    children: (
      <button
        className="btn bg-primary text-primary-text px-4 py-2 rounded"
        aria-describedby="tooltip-a11y"
      >
        A11y
      </button>
    ),
  },
  render: (args) => (
    <span role="tooltip" id="tooltip-a11y">
      <Tooltip {...args} />
    </span>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A11y (accessible) Tooltip (requires aria/role prop support in component).',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    content: <span className="text-white">Dark Mode Tooltip</span>,
    placement: 'top',
    trigger: 'hover',
    multiline: false,
    children: <button className="btn bg-primary text-white px-4 py-2 rounded">Dark</button>,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Tooltip in dark mode.' } },
  },
};

export const RWD: Story = {
  args: {
    content: 'RWD Responsive Tooltip',
    placement: 'top',
    trigger: 'hover',
    multiline: false,
    children: (
      <button className="btn bg-primary text-primary-text px-4 py-2 rounded w-full sm:w-auto">
        RWD Button
      </button>
    ),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive Tooltip.' } },
  },
};
