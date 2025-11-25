import type { Meta, StoryObj } from '@storybook/react';
import { List, ListProps } from './List';

const items = ['Apple', 'Banana', 'Cherry'];

const meta: Meta<ListProps> = {
  title: 'Data Display/List',
  component: List,
  tags: ['autodocs'],
  argTypes: {
    items: { control: { type: 'object' }, description: 'List items' },
    className: { control: 'text' },
    selectable: { control: 'boolean' },
    draggable: { control: 'boolean' },
    responsive: { control: 'boolean' },
    onSelect: { action: 'select' },
    onDragStart: { action: 'dragStart' },
  },
  args: {
    items,
    className: '',
    selectable: false,
    draggable: false,
    responsive: false,
  },
};
export default meta;

type Story = StoryObj<ListProps>;

export const Default: Story = {
  args: {
    className: '',
  },
};

export const Selectable: Story = {
  args: {
    selectable: true,
    className: 'cursor-list-pointer hover:list-hover',
  },
};

export const Draggable: Story = {
  args: {
    draggable: true,
    className: 'draggable',
  },
};

export const Responsive: Story = {
  args: {
    responsive: true,
    className: 'w-list-responsive sm:w-list-sm-responsive',
  },
};

export const Empty: Story = {
  args: {
    items: [],
    className: 'text-list-empty',
  },
};

export const Error: Story = {
  args: {
    items: [],
    className: 'text-list-error',
  },
};

export const Loading: Story = {
  args: {
    items: [],
    className: 'animate-pulse bg-list-row',
  },
};

export const WithIcon: Story = {
  args: {
    items: [
      <span key="apple" className="flex items-center gap-list-icon">
        <span role="img" aria-label="apple">
          🍎
        </span>
        Apple
      </span>,
      <span key="banana" className="flex items-center gap-list-icon">
        <span role="img" aria-label="banana">
          🍌
        </span>
        Banana
      </span>,
      <span key="cherry" className="flex items-center gap-list-icon">
        <span role="img" aria-label="cherry">
          🍒
        </span>
        Cherry
      </span>,
    ],
    className: '',
  },
};

export const Size: Story = {
  args: {
    className: 'text-list-xs text-list-sm text-list-lg',
  },
};

export const A11y: Story = {
  args: {
    className: '',
    // aria-label, role="list" can be added in List component
  },
};

export const CustomColor: Story = {
  args: {
    className: 'bg-list-active text-list-active',
  },
};

export const LargeData: Story = {
  args: {
    items: Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`),
  },
};

export const WithActions: Story = {
  args: {
    items: items.map((item, idx) => (
      <span key={idx} className="flex items-center gap-list-action">
        {item}
        <button className="ml-2 px-2 py-1 bg-list-action rounded-list-action">Action</button>
      </span>
    )),
    className: '',
  },
};

export const WithFooter: Story = {
  args: {
    items: [
      ...items,
      <span key="footer" className="font-bold">
        Footer
      </span>,
    ],
    className: '',
  },
};

export const DarkMode: Story = {
  args: {
    className: 'bg-list-dark-bg text-list-dark-text',
  },
};

export const Hover: Story = {
  args: {
    className: 'hover:list-hover dark:hover:list-dark-hover',
  },
};

export const Focus: Story = {
  args: {
    className: 'focus:ring focus:outline-none',
  },
};

export const Disabled: Story = {
  args: {
    className: 'opacity-list-disabled cursor-not-allowed',
  },
};

export const Mobile: Story = {
  args: {
    className: 'max-w-list-mobile mx-list-mobile',
  },
};
