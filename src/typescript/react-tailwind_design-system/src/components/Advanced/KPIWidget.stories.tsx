import type { Meta, StoryObj } from '@storybook/react';
import { KPIWidget, KPIWidgetProps } from './KPIWidget';
import {
  FaArrowUp as FaArrowUpRaw,
  FaArrowDown as FaArrowDownRaw,
  FaMinus as FaMinusRaw,
} from 'react-icons/fa';
const FaArrowUp = FaArrowUpRaw as React.FC;
const FaArrowDown = FaArrowDownRaw as React.FC;
const FaMinus = FaMinusRaw as React.FC;

const meta: Meta<KPIWidgetProps> = {
  title: 'Advanced/KPIWidget',
  component: KPIWidget,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    trend: { control: 'select', options: ['up', 'down', 'flat'] },
    status: {
      control: 'select',
      options: ['success', 'warning', 'error', 'default'],
    },
    icon: { control: false },
    className: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'KPI Widget numeric indicator card component, supports value, trend, status, and icon props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<KPIWidgetProps>;

export const Success: Story = {
  args: { value: 12345, trend: 'up', status: 'success', icon: <FaArrowUp /> },
};
export const Warning: Story = {
  args: {
    value: 6789,
    trend: 'down',
    status: 'warning',
    icon: <FaArrowDown />,
  },
};
export const Flat: Story = {
  args: { value: 1000, trend: 'flat', status: 'default', icon: <FaMinus /> },
};

export const Error: Story = {
  args: {
    value: 404,
    trend: 'down',
    status: 'error',
    icon: <FaArrowDown />,
    className: 'border-danger',
  },
};

export const ColorVariants: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <KPIWidget {...args} status="success" className="border-success" />
      <KPIWidget {...args} status="warning" className="border-warning" />
      <KPIWidget {...args} status="error" className="border-danger" />
      <KPIWidget {...args} status="default" className="border-primary" />
      <KPIWidget {...args} status="default" className="border-secondary" />
      <KPIWidget {...args} status="default" className="border-info" />
      <KPIWidget {...args} status="default" className="border-muted" />
    </div>
  ),
  args: {
    value: 8888,
    trend: 'flat',
    icon: <FaMinus />,
  },
};

export const WithCustomIcon: Story = {
  args: {
    value: 999,
    trend: 'up',
    status: 'success',
    icon: <span className="text-2xl text-info">★</span>,
    className: 'border-info',
  },
};

export const WithLongValue: Story = {
  args: {
    value: '123,456,789',
    trend: 'up',
    status: 'success',
    icon: <FaArrowUp />,
    className: 'border-success',
  },
};

export const WithoutIcon: Story = {
  args: {
    value: 555,
    trend: 'flat',
    status: 'default',
    className: 'border-muted',
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="border rounded bg-skeleton-bg animate-pulse w-64 h-20 flex items-center p-4">
      <div className="w-8 h-8 bg-skeleton-bg rounded-full mr-2" />
      <div className="flex-1">
        <div className="h-6 bg-skeleton-bg rounded w-3/4 mb-2" />
        <div className="h-3 bg-skeleton-bg rounded w-1/2" />
      </div>
    </div>
  ),
};
