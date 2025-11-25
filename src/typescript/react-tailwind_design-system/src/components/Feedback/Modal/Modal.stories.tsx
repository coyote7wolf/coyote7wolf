import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Modal, ModalProps } from './Modal';

const meta: Meta<ModalProps> = {
  title: 'Feedback/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
    width: { control: 'text' },
    centered: { control: 'boolean' },
    maskClosable: { control: 'boolean' },
    footer: { control: false },
    children: { control: false },
    onClose: { action: 'onClose' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Modal component supporting open, title, width, centered, maskClosable, and footer props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<ModalProps>;
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div>
        <button
          className="btn bg-primary text-primary-text px-4 py-2 rounded"
          onClick={() => setOpen(true)}
        >
          Open Modal
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)}>
          This is the Modal content
        </Modal>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Title',
    width: 520,
    centered: false,
    maskClosable: true,
    footer: <div className="bg-surface text-text p-2">Custom Footer</div>,
  },
  parameters: {
    docs: { description: { story: 'Default Modal using design tokens.' } },
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 animate-pulse">
      <div className="bg-skeleton rounded shadow-lg p-6 w-96">
        <div className="h-6 bg-skeleton rounded w-1/2 mb-4" />
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-skeleton rounded w-full" />
          <div className="h-4 bg-skeleton rounded w-5/6" />
          <div className="h-4 bg-skeleton rounded w-2/3" />
        </div>
        <div className="h-10 bg-skeleton rounded w-full" />
      </div>
    </div>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'Modal in loading state (Skeleton style).' } },
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
          Open Modal
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)}>
          <div className="text-accent">This is a custom theme Modal content</div>
        </Modal>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Custom Theme',
    width: 520,
    centered: false,
    maskClosable: true,
    footer: <div className="bg-accent/10 text-accent p-2">Custom Footer</div>,
  },
  parameters: {
    docs: { description: { story: 'Custom theme Modal (requires token support in component).' } },
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
          Open Large Modal
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)} width={720}>
          <div className="text-lg">This is the large Modal content</div>
        </Modal>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Large Modal',
    width: 720,
    centered: false,
    maskClosable: true,
    footer: <div className="bg-surface text-text p-4 text-lg">Large Footer</div>,
  },
  parameters: {
    docs: { description: { story: 'Large Modal (requires width/text-lg support in component).' } },
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
          Open Small Modal
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)} width={280}>
          <div className="text-xs">This is the small Modal content</div>
        </Modal>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Small Modal',
    width: 280,
    centered: false,
    maskClosable: true,
    footer: <div className="bg-surface text-text p-1 text-xs">Small Footer</div>,
  },
  parameters: {
    docs: { description: { story: 'Small Modal (requires width/text-xs support in component).' } },
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
          Modal Disabled
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)}>
          <div className="text-muted">This is the disabled Modal content</div>
        </Modal>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Disabled Modal',
    width: 520,
    centered: false,
    maskClosable: true,
    footer: <div className="bg-surface text-muted p-2">Disabled Footer</div>,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled Modal (requires disabled state support in component).',
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
          aria-controls="modal-a11y"
          onClick={() => setOpen(true)}
        >
          Open A11y Modal
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)} title="A11y Modal">
          <div>This is the A11y Modal content</div>
        </Modal>
      </div>
    );
  },
  args: {
    open: false,
    title: 'A11y Modal',
    width: 520,
    centered: false,
    maskClosable: true,
    footer: <div className="bg-surface text-text p-2">A11y Footer</div>,
  },
  parameters: {
    docs: {
      description: {
        story: 'A11y (accessibility) Modal (requires aria/role prop support in component).',
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
          Open Dark Modal
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)}>
          <div className="text-white">This is the dark mode Modal content</div>
        </Modal>
      </div>
    );
  },
  args: {
    open: false,
    title: 'Dark Mode Modal',
    width: 520,
    centered: false,
    maskClosable: true,
    footer: <div className="bg-surface-dark text-white p-2">Dark Footer</div>,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Modal in dark mode.' } },
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
          Open RWD Modal
        </button>
        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          width={window.innerWidth < 640 ? '100vw' : 520}
        >
          <div className="text-text">This is the RWD Modal content</div>
        </Modal>
      </div>
    );
  },
  args: {
    open: false,
    title: 'RWD Modal',
    width: 520,
    centered: false,
    maskClosable: true,
    footer: <div className="bg-surface text-text p-2">RWD Footer</div>,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive Modal.' } },
  },
};
