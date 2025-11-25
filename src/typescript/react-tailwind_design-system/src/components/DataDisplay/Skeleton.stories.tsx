import type { Meta, StoryObj } from '@storybook/react';
import Skeleton, { SkeletonProps } from './Skeleton';

const meta: Meta<SkeletonProps> = {
  title: 'Data Display/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Tailwind className for skeleton style',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Skeleton component, all style tokens from tailwind.config.js.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<SkeletonProps>;

export const Default: Story = {
  args: {
    className: 'skeleton skeleton--animate skeleton--w-full skeleton--h-6 rounded',
  },
};

export const Animation: Story = {
  args: {
    className: 'skeleton skeleton--animate skeleton--w-full skeleton--h-6 rounded',
  },
};

export const Size: Story = {
  args: {
    className: 'skeleton skeleton--animate skeleton--w-1/2 skeleton--h-12 rounded',
  },
};

export const Responsive: Story = {
  args: {
    className:
      'skeleton skeleton--animate skeleton--w-full skeleton--h-6 rounded sm:skeleton--w-1/2',
  },
};
// --- Added industry-standard stories for Skeleton ---
export const DarkMode: Story = {
  args: {
    className:
      'skeleton skeleton--animate skeleton--w-full skeleton--h-6 rounded bg-background-dark',
  },
};

export const Circle: Story = {
  args: {
    className: 'skeleton skeleton--animate rounded-full skeleton--w-12 skeleton--h-12',
  },
};

export const Text: Story = {
  args: {
    className: 'skeleton skeleton--animate skeleton--w-full skeleton--h-4 rounded',
  },
};

export const Avatar: Story = {
  args: {
    className: 'skeleton skeleton--animate rounded-full skeleton--w-16 skeleton--h-16',
  },
};

export const Card: Story = {
  args: {
    className: 'skeleton skeleton--animate skeleton--w-full skeleton--h-32 rounded-lg',
  },
};

export const Button: Story = {
  args: {
    className: 'skeleton skeleton--animate rounded-full skeleton--w-24 skeleton--h-8',
  },
};

export const List: Story = {
  args: {
    className: 'skeleton skeleton--animate skeleton--w-full skeleton--h-4 rounded mb-2',
  },
};

export const WithChildren: Story = {
  args: {
    className: 'skeleton skeleton--animate skeleton--w-full skeleton--h-10 rounded',
  },
  render: (args) => (
    <div>
      <Skeleton {...args} />
      <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-muted">
        Loading...
      </div>
    </div>
  ),
};
