import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Drawer, DrawerProps } from './Drawer';

const meta: Meta<DrawerProps> = {
  title: 'Feedback/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
    width: { control: 'text' },
    placement: { control: 'select', options: ['left', 'right'] },
    maskClosable: { control: 'boolean' },
    footer: { control: false },
    children: { control: false },
    onClose: { action: 'onClose' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Drawer component supporting open, title, width, placement, maskClosable, and footer props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<DrawerProps>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div>
        <button
          className="btn bg-primary text-primary-text px-4 py-2 rounded"
          onClick={() => setOpen(true)}
        >
          Open Drawer
        </button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          This is the Drawer content
        </Drawer>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Title',
    width: 320,
    placement: 'right',
    maskClosable: true,
    footer: <div className="bg-surface text-text p-2">Custom Footer</div>,
  },
  parameters: {
    docs: { description: { story: 'Default Drawer using design tokens.' } },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-neutral-900/60 z-40 animate-pulse" />
      <div className="fixed top-0 right-0 h-full bg-skeleton rounded-l-lg shadow-lg z-50 p-6 flex flex-col w-80">
        <div className="h-6 bg-skeleton rounded w-1/2 mb-4" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-skeleton rounded w-full" />
          <div className="h-4 bg-skeleton rounded w-5/6" />
          <div className="h-4 bg-skeleton rounded w-2/3" />
        </div>
        <div className="h-10 bg-skeleton rounded mt-4 w-full" />
      </div>
    </div>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'Drawer in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div>
        <button
          className="btn bg-accent text-white px-4 py-2 rounded"
          onClick={() => setOpen(true)}
        >
          Open Drawer
        </button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <div className="text-accent">This is a custom theme Drawer content</div>
        </Drawer>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Custom Theme',
    width: 320,
    placement: 'right',
    maskClosable: true,
    footer: <div className="bg-accent/10 text-accent p-2">Custom Footer</div>,
  },
  parameters: {
    docs: { description: { story: 'Custom theme Drawer (requires token support in component).' } },
  },
};

export const Large: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div>
        <button
          className="btn bg-primary text-primary-text px-6 py-3 text-lg rounded"
          onClick={() => setOpen(true)}
        >
          Open Large Drawer
        </button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)} width={480}>
          <div className="text-lg">This is the large Drawer content</div>
        </Drawer>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Large Drawer',
    width: 480,
    placement: 'right',
    maskClosable: true,
    footer: <div className="bg-surface text-text p-4 text-lg">Large Footer</div>,
  },
  parameters: {
    docs: { description: { story: 'Large Drawer (requires width/text-lg support in component).' } },
  },
};

export const Small: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div>
        <button
          className="btn bg-primary text-primary-text px-2 py-1 text-xs rounded"
          onClick={() => setOpen(true)}
        >
          Open Small Drawer
        </button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)} width={200}>
          <div className="text-xs">This is the small Drawer content</div>
        </Drawer>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Small Drawer',
    width: 200,
    placement: 'right',
    maskClosable: true,
    footer: <div className="bg-surface text-text p-1 text-xs">Small Footer</div>,
  },
  parameters: {
    docs: { description: { story: 'Small Drawer (requires width/text-xs support in component).' } },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div>
        <button
          className="btn bg-muted text-white px-4 py-2 rounded opacity-50 cursor-not-allowed"
          disabled
        >
          Drawer Disabled
        </button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <div className="text-muted">This is the disabled Drawer content</div>
        </Drawer>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Disabled Drawer',
    width: 320,
    placement: 'right',
    maskClosable: true,
    footer: <div className="bg-surface text-muted p-2">Disabled Footer</div>,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled Drawer (requires disabled state support in component).',
      },
    },
  },
};

export const A11y: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div>
        <button
          className="btn bg-primary text-primary-text px-4 py-2 rounded"
          aria-haspopup="dialog"
          aria-controls="drawer-a11y"
          onClick={() => setOpen(true)}
        >
          Open A11y Drawer
        </button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)} title="A11y Drawer">
          <div>This is the A11y Drawer content</div>
        </Drawer>
      </div>
    );
  },
  args: {
    open: false,
    title: 'A11y Drawer',
    width: 320,
    placement: 'right',
    maskClosable: true,
    footer: <div className="bg-surface text-text p-2">A11y Footer</div>,
  },
  parameters: {
    docs: {
      description: {
        story: 'A11y (accessibility) Drawer (requires aria/role prop support in component).',
      },
    },
  },
};

export const DarkMode: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div className="dark bg-background-dark min-h-screen p-8">
        <button
          className="btn bg-primary text-white px-4 py-2 rounded"
          onClick={() => setOpen(true)}
        >
          Open Dark Drawer
        </button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <div className="text-white">This is the dark mode Drawer content</div>
        </Drawer>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Dark Mode Drawer',
    width: 320,
    placement: 'right',
    maskClosable: true,
    footer: <div className="bg-surface-dark text-white p-2">Dark Footer</div>,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Drawer in dark mode.' } },
  },
};

export const RWD: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div className="p-2">
        <button
          className="btn bg-primary text-primary-text px-4 py-2 rounded w-full sm:w-auto"
          onClick={() => setOpen(true)}
        >
          Open RWD Drawer
        </button>
        <Drawer
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          width={window.innerWidth < 640 ? '100vw' : 320}
        >
          <div className="text-text">This is the RWD Drawer content</div>
        </Drawer>
      </div>
    );
  },
  args: {
    open: false,
    title: 'RWD Drawer',
    width: 320,
    placement: 'right',
    maskClosable: true,
    footer: <div className="bg-surface text-text p-2">RWD Footer</div>,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive Drawer.' } },
  },
};
