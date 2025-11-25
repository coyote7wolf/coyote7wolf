import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsProps } from './Tabs';
import { FaRegWindowRestore, FaUser, FaCog } from 'react-icons/fa';

const meta: Meta<TabsProps> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {
    tabs: [
      { label: 'Home', value: 'home' },
      { label: 'Profile', value: 'profile' },
      { label: 'Settings', value: 'settings' },
    ],
    value: 'home',
    onChange: () => {},
  },
};
export default meta;

type Story = StoryObj<TabsProps>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    tabs: [
      {
        label: <>{FaRegWindowRestore({})} Home</>,
        value: 'home',
      },
      {
        label: <>{FaUser({})} Profile</>,
        value: 'profile',
      },
      {
        label: <>{FaCog({})} Settings</>,
        value: 'settings',
      },
    ],
  },
};

export const LightMode: Story = {
  args: {
    className: 'bg-white text-primary',
  },
};

export const DarkMode: Story = {
  args: {
    className: 'bg-gray-900 text-white dark:bg-gray-900 dark:text-white',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    className: 'text-gray-400 opacity-50',
  },
};

export const Hover: Story = {
  args: {
    className: 'hover:bg-primary/10',
  },
};

export const Focus: Story = {
  args: {
    className: 'focus:ring focus:outline-none',
  },
};

export const Size: Story = {
  args: {
    className: 'text-navigationTabs-size-sm',
  },
};

export const LargeSize: Story = {
  args: {
    className: 'text-navigationTabs-size-lg',
  },
};

export const Closable: Story = {
  args: {
    closable: true,
    className: 'close-btn cursor-pointer',
  },
};

export const Responsive: Story = {
  args: {
    className: 'sm:flex-row',
  },
};

export const Mobile: Story = {
  args: {
    className: 'max-w-[navigationTabs-maxWidth-mobile] mx-auto',
  },
};

export const WithBadge: Story = {
  args: {
    tabs: [
      {
        label: (
          <>
            <span className="badge">1</span> Home
          </>
        ),
        value: 'home',
      },
      {
        label: (
          <>
            <span className="badge">2</span> Profile
          </>
        ),
        value: 'profile',
      },
      {
        label: (
          <>
            <span className="badge">3</span> Settings
          </>
        ),
        value: 'settings',
      },
    ],
    className: 'badge items-center',
  },
};

export const WithCounter: Story = {
  args: {
    tabs: [
      {
        label: (
          <>
            <span className="counter">99+</span> Home
          </>
        ),
        value: 'home',
      },
      {
        label: (
          <>
            <span className="counter">5</span> Profile
          </>
        ),
        value: 'profile',
      },
      {
        label: (
          <>
            <span className="counter">0</span> Settings
          </>
        ),
        value: 'settings',
      },
    ],
    className: 'counter items-center',
  },
};

export const Vertical: Story = {
  args: {
    vertical: true,
    className: 'flex-col border-l',
  },
};

export const Animation: Story = {
  args: {
    className: 'transition-colors duration-200',
  },
};

export const A11y: Story = {
  args: {
    'aria-label': 'Tabs',
    role: 'tablist',
  },
};
