import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import AdminDashboard, { AdminDashboardProps } from './AdminDashboard';
import { KPIWidget } from '../Advanced/KPIWidget';
import { StatisticCard } from '../Advanced/StatisticCard';

const meta: Meta<AdminDashboardProps> = {
  title: 'Dashboard/Admin Dashboard',
  component: AdminDashboard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Admin Dashboard, displays widgets, user list, action buttons, and is responsive.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<AdminDashboardProps>;

export const Default: Story = {
  args: {
    title: 'Admin Panel',
    widgets: [
      <KPIWidget key="kpi1" value={1200} trend="up" />,
      <StatisticCard key="stat1" description="Orders" value={450} />,
    ],
    users: [
      { name: 'Xiao Ming Wang', role: 'Admin', status: 'Active' },
      { name: 'Xiao Hua Li', role: 'Editor', status: 'Inactive' },
      { name: 'Da Tong Chen', role: 'Viewer', status: 'Active' },
    ],
    actions: (
      <div className="flex gap-2">
        <button className="btn">Add User</button>
        <button className="btn">Export Report</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'Default AdminDashboard using design tokens.' } },
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Admin Panel',
    widgets: [
      <KPIWidget key="kpi1" value={1200} trend="up" />,
      <StatisticCard key="stat1" description="訂單數" value={450} />,
    ],
    users: [
      { name: 'Xiao Ming Wang', role: 'Admin', status: 'Active' },
      { name: 'Xiao Hua Li', role: 'Editor', status: 'Inactive' },
      { name: 'Da Tong Chen', role: 'Viewer', status: 'Active' },
    ],
    actions: (
      <div className="flex gap-2">
        <button className="btn bg-primary-dark text-white">Add User</button>
        <button className="btn bg-secondary-dark text-white">Export Report</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'AdminDashboard in dark mode.' } },
  },
};

export const Skeleton: Story = {
  args: {
    title: 'Loading...',
    widgets: [
      <div
        key="sk1"
        className="skeleton skeleton--animate skeleton--w-32 skeleton--h-12 rounded bg-neutral-300 border border-border shadow-sm"
      />,
      <div
        key="sk2"
        className="skeleton skeleton--animate skeleton--w-32 skeleton--h-12 rounded bg-neutral-300 border border-border shadow-sm"
      />,
    ],
    users: [],
    actions: (
      <div className="flex gap-2">
        <button className="btn skeleton skeleton--animate bg-neutral-300 border border-border shadow-sm w-24 h-8" />
        <button className="btn skeleton skeleton--animate bg-neutral-300 border border-border shadow-sm w-24 h-8" />
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'AdminDashboard in loading state (Skeleton style).' } },
  },
};

export const Error: Story = {
  args: {
    title: 'Error',
    widgets: [],
    users: [],
    actions: null,
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'Error state (no data).' } },
  },
};

export const CustomColor: Story = {
  args: {
    title: 'Custom Color',
    widgets: [
      <KPIWidget key="kpi1" value={999} trend="down" />,
      <StatisticCard key="stat1" description="Custom" value={123} />,
    ],
    users: [{ name: 'Custom', role: 'Custom', status: 'Custom' }],
    actions: (
      <div className="flex gap-2">
        <button className="btn bg-accent text-white">Custom Action</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom theme color AdminDashboard (requires token support in component).',
      },
    },
  },
};

export const Large: Story = {
  args: {
    title: 'Large Dashboard',
    widgets: [
      <KPIWidget key="kpi1" value={9999} trend="up" />,
      <StatisticCard key="stat1" description="Large" value={8888} />,
    ],
    users: [{ name: 'Large User', role: 'Admin', status: 'Active' }],
    actions: (
      <div className="flex gap-2">
        <button className="btn text-lg bg-primary text-white">Large Action</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: {
      description: { story: 'Large AdminDashboard (requires text-lg support in component).' },
    },
  },
};

export const Small: Story = {
  args: {
    title: 'Small Dashboard',
    widgets: [
      <KPIWidget key="kpi1" value={1} trend="down" />,
      <StatisticCard key="stat1" description="Small" value={2} />,
    ],
    users: [{ name: 'Small User', role: 'Viewer', status: 'Active' }],
    actions: (
      <div className="flex gap-2">
        <button className="btn text-xs bg-primary text-white">Small Action</button>
      </div>
    ),
    responsive: true,
  },
  parameters: {
    docs: {
      description: { story: 'Small AdminDashboard (requires text-xs support in component).' },
    },
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Dashboard',
    widgets: [
      <KPIWidget key="kpi1" value={0} trend="down" />,
      <StatisticCard key="stat1" description="Disabled" value={0} />,
    ],
    users: [{ name: 'Disabled', role: 'Viewer', status: 'Inactive' }],
    actions: (
      <div className="flex gap-2">
        <button className="btn bg-muted text-disabled cursor-not-allowed">Disabled Action</button>
      </div>
    ),
    responsive: true,
    // If the component supports disabled prop, please add it to AdminDashboardProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state AdminDashboard (requires disabled prop support in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    title: 'Accessible Dashboard',
    widgets: [
      <KPIWidget key="kpi1" value={100} trend="up" />,
      <StatisticCard key="stat1" description="A11y" value={200} />,
    ],
    users: [{ name: 'A11y', role: 'Admin', status: 'Active' }],
    actions: (
      <div className="flex gap-2">
        <button className="btn bg-primary text-white">A11y Action</button>
      </div>
    ),
    responsive: true,
    // If the component supports aria-label/role, please add it to AdminDashboardProps
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility (A11y) AdminDashboard (requires aria/role prop support in component).',
      },
    },
  },
};
