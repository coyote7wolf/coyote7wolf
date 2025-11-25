import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb, BreadcrumbProps } from './Breadcrumb';

const meta: Meta<BreadcrumbProps> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Library', href: '/library' },
      { label: 'Data', href: '/library/data' },
    ],
  },
};
export default meta;

type Story = StoryObj<BreadcrumbProps>;

export const Default: Story = {
  args: {
    className: 'flex items-center text-muted',
  },
};

export const Separator: Story = {
  args: {
    className: 'flex items-center text-muted',
    separator: '/',
  },
};

export const MaxItems: Story = {
  args: {
    className: 'flex items-center text-muted truncate',
    maxItems: 2,
  },
};

export const Responsive: Story = {
  args: {
    className: 'flex items-center text-muted sm:text-base',
  },
};
export const WithIcon: Story = {
  args: {
    items: [
      {
        label: 'Home',
        href: '/',
        icon: (
          <svg width="16" height="16" fill="none">
            <circle cx="8" cy="8" r="8" className="fill-primary" />
          </svg>
        ),
      },
      { label: 'Library', href: '/library' },
      { label: 'Data', href: '/library/data' },
    ],
    className: 'flex items-center text-muted',
  },
};

export const CustomSeparator: Story = {
  args: {
    separator: <span className="mx-2 text-primary">→</span>,
    className: 'flex items-center text-muted',
  },
};

export const CustomColor: Story = {
  args: {
    className: 'flex items-center text-primary bg-background p-2 rounded',
  },
};

export const Disabled: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Library', href: '/library', disabled: true },
      { label: 'Data', href: '/library/data' },
    ],
    className: 'flex items-center text-disabled cursor-not-allowed',
  },
};

export const LastItemAsLink: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Library', href: '/library' },
      { label: 'Data', href: '/library/data', asLink: true },
    ],
    className: 'flex items-center text-muted',
  },
};

export const Overflow: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Section', href: '/section' },
      { label: 'Category', href: '/category' },
      { label: 'Subcategory', href: '/subcategory' },
      { label: 'Item', href: '/item' },
    ],
    maxItems: 3,
    className: 'flex items-center text-muted truncate',
  },
};

export const DarkMode: Story = {
  args: {
    className: 'flex items-center text-text-dark bg-background-dark p-2 rounded',
  },
};

export const Accessibility: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', ariaLabel: 'Home page' },
      { label: 'Library', href: '/library', ariaLabel: 'Library section' },
      { label: 'Data', href: '/library/data', ariaLabel: 'Data details' },
    ],
    className: 'flex items-center text-muted',
  },
};

export const CustomRender: Story = {
  args: {
    items: [
      { label: <span className="font-bold">🏠 Home</span>, href: '/' },
      { label: <span className="italic">Library</span>, href: '/library' },
      { label: <span className="underline">Data</span>, href: '/library/data' },
    ],
    className: 'flex items-center text-muted',
  },
};
// --- Added industry-standard stories for Breadcrumb ---
export const Skeleton: Story = {
  args: {
    items: [
      {
        label: (
          <span className="skeleton skeleton--animate skeleton--w-16 skeleton--h-4 rounded bg-neutral-300 border border-border shadow-sm" />
        ),
      },
      {
        label: (
          <span className="skeleton skeleton--animate skeleton--w-16 skeleton--h-4 rounded bg-neutral-300 border border-border shadow-sm" />
        ),
      },
      {
        label: (
          <span className="skeleton skeleton--animate skeleton--w-16 skeleton--h-4 rounded bg-neutral-300 border border-border shadow-sm" />
        ),
      },
    ],
    className: 'flex items-center',
  },
};
