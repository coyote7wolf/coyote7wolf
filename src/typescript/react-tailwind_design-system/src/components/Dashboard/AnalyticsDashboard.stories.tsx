import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import AnalyticsDashboard, { AnalyticsDashboardProps } from './AnalyticsDashboard';

const meta: Meta<AnalyticsDashboardProps> = {
  title: 'Dashboard/Analytics Dashboard',
  component: AnalyticsDashboard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Analytics dashboard component supporting multiple chart types, interactive filtering, and real-time data updates.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<AnalyticsDashboardProps>;

export const Default: Story = {
  args: {
    title: 'Website Traffic Analysis',
    charts: [
      {
        type: 'bar',
        title: 'Monthly Active Users',
        data: [
          { name: 'January', value: 1000 },
          { name: 'February', value: 1200 },
          { name: 'March', value: 1500 },
        ],
      },
      {
        type: 'line',
        title: 'Conversion Rate',
        data: [
          { name: 'January', value: 2.1 },
          { name: 'February', value: 2.5 },
          { name: 'March', value: 2.9 },
        ],
      },
      {
        type: 'pie',
        title: 'User Source',
        data: [
          { name: 'Direct', value: 60 },
          { name: 'Referral', value: 25 },
          { name: 'Search', value: 15 },
        ],
      },
    ],
    filters: (
      <div className="flex gap-2">
        <button className="btn bg-primary text-white">This Month</button>
        <button className="btn bg-secondary text-white">This Quarter</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'Default AnalyticsDashboard using design tokens.' } },
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Website Traffic Analysis',
    charts: [
      {
        type: 'bar',
        title: 'Monthly Active Users',
        data: [
          { name: 'January', value: 1000 },
          { name: 'February', value: 1200 },
          { name: 'March', value: 1500 },
        ],
      },
      {
        type: 'line',
        title: 'Conversion Rate',
        data: [
          { name: 'January', value: 2.1 },
          { name: 'February', value: 2.5 },
          { name: 'March', value: 2.9 },
        ],
      },
      {
        type: 'pie',
        title: 'User Source',
        data: [
          { name: 'Direct', value: 60 },
          { name: 'Referral', value: 25 },
          { name: 'Search', value: 15 },
        ],
      },
    ],
    filters: (
      <div className="flex gap-2">
        <button className="btn bg-primary-dark text-white">This Month</button>
        <button className="btn bg-secondary-dark text-white">This Quarter</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'AnalyticsDashboard in dark mode.' } },
  },
};

export const Skeleton: Story = {
  args: {
    title: 'Loading...',
    charts: [
      { type: 'bar', title: 'Loading...', data: [] },
      { type: 'line', title: 'Loading...', data: [] },
      { type: 'pie', title: 'Loading...', data: [] },
    ],
    filters: (
      <div className="flex gap-2">
        <button className="btn skeleton skeleton--animate bg-neutral-300 border border-border shadow-sm w-24 h-8" />
        <button className="btn skeleton skeleton--animate bg-neutral-300 border border-border shadow-sm w-24 h-8" />
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'AnalyticsDashboard in loading state (Skeleton style).' } },
  },
};

export const Error: Story = {
  args: {
    title: 'Error',
    charts: [],
    filters: null,
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'Error state (no data).' } },
  },
};

export const CustomColor: Story = {
  args: {
    title: 'Custom Color',
    charts: [
      { type: 'bar', title: 'Custom', data: [{ name: 'A', value: 1 }] },
      { type: 'line', title: 'Custom', data: [{ name: 'B', value: 2 }] },
      { type: 'pie', title: 'Custom', data: [{ name: 'C', value: 3 }] },
    ],
    filters: (
      <div className="flex gap-2">
        <button className="btn bg-accent text-white">Custom</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom theme color AnalyticsDashboard (requires token support in component).',
      },
    },
  },
};

export const Large: Story = {
  args: {
    title: 'Large Dashboard',
    charts: [
      { type: 'bar', title: 'Large', data: [{ name: 'A', value: 10000 }] },
      { type: 'line', title: 'Large', data: [{ name: 'B', value: 20000 }] },
      { type: 'pie', title: 'Large', data: [{ name: 'C', value: 30000 }] },
    ],
    filters: (
      <div className="flex gap-2">
        <button className="btn text-lg bg-primary text-white">Large</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: {
      description: { story: 'Large AnalyticsDashboard (requires text-lg support in component).' },
    },
  },
};

export const Small: Story = {
  args: {
    title: 'Small Dashboard',
    charts: [
      { type: 'bar', title: 'Small', data: [{ name: 'A', value: 1 }] },
      { type: 'line', title: 'Small', data: [{ name: 'B', value: 2 }] },
      { type: 'pie', title: 'Small', data: [{ name: 'C', value: 3 }] },
    ],
    filters: (
      <div className="flex gap-2">
        <button className="btn text-xs bg-primary text-white">Small</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: {
      description: { story: 'Small AnalyticsDashboard (requires text-xs support in component).' },
    },
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Dashboard',
    charts: [
      { type: 'bar', title: 'Disabled', data: [] },
      { type: 'line', title: 'Disabled', data: [] },
      { type: 'pie', title: 'Disabled', data: [] },
    ],
    filters: (
      <div className="flex gap-2">
        <button className="btn bg-muted text-disabled cursor-not-allowed">Disabled</button>
      </div>
    ),
    responsive: true,
    // If the component supports disabled prop, please add it to AnalyticsDashboardProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state AnalyticsDashboard (requires disabled prop support in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    title: 'Accessible Dashboard',
    charts: [
      { type: 'bar', title: 'A11y', data: [{ name: 'A', value: 10 }] },
      { type: 'line', title: 'A11y', data: [{ name: 'B', value: 20 }] },
      { type: 'pie', title: 'A11y', data: [{ name: 'C', value: 30 }] },
    ],
    filters: (
      <div className="flex gap-2">
        <button className="btn bg-primary text-white">A11y</button>
      </div>
    ),
    responsive: true,
    // If the component supports aria-label/role, please add it to AnalyticsDashboardProps
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility (A11y) AnalyticsDashboard (requires aria/role prop support in component).',
      },
    },
  },
};
