import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Upload, UploadProps } from './Upload';

const meta: Meta<UploadProps> = {
  title: 'Form/Upload',
  component: Upload,
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    drag: { control: 'boolean' },
    progress: { control: 'number' },
    preview: { control: 'boolean' },
    className: { control: 'text' },
    onChange: { action: 'onChange' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Upload component supporting multiple, disabled, drag, progress, and preview props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<UploadProps>;

export const Default: Story = {
  render: (args) => {
    const [progress, setProgress] = useState<number | undefined>(undefined);
    return (
      <Upload
        {...args}
        progress={progress}
        onChange={() => {
          setProgress(0);
          let p = 0;
          const interval = setInterval(() => {
            p += 10;
            setProgress(p);
            if (p >= 100) clearInterval(interval);
          }, 100);
        }}
      />
    );
  },
  args: {
    multiple: false,
    disabled: false,
    drag: false,
    preview: false,
  },
};

export const DragAndDrop: Story = {
  args: {
    multiple: true,
    disabled: false,
    drag: true,
    preview: false,
  },
};

export const Disabled: Story = {
  args: {
    multiple: false,
    disabled: true,
    drag: false,
    preview: false,
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-60">
      <div className="h-16 bg-skeleton animate-pulse rounded-md" />
    </div>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'Upload in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  render: (args) => <Upload {...args} className="border-accent bg-accent/5 text-accent" />,
  args: {
    multiple: true,
    disabled: false,
    drag: true,
    preview: false,
  },
  parameters: {
    docs: { description: { story: 'Custom theme Upload (requires token support in component).' } },
  },
};

export const Large: Story = {
  render: (args) => <Upload {...args} className="p-8 text-lg" />,
  args: {
    multiple: true,
    disabled: false,
    drag: true,
    preview: true,
  },
  parameters: {
    docs: { description: { story: 'Large Upload.' } },
  },
};

export const Small: Story = {
  render: (args) => <Upload {...args} className="p-2 text-xs" />,
  args: {
    multiple: false,
    disabled: false,
    drag: false,
    preview: false,
  },
  parameters: {
    docs: { description: { story: 'Small Upload.' } },
  },
};

export const A11y: Story = {
  render: (args) => <Upload {...args} aria-label="File upload area" />,
  args: {
    multiple: true,
    disabled: false,
    drag: true,
    preview: false,
  },
  parameters: {
    docs: { description: { story: 'A11y (accessible) Upload.' } },
  },
};

export const DarkMode: Story = {
  render: (args) => (
    <div className="bg-background-dark p-4">
      <Upload {...args} className="border-primary-dark bg-neutral-800 text-white" />
    </div>
  ),
  args: {
    multiple: true,
    disabled: false,
    drag: true,
    preview: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Upload in dark mode.' } },
  },
};

export const RWD: Story = {
  render: (args) => (
    <div className="w-full max-w-xs sm:max-w-md">
      <Upload {...args} className="w-full" />
    </div>
  ),
  args: {
    multiple: true,
    disabled: false,
    drag: true,
    preview: false,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive Upload.' } },
  },
};
