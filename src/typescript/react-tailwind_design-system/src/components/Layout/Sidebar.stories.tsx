import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  argTypes: {
    collapsed: { control: 'boolean' },
    responsive: { control: 'boolean' },
    children: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: <div className="p-4">Default Sidebar (w-64)</div>,
  },
};

export const Collapsed: Story = {
  args: {
    collapsed: true,
    responsive: false,
    children: <div className="p-4">Collapsed Sidebar (w-16)</div>,
  },
};

export const Responsive: Story = {
  args: {
    collapsed: false,
    responsive: true,
    children: <div className="p-4">Responsive Sidebar (w-64 → w-16 on sm)</div>,
  },
};

export const CustomContent: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">Sidebar Title</h2>
        <ul className="space-y-2">
          <li>
            <a href="#" className="block text-sidebar-text">
              Item 1
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Item 2
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Item 3
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithActiveItem: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="block text-primary font-bold bg-primary/10 rounded">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Settings
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Profile
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithIcons: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center space-x-2 text-sidebar-text">
              <span role="img" aria-label="dashboard">
                📊
              </span>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-2 text-sidebar-text">
              <span role="img" aria-label="settings">
                ⚙️
              </span>
              <span>Settings</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-2 text-sidebar-text">
              <span role="img" aria-label="profile">
                👤
              </span>
              <span>Profile</span>
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithSubMenu: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <span className="block text-sidebar-text font-bold">Analytics</span>
            <ul className="ml-4 space-y-1">
              <li>
                <a href="#" className="block text-sidebar-text">
                  Overview
                </a>
              </li>
              <li>
                <a href="#" className="block text-sidebar-text">
                  Reports
                </a>
              </li>
            </ul>
          </li>
          <li>
            <span className="block text-sidebar-text font-bold">Settings</span>
            <ul className="ml-4 space-y-1">
              <li>
                <a href="#" className="block text-sidebar-text">
                  Profile
                </a>
              </li>
              <li>
                <a href="#" className="block text-sidebar-text">
                  Security
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithUserInfo: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src="https://i.pravatar.cc/40"
            alt="avatar"
            className="rounded-full w-10 h-10 border-2 border-primary"
          />
          <div>
            <div className="font-bold text-primary">Jane Doe</div>
            <div className="text-xs text-info">Admin</div>
          </div>
        </div>
        <ul className="space-y-2">
          <li>
            <a href="#" className="block text-sidebar-text">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Settings
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const DarkTheme: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4 bg-gray-900 text-white min-h-screen">
        <ul className="space-y-2">
          <li>
            <a href="#" className="block text-white">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block text-white">
              Settings
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithSectionTitles: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <div className="mb-2 text-xs font-bold text-gray-500">MAIN</div>
        <ul className="space-y-2 mb-4">
          <li>
            <a href="#" className="block text-sidebar-text">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Analytics
            </a>
          </li>
        </ul>
        <div className="mb-2 text-xs font-bold text-gray-500">MANAGEMENT</div>
        <ul className="space-y-2">
          <li>
            <a href="#" className="block text-sidebar-text">
              Users
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Settings
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithFooterActions: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="flex flex-col h-full p-4">
        <ul className="space-y-2 flex-1">
          <li>
            <a href="#" className="block text-sidebar-text">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Profile
            </a>
          </li>
        </ul>
        <div className="pt-4 border-t border-primary mt-4">
          <button className="w-full py-2 text-sm text-danger hover:bg-danger/10 rounded">
            Logout
          </button>
        </div>
      </div>
    ),
  },
};

export const WithNotificationBadge: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <ul className="space-y-2">
          <li className="flex items-center justify-between">
            <a href="#" className="block text-sidebar-text">
              Inbox
            </a>
            <span className="inline-block bg-danger text-danger-text text-xs px-2 py-0.5 rounded-full">
              3
            </span>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Tasks
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithHoverActiveState: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="block text-sidebar-text hover:bg-primary/10 active:bg-primary/20 rounded"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block text-sidebar-text hover:bg-primary/10 active:bg-primary/20 rounded"
            >
              Settings
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithDisabledItems: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="block text-sidebar-text opacity-50 cursor-not-allowed"
              tabIndex={-1}
              aria-disabled="true"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              Settings
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithExternalLinks: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sidebar-text"
            >
              Google
            </a>
          </li>
          <li>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sidebar-text"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const WithSVGIcons: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center space-x-2 text-sidebar-text">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 13h2v-2H3v2zm4 0h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2z" />
              </svg>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-2 text-sidebar-text">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              <span>Activity</span>
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const ColorVariants: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <Sidebar {...args} className="bg-primary text-primary-text" />
      <Sidebar {...args} className="bg-secondary text-secondary-text" />
      <Sidebar {...args} className="bg-success text-success-text" />
      <Sidebar {...args} className="bg-warning text-warning-text" />
      <Sidebar {...args} className="bg-danger text-danger-text" />
      <Sidebar {...args} className="bg-info text-info-text" />
      <Sidebar {...args} className="bg-muted text-muted-text" />
    </div>
  ),
  args: {
    collapsed: false,
    responsive: false,
    children: <div className="p-4">Color Variant Sidebar</div>,
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-64 h-96 bg-skeleton-bg animate-pulse rounded flex flex-col p-4">
      <div className="h-8 bg-skeleton-bg rounded mb-4 w-3/4" />
      <div className="h-6 bg-skeleton-bg rounded mb-2 w-2/3" />
      <div className="h-6 bg-skeleton-bg rounded mb-2 w-1/2" />
      <div className="h-6 bg-skeleton-bg rounded mb-2 w-1/3" />
    </div>
  ),
};

export const MiniSidebar: Story = {
  args: {
    collapsed: true,
    responsive: false,
    children: (
      <div className="flex flex-col items-center py-4 space-y-6">
        <span className="text-xl">🏠</span>
        <span className="text-xl">📊</span>
        <span className="text-xl">⚙️</span>
      </div>
    ),
  },
};

export const SidebarWithHeader: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <div className="mb-4 text-2xl font-bold text-primary">LOGO</div>
        <ul className="space-y-2">
          <li>
            <a href="#" className="block text-sidebar-text">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="block text-sidebar-text">
              About
            </a>
          </li>
        </ul>
      </div>
    ),
  },
};

export const SidebarWithCustomBg: Story = {
  args: {
    collapsed: false,
    responsive: false,
    children: (
      <div className="p-4">
        <div className="mb-2 text-lg font-bold text-white">Custom BG</div>
        <ul className="space-y-2">
          <li>
            <a href="#" className="block text-white">
              Item 1
            </a>
          </li>
          <li>
            <a href="#" className="block text-white">
              Item 2
            </a>
          </li>
        </ul>
      </div>
    ),
    className: 'bg-gradient-to-b from-primary to-info',
  },
};
