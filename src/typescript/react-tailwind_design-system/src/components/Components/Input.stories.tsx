import * as React from 'react';
import { Input, InputProps } from './Input';
import type { Meta, StoryObj } from '@storybook/react';

import { FaSearch, FaUser } from 'react-icons/fa';
import type { FC } from 'react';
const IconUser = FaUser as unknown as FC<{ className?: string }>;
const IconSearch = FaSearch as unknown as FC<{ className?: string }>;

const meta: Meta<InputProps> = {
  title: 'Components/Input',
  tags: ['autodocs'],
  component: Input,
  parameters: {
    controls: { expanded: true },
    a11y: { disable: false },
    docs: {
      description: {
        component:
          'Industry-standard Input component supporting multiple styles, sizes, prefix/suffix icons, loading, and disabled states.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<InputProps>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Please enter content...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled',
  },
};

export const Error: Story = {
  args: {
    error: true,
    placeholder: 'Error state',
  },
};

export const WithPrefix: Story = {
  args: {
    prefix: <IconUser />,
    placeholder: 'With prefix icon',
  },
};

export const WithSuffix: Story = {
  args: {
    suffix: <IconSearch />,
    placeholder: 'With suffix icon',
  },
};

export const Small: Story = {
  args: {
    inputSize: 'sm',
    placeholder: 'Small size',
  },
};

export const Large: Story = {
  args: {
    inputSize: 'lg',
    placeholder: 'Large size',
  },
};

export const Responsive: Story = {
  args: {
    className: 'w-full md:w-1/2',
    placeholder: 'Responsive width',
  },
};
export const LightMode: Story = {
  args: {
    className: 'bg-white border text-gray-900 rounded-md',
    placeholder: 'Light Mode',
  },
};

export const DarkMode: Story = {
  args: {
    className: 'bg-gray-900 border text-white rounded-md dark:bg-gray-900 dark:text-white',
    placeholder: 'Dark Mode',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Focus: Story = {
  args: {
    className: 'focus:ring focus:outline-none',
    autoFocus: true,
    placeholder: 'Focus',
  },
};

export const WithPrefixSuffix: Story = {
  args: {
    className: 'flex items-center gap-2',
    prefix: <IconUser />,
    suffix: <IconSearch />,
    placeholder: 'Prefix & Suffix',
  },
};

export const Mobile: Story = {
  args: {
    className: 'max-w-[375px] mx-auto',
    placeholder: 'Mobile',
  },
};
