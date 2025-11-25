import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BackTop, BackTopProps } from './BackTop';

const meta: Meta<BackTopProps> = {
  title: 'Layout/BackTop',
  component: BackTop,
  tags: ['autodocs'],
  argTypes: {
    responsive: { control: 'boolean', description: 'Adds sm:bottom-8 for responsive backtop' },
    className: { control: 'text' },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: 'BackTop button, commonly fixed at the bottom right of the page.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<BackTopProps>;

export const Default: Story = {
  args: {
    className: 'w-12 h-12',
    responsive: false,
  },
};

export const Responsive: Story = {
  args: {
    className: 'w-12 h-12',
    responsive: true,
  },
};

export const CustomColor: Story = {
  args: {
    className: 'w-12 h-12 bg-backtop text-backtopText',
    responsive: false,
  },
};

export const Shadow: Story = {
  args: {
    className: 'w-12 h-12 bg-backtop text-backtopText shadow-lg',
    responsive: false,
  },
};

export const Disabled: Story = {
  args: {
    className: 'w-12 h-12 bg-backtop text-backtopText opacity-50 cursor-not-allowed',
    responsive: false,
    disabled: true,
    'aria-disabled': true,
  },
};

export const Focus: Story = {
  args: {
    className: 'w-12 h-12 bg-backtop text-backtopText focus:ring focus:outline-none',
    responsive: false,
    tabIndex: 0,
  },
};

export const Mobile: Story = {
  args: {
    className: 'w-12 h-12 bg-backtop text-backtopText max-w-[375px] mx-auto',
    responsive: false,
  },
};

export const DarkMode: Story = {
  args: {
    className: 'w-12 h-12 bg-gray-900 text-white',
    responsive: false,
  },
};

export const WithLabel: Story = {
  args: {
    className: 'w-12 h-12 bg-backtop text-backtopText',
    children: <span className="font-bold">Top</span>,
    responsive: false,
  },
};

export const WithIcon: Story = {
  args: {
    className: 'w-12 h-12 bg-backtop text-backtopText',
    children: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" className="fill-current text-backtop" />
        <path
          d="M12 8v8M8 12l4-4 4 4"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    responsive: false,
  },
};

export const ZIndex: Story = {
  args: {
    className: 'w-12 h-12 bg-backtop text-backtopText z-[9999]',
    responsive: false,
  },
};
