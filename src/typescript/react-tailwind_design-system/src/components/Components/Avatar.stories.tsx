import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarProps } from './Avatar';

const meta: Meta<AvatarProps> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away', undefined],
    },
    src: { control: 'text' },
    text: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Avatar component supporting image, text, status, shape,\n          and size.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<AvatarProps>;

// Light Mode (default, token-driven)
export const LightMode: Story = {
  args: {
    text: 'LM',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
  },
};

// With Image
export const WithImage: Story = {
  args: {
    src: 'https://randomuser.me/api/portraits/men/32.jpg',
    alt: 'avatar example',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    borderColor: 'white',
  },
};

// With Text
export const WithText: Story = {
  args: {
    text: 'TX',
    size: 'md',
    shape: 'square',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
  },
};

// Status (online)
export const Status: Story = {
  args: {
    text: 'ON',
    status: 'online',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
  },
};

// Responsive (token + className for size)
export const Responsive: Story = {
  args: {
    text: 'R',
    size: 'sm',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
    className: 'w-8 h-8 sm:w-12 sm:h-12',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use custom className to override size for responsive demo (32px on small screens → 48px on large screens).',
      },
    },
  },
};

// Dark Mode (token-driven, requires Storybook backgrounds set to dark)
export const DarkMode: Story = {
  args: {
    text: 'DM',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Avatar style in dark mode (token-driven).' } },
  },
};

// Disabled
export const Disabled: Story = {
  args: {
    text: 'DS',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
    className: 'opacity-50 cursor-not-allowed',
    'aria-disabled': true,
  },
  parameters: {
    docs: { description: { story: 'Non-interactive state (Disabled).' } },
  },
};

// With Icon
export const WithIcon: Story = {
  args: {
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    borderColor: 'white',
    children: (
      <span role="img" aria-label="icon">
        👤
      </span>
    ),
  },
  parameters: {
    docs: { description: { story: 'Use icon as avatar content.' } },
  },
};

// Focus
export const Focus: Story = {
  args: {
    text: 'FO',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
    tabIndex: 0,
    className: 'focus:ring-2 focus:ring-primary focus:outline-none',
  },
  parameters: {
    docs: { description: { story: 'Focusable state (Focus).' } },
  },
};

// Large
export const Large: Story = {
  args: {
    text: 'LG',
    size: 'lg',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
  },
};

// Small
export const Small: Story = {
  args: {
    text: 'SM',
    size: 'sm',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
  },
};

// Rounded (full)
export const Rounded: Story = {
  args: {
    text: 'RD',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
    rounded: 'rounded-full',
  },
  parameters: {
    docs: { description: { story: 'Full rounded Avatar.' } },
  },
};

// Shadow
export const Shadow: Story = {
  args: {
    text: 'SH',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
    shadow: 'shadow-lg',
  },
  parameters: {
    docs: { description: { story: 'Avatar with shadow.' } },
  },
};

// Mobile
export const Mobile: Story = {
  args: {
    text: 'MB',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
    className: 'max-w-[375px] mx-auto',
  },
  parameters: {
    docs: { description: { story: 'Mobile width demo.' } },
  },
};

// Custom Color (token)
export const CustomColor: Story = {
  args: {
    text: 'CC',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
  },
  parameters: {
    docs: { description: { story: 'Custom theme color (token) Avatar.' } },
  },
};

// Status: offline
export const StatusOffline: Story = {
  args: {
    text: 'OF',
    status: 'offline',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
  },
};

// Status: busy
export const StatusBusy: Story = {
  args: {
    text: 'BS',
    status: 'busy',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
  },
};

// Status: away
export const StatusAway: Story = {
  args: {
    text: 'AW',
    status: 'away',
    size: 'md',
    shape: 'circle',
    bg: 'primary',
    textColor: 'white',
    borderColor: 'white',
  },
};
