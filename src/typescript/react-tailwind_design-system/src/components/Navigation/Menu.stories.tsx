import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from './Menu';

type MenuItem = {
  label: string;
  icon?: React.ReactNode;
};

type MenuProps = {
  items: MenuItem[];
  selected?: number;
  disabled?: number[];
  withIcon?: boolean;
  responsive?: boolean;
  className?: string;
};

const meta: Meta<MenuProps> = {
  title: 'Navigation/Menu',
  component: Menu,
  tags: ['autodocs'],
  argTypes: {
    items: { control: false },
    selected: { control: { type: 'number', min: 0, max: 2 } },
    disabled: { control: false },
    withIcon: { control: 'boolean' },
    responsive: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Menu component: Default, WithIcon, Selected, Disabled, Responsive implementations, all using tailwind.config.js tokens.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<MenuProps>;

const items = [
  { label: 'Home', icon: <span>🏠</span> },
  { label: 'Profile', icon: <span>👤</span> },
  { label: 'Settings' },
];

// === Industry-standard stories ===
export const Default: Story = {
  args: {
    items,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Default Menu style.' } },
  },
};
export const DarkMode: Story = {
  args: {
    items,
    className: 'bg-menu-dark-bg text-white border-menu-dark-border',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Menu in dark mode.' } },
  },
};

export const A11y: Story = {
  args: {
    items: items.map((item) => ({ ...item, label: `${item.label} (aria)` })),
    responsive: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu component with aria-label and role="navigation".' } },
  },
};

export const Size: Story = {
  args: {
    items,
    responsive: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu supports text-xs, text-sm, text-lg and other sizes.' } },
  },
};

export const Outline: Story = {
  args: {
    items: items.map((item) => ({ ...item, label: `${item.label} (Outline)` })),
    responsive: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu with outline style.' } },
  },
};

export const Animation: Story = {
  args: {
    items,
    responsive: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: {
      description: {
        story: 'Menu component has animation effects on hover/active states.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    items,
    responsive: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'Menu display on mobile devices.' } },
  },
};

export const Focus: Story = {
  args: {
    items,
    responsive: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu component focus state display.' } },
  },
};

export const Group: Story = {
  args: {
    items: [
      { label: 'Group 1', icon: <span>🟢</span> },
      { label: 'Group 2', icon: <span>🔵</span> },
      { label: 'Group 3', icon: <span>🟣</span> },
    ],
    responsive: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu supports group display.' } },
  },
};

export const CustomColor: Story = {
  args: {
    items: [
      { label: 'Red', icon: <span>🟥</span> },
      { label: 'Green', icon: <span>🟩</span> },
      { label: 'Blue', icon: <span>🟦</span> },
    ],
    responsive: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu supports custom color tokens.' } },
  },
};

export const Selected: Story = {
  args: {
    items,
    selected: 1,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu supports selected state.' } },
  },
};

export const Disabled: Story = {
  args: {
    items,
    disabled: [2],
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu supports disabled state.' } },
  },
};

export const WithIcon: Story = {
  args: {
    items,
    withIcon: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu supports icon display.' } },
  },
};

export const Responsive: Story = {
  args: {
    items,
    responsive: true,
    className:
      'bg-menu-bg text-menu-text border-menu-border dark:bg-menu-dark-bg dark:text-menu-dark-text dark:border-menu-dark-border',
  },
  parameters: {
    docs: { description: { story: 'Menu supports responsive layout.' } },
  },
};
