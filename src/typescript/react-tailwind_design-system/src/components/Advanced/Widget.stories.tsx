import type { Meta, StoryObj } from '@storybook/react';

import { Widget, WidgetProps } from './Widget';

const meta: Meta<WidgetProps> = {
  title: 'Advanced/Widget',
  component: Widget,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'text' },
    interactive: { control: 'boolean' },
    layout: { control: 'select', options: ['horizontal', 'vertical'] },
    className: { control: 'text' },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: 'Widget utility component, supports type, interactive, and layout props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<WidgetProps>;

export const Default: Story = {
  args: {
    type: 'default',
    interactive: false,
    layout: 'vertical',
    className: 'border-primary-200 bg-white',
  },
};
export const Interactive: Story = {
  args: {
    type: 'chart',
    interactive: true,
    layout: 'horizontal',
    className: 'border-primary-200 bg-white',
  },
};

export const WithTitleAndContent: Story = {
  args: {
    type: 'info',
    interactive: false,
    layout: 'vertical',
    className: 'border-primary-200 bg-white',
    children: (
      <>
        <div className="font-bold text-primary-700 mb-2">Widget Title</div>
        <div className="text-primary-400">
          This is Widget content, supports custom content and theme color.
        </div>
      </>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    type: 'icon',
    interactive: false,
    layout: 'vertical',
    className: 'border-primary-200 bg-white',
    children: (
      <>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-6 h-6 bg-primary rounded-full" />
          <span className="font-bold text-primary-700">Widget with Icon</span>
        </div>
        <div className="text-primary-400">You can insert icons or other content.</div>
      </>
    ),
  },
};

export const CardStyle: Story = {
  args: {
    type: 'card',
    interactive: true,
    layout: 'vertical',
    className: 'border-primary-200 bg-white shadow-lg rounded-xl',
    children: (
      <>
        <div className="font-bold text-primary-700 mb-2">Card Style Widget</div>
        <div className="text-primary-400">With shadow, rounded corners, and theme color.</div>
      </>
    ),
  },
};

export const WithStatus: Story = {
  args: {
    type: 'status',
    interactive: false,
    layout: 'vertical',
    className: 'border-primary-200 bg-white',
    children: (
      <>
        <div className="font-bold text-success mb-2">Success State Widget</div>
        <div className="text-success">This is a Widget in success state.</div>
      </>
    ),
  },
};

export const WithWarning: Story = {
  args: {
    type: 'warning',
    interactive: false,
    layout: 'vertical',
    className: 'border-primary-200 bg-white',
    children: (
      <>
        <div className="font-bold text-warning mb-2">Warning State Widget</div>
        <div className="text-warning">This is a Widget in warning state.</div>
      </>
    ),
  },
};

export const WithError: Story = {
  args: {
    type: 'error',
    interactive: false,
    layout: 'vertical',
    className: 'border-primary-200 bg-white',
    children: (
      <>
        <div className="font-bold text-danger mb-2">Error State Widget</div>
        <div className="text-danger">This is a Widget in error state.</div>
      </>
    ),
  },
};
