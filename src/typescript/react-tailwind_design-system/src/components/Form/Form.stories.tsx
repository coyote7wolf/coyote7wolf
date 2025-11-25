import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Form, FormProps } from './Form';

const meta: Meta<FormProps> = {
  title: 'Form/Form',
  component: Form,
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal', 'inline'],
    },
    className: { control: 'text' },
    style: { control: false },
    onSubmit: { action: 'onSubmit' },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Form component supporting layout, className, and onSubmit props, demonstrating various form layouts.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<FormProps>;

export const Vertical: Story = {
  args: {
    layout: 'vertical',
    children: (
      <>
        <label className="block mb-2">Account</label>
        <input className="input mb-4 border border-neutral-300" placeholder="Enter account" />
        <label className="block mb-2">Password</label>
        <input
          className="input mb-4 border border-neutral-300"
          type="password"
          placeholder="Enter password"
        />
        <button className="btn ml-2 mt-0">Submit</button>
      </>
    ),
  },
};

export const Horizontal: Story = {
  args: {
    layout: 'horizontal',
    children: (
      <>
        <label className="mr-2">Account</label>
        <input className="input mr-4  border border-neutral-300" placeholder="Enter account" />
        <label className="mr-2">Password</label>
        <input
          className="input mr-2 border border-neutral-300"
          type="password"
          placeholder="Enter password"
        />
        <button className="btn ml-2">Submit</button>
      </>
    ),
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <div className="h-40 bg-skeleton rounded animate-pulse" />
    </div>
  ),
  args: {},
  parameters: {
    docs: { description: { story: 'Form in loading state (Skeleton style).' } },
  },
};

export const CustomColor: Story = {
  args: {
    layout: 'vertical',
    className: 'border-2 border-accent p-6 rounded',
    children: (
      <>
        <label className="block mb-2 text-accent">Account</label>
        <input
          className="input mb-4 border-accent focus:border-accent"
          placeholder="Enter account"
        />
        <label className="block mb-2 text-accent">Password</label>
        <input
          className="input mb-4 border-accent focus:border-accent"
          type="password"
          placeholder="Enter password"
        />
        <button className="btn bg-accent text-white">Submit</button>
      </>
    ),
  },
  parameters: {
    docs: { description: { story: 'Custom theme Form (requires token support in component).' } },
  },
};

export const Disabled: Story = {
  args: {
    layout: 'vertical',
    children: (
      <>
        <label className="block mb-2 text-muted">Account</label>
        <input
          className="input mb-4 bg-muted text-white opacity-50 cursor-not-allowed"
          placeholder="Enter account"
          disabled
        />
        <label className="block mb-2 text-muted">Password</label>
        <input
          className="input mb-4 bg-muted text-white opacity-50 cursor-not-allowed"
          type="password"
          placeholder="Enter password"
          disabled
        />
        <button className="btn bg-muted text-white opacity-50 cursor-not-allowed" disabled>
          Submit
        </button>
      </>
    ),
  },
  parameters: {
    docs: { description: { story: 'Disabled Form.' } },
  },
};

export const A11y: Story = {
  args: {
    layout: 'vertical',
    children: (
      <>
        <label htmlFor="a11y-account" className="block mb-2">
          Account
        </label>
        <input
          id="a11y-account"
          className="input mb-4"
          placeholder="Enter account"
          aria-label="Account"
        />
        <label htmlFor="a11y-password" className="block mb-2">
          Password
        </label>
        <input
          id="a11y-password"
          className="input mb-4"
          type="password"
          placeholder="Enter password"
          aria-label="Password"
        />
        <button className="btn" aria-label="Submit">
          Submit
        </button>
      </>
    ),
  },
  parameters: {
    docs: { description: { story: 'A11y (accessible) Form.' } },
  },
};

export const DarkMode: Story = {
  args: {
    layout: 'vertical',
    className: 'bg-neutral-900 p-6 rounded',
    children: (
      <>
        <label className="block mb-2 text-white">Account</label>
        <input
          className="input mb-4 bg-neutral-800 text-white border-neutral-700 focus:border-primary"
          placeholder="Enter account"
        />
        <label className="block mb-2 text-white">Password</label>
        <input
          className="input mb-4 bg-neutral-800 text-white border-neutral-700 focus:border-primary"
          type="password"
          placeholder="Enter password"
        />
        <button className="btn ml-2  text-white">Submit</button>
      </>
    ),
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Form in dark mode.' } },
  },
};

export const RWD: Story = {
  args: {
    layout: 'vertical',
    className: 'w-full max-w-xs sm:max-w-md',
    children: (
      <>
        <label className="block mb-2">Account</label>
        <input className="input mb-4 w-full" placeholder="Enter account" />
        <label className="block mb-2">Password</label>
        <input className="input mb-4 w-full" type="password" placeholder="Enter password" />
        <button className="btn w-full sm:w-auto">Submit</button>
      </>
    ),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'RWD responsive Form.' } },
  },
};
