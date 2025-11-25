import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import KPIDashboard, { KPIDashboardProps } from './KPIDashboard';

const meta: Meta<KPIDashboardProps> = {
  title: 'Dashboard/KPI Dashboard',
  component: KPIDashboard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'KPI Dashboard, displays multiple KPIs, charts, filters, and is responsive.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<KPIDashboardProps>;

export const Default: Story = {
  args: {
    kpis: [
      { label: 'Revenue', value: 120000, trend: 5, unit: 'NTD' },
      { label: 'Users', value: 3200, trend: 2, unit: 'Users' },
      { label: 'Activity Rate', value: 87, trend: -1, unit: '%' },
      { label: 'Orders', value: 450, trend: 3, unit: 'Orders' },
    ],
    charts: [
      {
        type: 'bar',
        data: [
          { name: 'January', value: 100 },
          { name: 'February', value: 120 },
          { name: 'March', value: 150 },
        ],
      },
      {
        type: 'line',
        data: [
          { name: 'January', value: 80 },
          { name: 'February', value: 110 },
          { name: 'March', value: 140 },
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
    docs: { description: { story: 'Default KPIDashboard using design tokens.' } },
  },
};

export const Skeleton: Story = {
  args: {
    kpis: [
      { label: 'Loading...', value: 0, trend: 0, unit: '' },
      { label: '載入中...', value: 0, trend: 0, unit: '' },
      { label: '載入中...', value: 0, trend: 0, unit: '' },
    ],
    charts: [
      { type: 'bar', data: [] },
      { type: 'line', data: [] },
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
    docs: { description: { story: 'KPIDashboard in loading state (Skeleton style).' } },
  },
};

export const Error: Story = {
  args: {
    kpis: [],
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
    kpis: [{ label: 'Custom', value: 1, trend: 1, unit: 'Custom' }],
    charts: [{ type: 'bar', data: [{ name: 'A', value: 1 }] }],
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
        story: 'Custom theme color KPIDashboard (requires token support in component).',
      },
    },
  },
};

export const Large: Story = {
  args: {
    kpis: [{ label: 'Large', value: 99999, trend: 10, unit: 'Large' }],
    charts: [{ type: 'bar', data: [{ name: 'A', value: 10000 }] }],
    filters: (
      <div className="flex gap-2">
        <button className="btn text-lg bg-primary text-white">Large</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'Large KPIDashboard (requires text-lg support in component).' } },
  },
};

export const Small: Story = {
  args: {
    kpis: [{ label: 'Small', value: 1, trend: -1, unit: 'Small' }],
    charts: [{ type: 'bar', data: [{ name: 'A', value: 1 }] }],
    filters: (
      <div className="flex gap-2">
        <button className="btn text-xs bg-primary text-white">Small</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'Small KPIDashboard (requires text-xs support in component).' } },
  },
};

export const Disabled: Story = {
  args: {
    kpis: [{ label: 'Disabled', value: 0, trend: 0, unit: 'Disabled' }],
    charts: [{ type: 'bar', data: [] }],
    filters: (
      <div className="flex gap-2">
        <button className="btn bg-muted text-disabled cursor-not-allowed">Disabled</button>
      </div>
    ),
    responsive: true,
    // If the component supports disabled prop, please add it to KPIDashboardProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state KPIDashboard (requires disabled prop support in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    kpis: [{ label: 'A11y', value: 10, trend: 0, unit: 'A' }],
    charts: [{ type: 'bar', data: [{ name: 'A', value: 10 }] }],
    filters: (
      <div className="flex gap-2">
        <button className="btn bg-primary text-white">A11y</button>
      </div>
    ),
    responsive: true,
    // If the component supports aria-label/role, please add it to KPIDashboardProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Accessibility (A11y) KPIDashboard (requires aria/role prop support in component).',
      },
    },
  },
};

// Dark mode story
export const DarkMode: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    // If there is a themes addon, use themes: 'dark'
  },
};

export const RWD: Story = {
  args: {
    ...Default.args,
    responsive: true,
  },
};
