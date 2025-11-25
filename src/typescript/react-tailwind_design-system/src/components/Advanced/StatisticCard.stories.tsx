import type { Meta, StoryObj } from '@storybook/react';
import { StatisticCard, StatisticCardProps } from './StatisticCard';

import { FaChartBar as FaChartBarIconRaw } from 'react-icons/fa';
const FaChartBarIcon = FaChartBarIconRaw as React.FC;

const meta: Meta<StatisticCardProps> = {
  title: 'Advanced/StatisticCard',
  component: StatisticCard,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    description: { control: 'text' },
    icon: { control: false },
    trend: { control: 'select', options: ['up', 'down', 'flat'] },
    className: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Statistic Card component, supports value, description, icon, and trend props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<StatisticCardProps>;

export const Default: Story = {
  args: {
    value: 8888,
    description: 'Sales this month',
    icon: <FaChartBarIcon />,
    trend: 'up',
  },
};

export const WithDifferentTrends: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <StatisticCard {...args} trend="up" description="Up" className="border-primary" />
      <StatisticCard {...args} trend="down" description="Down" className="border-danger" />
      <StatisticCard {...args} trend="flat" description="Flat" className="border-secondary" />
    </div>
  ),
  args: {
    value: 5200,
    icon: <FaChartBarIcon />,
  },
};

export const WithColorVariants: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <StatisticCard {...args} className="border-primary text-primary" description="Primary" />
      <StatisticCard
        {...args}
        className="border-secondary text-secondary"
        description="Secondary"
      />
      <StatisticCard {...args} className="border-success text-success" description="Success" />
      <StatisticCard {...args} className="border-warning text-warning" description="Warning" />
      <StatisticCard {...args} className="border-danger text-danger" description="Danger" />
      <StatisticCard {...args} className="border-info text-info" description="Info" />
    </div>
  ),
  args: {
    value: 1234,
    icon: <FaChartBarIcon />,
    trend: 'flat',
  },
};

export const WithCustomIcon: Story = {
  args: {
    value: 777,
    description: 'Custom icon',
    icon: <span className="text-2xl text-success">★</span>,
    trend: 'up',
    className: 'border-success',
  },
};

export const WithLongDescription: Story = {
  args: {
    value: 9999,
    description:
      'This is a long description text used to test the display effect of StatisticCard with a long description.',
    icon: <FaChartBarIcon />,
    trend: 'flat',
    className: 'border-info',
  },
};

export const WithoutDescription: Story = {
  args: {
    value: 123,
    icon: <FaChartBarIcon />,
    trend: 'down',
    className: 'border-warning',
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="border rounded p-4 flex items-center animate-pulse bg-skeleton-bg w-64 h-20">
      <div className="w-8 h-8 bg-skeleton-bg rounded-full mr-2" />
      <div className="flex-1">
        <div className="h-6 bg-skeleton-bg rounded w-3/4 mb-2" />
        <div className="h-3 bg-skeleton-bg rounded w-1/2" />
      </div>
    </div>
  ),
};
