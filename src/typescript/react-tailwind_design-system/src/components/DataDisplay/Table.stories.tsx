export const DarkMode: Story = {
  args: {
    className: 'bg-table-dark-bg text-table-dark-text',
  },
};

export const Hover: Story = {
  args: {
    className: 'hover:bg-table-hover dark:hover:bg-table-dark-hover',
  },
};

export const Focus: Story = {
  args: {
    className: 'focus:ring focus:outline-none',
  },
};

export const A11y: Story = {
  args: {
    className: '',
    // aria-label, role="table" can be added in Table component
  },
};

export const CustomColor: Story = {
  args: {
    className: 'bg-table-active text-table-active',
  },
};

export const LargeData: Story = {
  args: {
    data: Array.from({ length: 50 }, (_, i) => ({
      name: `User ${i + 1}`,
      age: 20 + (i % 30),
      role: 'Member',
    })),
  },
};

export const WithActions: Story = {
  args: {
    className: '',
    // You can add action column in Table component for demo
  },
};

export const WithFooter: Story = {
  args: {
    className: '',
    // You can add footer row in Table component for demo
  },
};

export const Loading: Story = {
  args: {
    data: [],
    className: 'animate-pulse bg-table-row dark:bg-table-dark-row',
  },
};
import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableProps } from './Table';

const columns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'age', label: 'Age', sortable: true },
  { key: 'role', label: 'Role', filterable: true },
];

const data = [
  { name: 'Alice', age: 24, role: 'Developer' },
  { name: 'Bob', age: 30, role: 'Designer' },
  { name: 'Charlie', age: 28, role: 'Manager' },
];

const meta: Meta<TableProps> = {
  title: 'Data Display/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: { type: 'object' }, description: 'Table columns' },
    data: { control: { type: 'object' }, description: 'Table data' },
    sortable: { control: 'boolean' },
    filterable: { control: 'boolean' },
    paginated: { control: 'boolean' },
    expandable: { control: 'boolean' },
    responsive: { control: 'boolean' },
    className: { control: 'text' },
  },
  args: {
    columns,
    data,
    sortable: false,
    filterable: false,
    paginated: false,
    expandable: false,
    responsive: false,
    className: '',
  },
};
export default meta;

type Story = StoryObj<TableProps>;

export const Default: Story = {};

export const Sortable: Story = {
  args: {
    sortable: true,
  },
};

export const Filterable: Story = {
  args: {
    filterable: true,
  },
};

export const Paginated: Story = {
  args: {
    paginated: true,
  },
};

export const Expandable: Story = {
  args: {
    expandable: true,
  },
};

export const Responsive: Story = {
  args: {
    responsive: true,
  },
};

export const Mobile: Story = {
  args: {
    className: 'max-w-table-mobile mx-table-mobile',
  },
};

export const WithIcon: Story = {
  args: {
    className: 'flex items-center gap-table-icon',
    // Example: add icon in Table cell via custom render
  },
};

export const Empty: Story = {
  args: {
    data: [],
    className: 'text-table-empty',
  },
};

export const Error: Story = {
  args: {
    data: [],
    className: 'text-table-error',
  },
};

export const Size: Story = {
  args: {
    className: 'text-table-xs text-table-sm text-table-lg',
  },
};
