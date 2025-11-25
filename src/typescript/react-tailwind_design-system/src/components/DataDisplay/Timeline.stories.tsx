import type { Meta, StoryObj } from '@storybook/react';
import { Timeline, TimelineProps, TimelineItem } from './Timeline';

const baseItems: TimelineItem[] = [
  { label: 'Order placed', date: '2025-11-01', status: 'success' },
  { label: 'Order shipped', date: '2025-11-02', status: 'pending' },
  { label: 'Order delivered', date: '2025-11-03', status: 'default' },
];

const meta: Meta<TimelineProps> = {
  title: 'Data Display/Timeline',

  component: Timeline,
  tags: ['autodocs'],
  argTypes: {
    items: { control: { type: 'object' }, description: 'Timeline items' },
    className: { control: 'text' },
    horizontal: { control: 'boolean' },
    loading: { control: 'boolean' },
    empty: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: { type: 'select', options: ['sm', 'lg'] } },
    a11yLabel: { control: 'text' },
  },
  args: {
    items: baseItems,
    className: '',
    horizontal: false,
    loading: false,
    empty: false,
    disabled: false,
    size: undefined,
    a11yLabel: '',
  },
};
export default meta;

type Story = StoryObj<TimelineProps>;

export const Default: Story = {};
export const Status: Story = {
  args: {
    items: [
      { label: 'Order placed', status: 'success', date: '2025-11-01' },
      { label: 'Order shipped', status: 'pending', date: '2025-11-02' },
      { label: 'Order error', status: 'error', date: '2025-11-03' },
    ],
    className: '',
  },
};
export const LightMode: Story = {
  args: {
    className: 'bg-white text-primary',
  },
};
export const DarkMode: Story = {
  args: {
    className: 'bg-neutral-900 text-white',
  },
};
export const WithIcon: Story = {
  args: {
    items: [
      { label: 'Start', icon: '🚀' },
      { label: 'Progress', icon: '🔄' },
      { label: 'Finish', icon: '✅' },
    ],
    className: 'flex items-center gap-2',
  },
};
export const WithDate: Story = {
  args: {
    items: [
      { label: 'Order placed', date: '2025-11-01' },
      { label: 'Order shipped', date: '2025-11-02' },
      { label: 'Order delivered', date: '2025-11-03' },
    ],
    className: 'text-xs text-neutral-500',
  },
};
export const Alternate: Story = {
  args: {
    items: [
      { label: 'Step 1', alternate: true },
      { label: 'Step 2', alternate: false },
      { label: 'Step 3', alternate: true },
    ],
    className: '',
  },
};
export const Pending: Story = {
  args: {
    items: [{ label: 'Waiting', status: 'pending' }],
    className: 'text-warning',
  },
};
export const Success: Story = {
  args: {
    items: [{ label: 'Done', status: 'success' }],
    className: 'text-success',
  },
};
export const Error: Story = {
  args: {
    items: [{ label: 'Failed', status: 'error' }],
    className: 'text-danger',
  },
};
export const CustomDot: Story = {
  args: {
    items: [{ label: 'Custom', customDot: <span className="timeline-dot-custom">★</span> }],
    className: '',
  },
};
export const Loading: Story = {
  args: {
    loading: true,
  },
};
export const Empty: Story = {
  args: {
    empty: true,
    items: [],
    className: 'text-neutral-400 text-center',
  },
};
export const Disabled: Story = {
  args: {
    disabled: true,
    className: 'bg-neutral-100 opacity-50 cursor-not-allowed',
  },
};
export const Hover: Story = {
  args: {
    className: 'hover:bg-primary/10 hover:shadow-lg',
  },
};
export const Focus: Story = {
  args: {
    className: 'focus:ring focus:outline-none',
  },
};
export const SizeSmall: Story = {
  args: {
    size: 'sm',
    className: 'px-2 py-1 text-sm',
  },
};
export const SizeLarge: Story = {
  args: {
    size: 'lg',
    className: 'px-6 py-4 text-lg',
  },
};
export const Responsive: Story = {
  args: {
    className: 'w-full sm:w-1/2',
  },
};
export const Mobile: Story = {
  args: {
    className: 'max-w-xs mx-auto px-2 py-1',
  },
};
export const Vertical: Story = {
  args: {
    horizontal: false,
    className: '',
  },
};
export const Horizontal: Story = {
  args: {
    horizontal: true,
    className: 'flex-row',
  },
};
export const Animation: Story = {
  args: {
    className: 'transition-all duration-200',
  },
};
export const A11y: Story = {
  args: {
    a11yLabel: 'Timeline',
    className: '',
  },
};
