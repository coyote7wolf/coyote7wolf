import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Affix, AffixProps } from './Affix';

const meta: Meta<AffixProps> = {
  title: 'Layout/Affix',
  component: Affix,
  tags: ['autodocs'],
  argTypes: {
    responsive: { control: 'boolean', description: 'Adds sm:top-4 for responsive affix' },
    className: { control: 'text' },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Affix fixed positioning component, commonly used for sticky top or bottom scenarios.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<AffixProps>;

export const Default: Story = {
  args: {
    children: <div className="p-4 font-bold">Default Affix (fixed, top-0, shadow)</div>,
    className: 'w-full bg-primary text-primary-text shadow-dashboard z-50',
    responsive: false,
  },
};

export const Responsive: Story = {
  args: {
    children: (
      <div className="p-4 font-bold">Responsive Affix (fixed, top-0, shadow, sm:top-4)</div>
    ),
    className: 'w-full bg-primary text-primary-text shadow-dashboard z-50',
    responsive: true,
  },
};

export const Bottom: Story = {
  args: {
    children: <div className="p-4 font-bold">Bottom Affix (fixed, bottom-0, shadow)</div>,
    className: 'fixed bottom-0 left-0 w-full shadow-dashboard bg-primary text-primary-text z-50',
  },
};

export const Shadow: Story = {
  args: {
    children: <div className="p-4 font-bold">Affix with Extra Shadow</div>,
    className: 'w-full bg-primary text-primary-text shadow-dashboard z-50',
  },
};

export const CustomColor: Story = {
  args: {
    children: <div className="p-4 font-bold text-primary-text">Custom Color Affix</div>,
    className: 'w-full bg-primary z-50',
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <div className="flex items-center justify-between p-4">
        <span className="font-bold">Affix with Content</span>
        <button className="px-3 py-1 rounded bg-secondary text-secondary-text">Action</button>
      </div>
    ),
    className: 'w-full bg-primary text-primary-text shadow-dashboard z-50',
  },
};

export const ZIndex: Story = {
  args: {
    children: <div className="p-4 font-bold">Affix with High Z-Index</div>,
    className: 'w-full bg-primary text-primary-text shadow-dashboard z-[9999]',
  },
};

export const FixedLeft: Story = {
  args: {
    children: <div className="p-4 font-bold">Fixed Left Affix</div>,
    className: 'fixed left-0 top-0 h-full w-16 shadow-dashboard bg-primary text-primary-text',
  },
};

export const FixedRight: Story = {
  args: {
    children: <div className="p-4 font-bold">Fixed Right Affix</div>,
    className: 'fixed right-0 top-0 h-full w-16 shadow-dashboard bg-primary text-primary-text',
  },
};

export const Mobile: Story = {
  args: {
    children: <div className="p-2 font-bold">Mobile Affix</div>,
    className:
      'fixed top-0 left-0 w-full shadow-dashboard bg-primary text-primary-text max-w-[375px] mx-auto',
  },
};

export const DarkMode: Story = {
  args: {
    children: <div className="p-4 font-bold text-info">Dark Mode Affix</div>,
    className: 'w-full bg-info shadow-dashboard z-50',
  },
};

export const Focus: Story = {
  args: {
    children: <div className="p-4 font-bold">Affix with Focus Ring</div>,
    className: 'w-full bg-primary text-primary-text shadow-dashboard focus:ring focus:outline-none',
    tabIndex: 0,
  },
};

export const Disabled: Story = {
  args: {
    children: <div className="p-4 font-bold text-muted">Disabled Affix</div>,
    className: 'w-full bg-muted shadow-dashboard opacity-50 cursor-not-allowed',
    tabIndex: -1,
    'aria-disabled': true,
  },
};
