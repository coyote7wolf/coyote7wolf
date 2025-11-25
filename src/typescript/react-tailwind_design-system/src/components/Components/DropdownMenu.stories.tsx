import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu, DropdownMenuProps } from './DropdownMenu';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import type { FC } from 'react';

const IconUser = FaUser as unknown as FC<{ className?: string }>;
const IconCog = FaCog as unknown as FC<{ className?: string }>;
const IconSignOut = FaSignOutAlt as unknown as FC<{ className?: string }>;

const items = [
  { label: 'Profile', value: 'profile', icon: <IconUser /> },
  { label: 'Settings', value: 'settings', icon: <IconCog /> },
  { label: 'Logout', value: 'logout', icon: <IconSignOut />, disabled: true },
];

const groupItems = [
  {
    label: 'Account',
    items: [
      { label: 'Profile', value: 'profile', icon: <IconUser /> },
      { label: 'Settings', value: 'settings', icon: <IconCog /> },
    ],
  },
  {
    label: 'Other',
    items: [{ label: 'Logout', value: 'logout', icon: <IconSignOut />, disabled: true }],
  },
];

const meta: Meta<DropdownMenuProps> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  args: {
    trigger: <button className="px-4 py-2 bg-primary text-white rounded">Menu</button>,
    items,
    placement: 'bottom-left',
  },
  argTypes: {
    trigger: { control: false },
    items: { control: false },
    placement: {
      control: 'select',
      options: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
    },
    className: { control: 'text' },
  },
  parameters: {
    controls: { expanded: true },
    a11y: { disable: false },
  },
};
export default meta;
type Story = StoryObj<DropdownMenuProps>;

export const Default: Story = {};

export const WithGroups: Story = {
  args: {
    items: groupItems,
  },
};

export const DarkMode: Story = {
  args: {
    className: 'dark:bg-gray-900 dark:text-mute',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const CustomTrigger: Story = {
  args: {
    trigger: <span className="underline cursor-pointer">Custom Trigger</span>,
  },
};

export const PlacementTopRight: Story = {
  args: {
    placement: 'top-right',
  },
};

export const DisabledItem: Story = {
  args: {
    items: [
      { label: 'Enabled Item', value: 'enabled' },
      { label: 'Disabled Item', value: 'disabled', disabled: true },
    ],
  },
};
