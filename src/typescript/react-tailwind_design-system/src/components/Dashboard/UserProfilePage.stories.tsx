import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import UserProfilePage, { UserProfilePageProps } from './UserProfilePage';

const meta: Meta<UserProfilePageProps> = {
  title: 'Dashboard/User Profile Page',
  component: UserProfilePage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'User profile page component supporting editing, avatar upload, and information display.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<UserProfilePageProps>;

export const Default: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      role: 'Admin',
      bio: 'Passionate about frontend development, focused on React and design systems.',
    },
    actions: <button className="btn bg-primary text-white">Edit Profile</button>,
    stats: [
      { label: 'Posts', value: 24 },
      { label: 'Followers', value: 1200 },
      { label: 'Following', value: 180 },
      { label: 'Favorites', value: 12 },
    ],
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'Default UserProfilePage using design token.' } },
  },
};

export const Skeleton: Story = {
  args: {
    user: {
      name: 'Loading...',
      email: '',
      avatarUrl: '',
      role: '',
      bio: '',
    },
    actions: (
      <button className="btn skeleton skeleton--animate bg-neutral-300 border border-border shadow-sm w-24 h-8" />
    ),
    stats: [
      { label: 'Loading...', value: 0 },
      { label: 'Loading...', value: 0 },
    ],
    responsive: true,
  },
  parameters: {
    docs: { description: { story: 'UserProfilePage in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  args: {
    user: {
      name: 'Custom Color',
      email: 'custom@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'Designer',
      bio: 'Custom theme color test.',
    },
    actions: <button className="btn bg-accent text-white">Custom Action</button>,
    stats: [{ label: 'Custom', value: 1 }],
    responsive: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom theme color UserProfilePage (token support required in component).',
      },
    },
  },
};

export const Large: Story = {
  args: {
    user: {
      name: 'Large Avatar',
      email: 'large@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/99.jpg',
      role: 'VIP',
      bio: 'Large avatar and information.',
    },
    actions: <button className="btn text-lg bg-primary text-white">Large Action</button>,
    stats: [
      { label: 'Posts', value: 999 },
      { label: 'Followers', value: 9999 },
    ],
    responsive: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large UserProfilePage (text-lg/avatar-lg support required in component).',
      },
    },
  },
};

export const Small: Story = {
  args: {
    user: {
      name: 'Small Avatar',
      email: 'small@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
      role: 'User',
      bio: 'Small avatar and information.',
    },
    actions: <button className="btn text-xs bg-primary text-white">Small Action</button>,
    stats: [
      { label: 'Posts', value: 1 },
      { label: 'Followers', value: 10 },
    ],
    responsive: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Small UserProfilePage (text-xs/avatar-xs support required in component).',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    user: {
      name: 'Disabled',
      email: 'disabled@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
      role: 'Suspended',
      bio: 'This account has been disabled.',
    },
    actions: <button className="btn bg-muted text-disabled cursor-not-allowed">Disabled</button>,
    stats: [{ label: 'Posts', value: 0 }],
    responsive: true,
    // If the component supports disabled prop, please add it to UserProfilePageProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state UserProfilePage (disabled prop support required in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    user: {
      name: 'A11y',
      email: 'a11y@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/12.jpg',
      role: 'Accessibility',
      bio: 'Accessibility feature test.',
    },
    actions: (
      <button className="btn bg-primary text-white" aria-label="A11y Action">
        A11y Action
      </button>
    ),
    stats: [{ label: 'Posts', value: 10 }],
    responsive: true,
    // If the component supports aria-label/role, please add it to UserProfilePageProps
  },
  parameters: {
    docs: {
      user: {
        name: '',
        email: '',
        avatarUrl: '',
        role: '',
        bio: '',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    ...Default.args,
    actions: <button className="btn bg-primary text-white">Edit Profile</button>,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'In dark mode, main text and buttons are text-white.' } },
  },
  decorators: [
    (Story) => (
      <div className="text-white">
        <div className="text-muted">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const Mobile: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      role: 'Admin',
      bio: 'Passionate about frontend development, focused on React and design systems.',
    },
    actions: (
      <button className="btn bg-primary text-white w-full py-2 text-base font-semibold">
        Edit Profile
      </button>
    ),
    stats: [
      { label: 'Posts', value: 24 },
      { label: 'Followers', value: 1200 },
      { label: 'Following', value: 180 },
      { label: 'Favorites', value: 12 },
    ],
    responsive: true,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[375px] mx-auto border border-dashboard-border rounded-dashboard shadow-dashboard bg-dashboard-bg px-2 py-4">
        <Story />
      </div>
    ),
  ],
};

export const RWD: Story = {
  args: {
    ...Default.args,
    responsive: true,
  },
};
