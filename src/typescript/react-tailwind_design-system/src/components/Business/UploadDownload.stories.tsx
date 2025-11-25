import type { Meta, StoryObj } from '@storybook/react';
import { UploadDownload, UploadDownloadProps } from './UploadDownload';

const meta: Meta<UploadDownloadProps> = {
  title: 'Business/UploadDownload',
  component: UploadDownload,
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    progress: { control: 'number' },
    status: {
      control: 'select',
      options: ['idle', 'uploading', 'success', 'error'],
    },
    error: { control: 'text' },
    onUpload: { action: 'onUpload' },
    onDownload: { action: 'onDownload' },
  },
};
export default meta;

type Story = StoryObj<UploadDownloadProps>;

export const Default: Story = {
  args: {
    multiple: true,
    progress: 0,
    status: 'idle',
  },
};

export const Uploading: Story = {
  args: {
    multiple: true,
    progress: 60,
    status: 'uploading',
  },
};

export const Success: Story = {
  args: {
    status: 'success',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    error: 'File format error',
  },
};

export const DarkMode: Story = {
  args: {
    multiple: true,
    progress: 0,
    status: 'idle',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'UploadDownload in dark mode.' } },
  },
};

export const Skeleton: Story = {
  args: {
    multiple: false,
    progress: 0,
    status: 'uploading',
    // If the component supports skeleton/loading prop, please add it to UploadDownloadProps
  },
  parameters: {
    docs: {
      description: {
        story:
          'UploadDownload in loading state (skeleton/loading prop support required in component).',
      },
    },
  },
};

export const CustomColor: Story = {
  args: {
    multiple: true,
    progress: 80,
    status: 'uploading',
    // If the component supports custom color token, please add it to UploadDownloadProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom theme color UploadDownload (token support required in component).',
      },
    },
  },
};

export const Large: Story = {
  args: {
    multiple: true,
    progress: 100,
    status: 'success',
    // If the component supports text-lg, please add it to UploadDownloadProps
  },
  parameters: {
    docs: {
      description: { story: 'Large UploadDownload (text-lg support required in component).' },
    },
  },
};

export const Small: Story = {
  args: {
    multiple: false,
    progress: 0,
    status: 'idle',
    // If the component supports text-xs, please add it to UploadDownloadProps
  },
  parameters: {
    docs: {
      description: { story: 'Small UploadDownload (text-xs support required in component).' },
    },
  },
};

export const Disabled: Story = {
  args: {
    multiple: false,
    progress: 0,
    status: 'idle',
    // If the component supports disabled prop, please add it to UploadDownloadProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state UploadDownload (disabled prop support required in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    multiple: true,
    progress: 0,
    status: 'idle',
    // If the component supports aria-label/role, please add it to UploadDownloadProps
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility (A11y) UploadDownload (aria/role prop support required in component).',
      },
    },
  },
};
