import type { Meta, StoryObj } from '@storybook/react';
import { Map, MapProps } from './Map';

const meta: Meta<MapProps> = {
  title: 'Advanced/Map',
  component: Map,
  tags: ['autodocs'],
  argTypes: {
    marker: { control: 'object', description: 'Marker position [lat, lng]' },
    area: { control: 'object', description: 'Polygon area [[lat, lng], ...]' },
    interactive: { control: 'boolean' },
    layer: { control: 'object' },
    className: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Map component, supports marker, area, interactive, and layer props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<MapProps>;

export const Default: Story = {
  args: {
    marker: [25.033964, 121.564468],
    area: undefined,
    interactive: true,
    layer: undefined,
  },
};

export const Area: Story = {
  args: {
    marker: [25.033964, 121.564468],
    area: [
      [25.034, 121.564],
      [25.034, 121.566],
      [25.032, 121.566],
      [25.032, 121.564],
    ],
    interactive: true,
    layer: undefined,
  },
};

export const WithCustomLayer: Story = {
  args: {
    marker: [25.033964, 121.564468],
    area: undefined,
    interactive: true,
    layer: (
      <>
        {/* Example: a circle overlay using primary color */}
        <circle
          cx={121.564468}
          cy={25.033964}
          r={200}
          fill="#2563eb33"
          stroke="#2563eb"
          strokeWidth={2}
        />
      </>
    ),
    className: 'border-primary',
  },
};

export const WithDifferentThemes: Story = {
  render: (args) => (
    <div className="grid grid-cols-3 gap-4">
      <Map {...args} className="border-primary" />
      <Map {...args} className="border-secondary" />
      <Map {...args} className="border-success" />
      <Map {...args} className="border-warning" />
      <Map {...args} className="border-danger" />
      <Map {...args} className="border-info" />
    </div>
  ),
  args: {
    marker: [25.033964, 121.564468],
    interactive: true,
  },
};

export const NonInteractive: Story = {
  args: {
    marker: [25.033964, 121.564468],
    interactive: false,
    className: 'border-muted',
  },
};

export const CustomHeight: Story = {
  args: {
    marker: [25.033964, 121.564468],
    interactive: true,
    height: 480,
    className: 'border-info',
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="border rounded bg-skeleton-bg animate-pulse w-full h-80 flex items-center justify-center">
      <div className="w-2/3 h-2/3 bg-skeleton-bg rounded" />
    </div>
  ),
};
