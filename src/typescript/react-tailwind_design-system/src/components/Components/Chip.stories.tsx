import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip, ChipProps } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Chip component using dedicated chip tokens (bg-chip, text-chip, hover, active, selected). Distinct from Badge (passive) & Tag (categorization). Stories cover foundational variants.',
      },
    },
  },
  args: {
    children: 'Chip',
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Filled: Story = {
  args: {
    children: 'Filled',
    variant: 'filled',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'With Icon',
    icon: <span>★</span>,
    variant: 'filled',
  },
};

export const Closable: Story = {
  args: {
    children: 'Closable',
    closable: true,
    variant: 'filled',
  },
  argTypes: {
    onClose: { action: 'closed' },
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Elevated: Story = {
  args: {
    children: 'Elevated',
    variant: 'elevated',
  },
};

export const Selected: Story = {
  args: {
    children: 'Selected',
    variant: 'filled',
    selected: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-2 items-center flex-wrap">
      <Chip size="sm" className="bg-primary text-white">
        Small
      </Chip>
      <Chip size="md" className="bg-primary text-white">
        Medium
      </Chip>
      <Chip size="lg" className="bg-primary text-white">
        Large
      </Chip>
    </div>
  ),
};

export const Responsive: Story = {
  render: (args: ChipProps) => (
    <div className="space-y-2">
      <Chip {...args} className="w-full sm:w-auto" variant="filled">
        Full width on mobile
      </Chip>
      <Chip {...args} className="w-full sm:w-auto" variant="outline">
        Adaptive layout
      </Chip>
    </div>
  ),
};

export const InteractiveDemo: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string[]>([]);
    const items = ['Analytics', 'Finance', 'HR', 'Security'];
    return (
      <div className="flex gap-2 flex-wrap">
        {items.map((i) => {
          const isSel = selected.includes(i);
          return (
            <Chip
              key={i}
              selected={isSel}
              onClick={() =>
                setSelected((prev) =>
                  prev.includes(i) ? prev.filter((p) => p !== i) : [...prev, i],
                )
              }
              variant="filled"
            >
              {i}
            </Chip>
          );
        })}
      </div>
    );
  },
};
