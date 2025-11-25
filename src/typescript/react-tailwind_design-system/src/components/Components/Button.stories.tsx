import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { FaCheck, FaPlus, FaSpinner } from 'react-icons/fa';
import type { FC } from 'react';
const IconCheck = FaCheck as unknown as FC<{ className?: string }>;
const IconPlus = FaPlus as unknown as FC<{ className?: string }>;
const IconSpinner = FaSpinner as unknown as FC<{ className?: string }>;

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
  },
  parameters: {
    controls: { expanded: true },
    a11y: { disable: false },
    description: {
      component:
        'Industry-standard Button component supporting multiple styles, sizes, icons, loading, and disabled states.',
    },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};
export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};
export const Outline: Story = {
  args: {
    variant: 'outline',
  },
};
export const Ghost: Story = {
  args: { variant: 'ghost' },
};
export const Text: Story = {
  args: { variant: 'text' },
};
export const Small: Story = {
  args: { size: 'sm' },
};
export const Large: Story = {
  args: { size: 'lg' },
};
export const WithIcon: Story = {
  args: { leftIcon: <IconPlus />, children: 'Add' },
};
export const IconOnly: Story = {
  args: { leftIcon: <IconCheck />, 'aria-label': 'Confirm' },
};
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
    leftIcon: <IconSpinner className="animate-spin" />,
  },
};
export const Disabled: Story = {
  args: { disabled: true },
};
export const Rounded: Story = {
  args: {
    className: 'px-6 rounded-full',
  },
};
export const Shadow: Story = {
  args: {
    className: 'shadow-lg',
  },
};

// Example: Dynamic style binding with token
export const DynamicToken: Story = {
  args: {
    children: 'Dynamic token binding',
    className: 'bg-primary text-white rounded-md shadow-lg',
  },
};
export const Focus: Story = {
  args: { autoFocus: true },
};
export const Responsive: Story = {
  args: { className: 'w-full md:w-auto' },
};
export const DarkMode: Story = {
  args: {
    variant: 'primary',
    children: 'Dark Mode',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Hover: Story = {
  args: {
    variant: 'primary',
    className: 'hover:bg-primary/80 hover:shadow-lg',
    children: 'Hover',
  },
};

export const Mobile: Story = {
  args: {
    variant: 'primary',
    className: 'max-w-[375px] mx-auto',
    children: 'Mobile',
  },
};
