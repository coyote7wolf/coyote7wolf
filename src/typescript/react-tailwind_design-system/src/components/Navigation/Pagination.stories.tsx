import type { Meta, StoryObj } from '@storybook/react';
import { Pagination, PaginationProps } from './Pagination';

const meta: Meta<PaginationProps> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    simple: { control: 'boolean', description: 'Simple pagination style' },
    disabled: { control: 'boolean', description: 'Disable all pagination controls' },
    className: { control: 'text' },
    page: { control: 'number', description: 'Current page' },
    pageCount: { control: 'number', description: 'Total pages' },
    onPageChange: { action: 'pageChange' },
  },
  args: {
    page: 1,
    pageCount: 10,
  },
};
export default meta;

type Story = StoryObj<PaginationProps>;

export const Default: Story = {
  args: {
    className: 'flex gap-2 text-primary',
    simple: false,
    disabled: false,
  },
};

export const Simple: Story = {
  args: {
    className: 'flex gap-2 text-primary',
    simple: true,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    className: 'flex gap-2 text-disabled opacity-50',
    simple: false,
    disabled: true,
  },
};

export const Responsive: Story = {
  args: {
    className: 'flex gap-2 text-primary sm:gap-4',
    simple: false,
    disabled: false,
  },
};

export const WithIcons: Story = {
  args: {
    className: 'flex gap-2 text-primary',
    simple: false,
    disabled: false,
    page: 2,
    pageCount: 5,
    // icon prop not in PaginationProps, but you can customize button rendering in real component
  },
};

export const WithLabel: Story = {
  args: {
    className: 'flex gap-2 text-primary',
    simple: true,
    disabled: false,
    page: 3,
    pageCount: 7,
  },
};

export const DarkMode: Story = {
  args: {
    className: 'flex gap-2 bg-neutral-900 text-white p-2 rounded',
    simple: false,
    disabled: false,
  },
};

export const Focus: Story = {
  args: {
    className: 'flex gap-2 text-primary focus:ring focus:outline-none',
    simple: false,
    disabled: false,
  },
};

export const A11y: Story = {
  args: {
    className: 'flex gap-2 text-primary',
    simple: false,
    disabled: false,
    page: 1,
    pageCount: 3,
  },
};

export const CustomColor: Story = {
  args: {
    className: 'flex gap-2 text-primary bg-secondary p-2 rounded',
    simple: false,
    disabled: false,
  },
};

export const Mobile: Story = {
  args: {
    className: 'flex gap-2 text-primary max-w-[375px] mx-auto',
    simple: false,
    disabled: false,
  },
};

export const LargePageCount: Story = {
  args: {
    className: 'flex gap-2 text-primary',
    simple: false,
    disabled: false,
    page: 5,
    pageCount: 20,
  },
};

export const CustomRender: Story = {
  args: {
    className: 'flex gap-2 text-primary',
    simple: false,
    disabled: false,
    page: 2,
    pageCount: 5,
  },
};
