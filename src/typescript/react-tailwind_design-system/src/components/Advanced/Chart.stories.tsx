import type { Meta, StoryObj } from '@storybook/react';
import { Chart, ChartProps } from './Chart';

const meta: Meta<ChartProps> = {
  title: 'Advanced/Chart',
  component: Chart,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['bar', 'line', 'pie', 'area', 'radar'],
    },
    color: { control: 'color' },
    legend: { control: 'boolean' },
    animation: { control: 'boolean' },
    responsive: { control: 'boolean' },
    className: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Chart component supporting multiple chart types, themes, and responsive design.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<ChartProps>;

export const Bar: Story = {
  render: (args) => {
    return (
      <Chart
        {...args}
        data={[
          { label: 'A', value: 30, color: '#2563eb' },
          { label: 'B', value: 80, color: '#10b981' },
          { label: 'C', value: 45, color: '#f59e42' },
          { label: 'D', value: 60, color: '#f43f5e' },
        ]}
      />
    );
  },
  args: {
    type: 'bar',
    legend: true,
    animation: true,
    responsive: true,
  },
};
export const Line: Story = {
  render: (args) => {
    return (
      <Chart
        {...args}
        data={[
          { label: 'Jan', value: 20 },
          { label: 'Feb', value: 40 },
          { label: 'Mar', value: 35 },
          { label: 'Apr', value: 60 },
          { label: 'May', value: 50 },
        ]}
      />
    );
  },
  args: {
    type: 'line',
    legend: true,
    animation: true,
    responsive: true,
    color: '#2563eb',
  },
};
export const Pie: Story = {
  render: (args) => {
    return (
      <Chart
        {...args}
        data={[
          { label: 'Apple', value: 40, color: '#2563eb' },
          { label: 'Banana', value: 25, color: '#10b981' },
          { label: 'Orange', value: 35, color: '#f59e42' },
        ]}
      />
    );
  },
  args: {
    type: 'pie',
    legend: false,
    animation: true,
    responsive: true,
  },
};
