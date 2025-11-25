import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette, CommandPaletteProps } from './CommandPalette';

const meta: Meta<CommandPaletteProps> = {
  title: 'Business/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    commands: { control: false },
    onSelect: { action: 'onSelect' },
  },
};
export default meta;

type Story = StoryObj<CommandPaletteProps>;

export const Default: Story = {
  args: {
    placeholder: 'Search command...',
    commands: [
      { label: 'Open Settings', group: 'System', shortcut: '⌘ + ,' },
      { label: 'Switch Theme', group: 'Appearance', shortcut: '⌘ + T' },
      { label: 'Search File', group: 'Search', shortcut: '⌘ + P' },
      { label: 'Show Help', group: 'Help', shortcut: 'F1' },
    ],
  },
  parameters: {
    docs: { description: { story: 'Default CommandPalette using design tokens.' } },
  },
};

export const DarkMode: Story = {
  args: {
    placeholder: 'Search command...',
    commands: [
      { label: 'Open Settings', group: 'System', shortcut: '⌘ + ,' },
      { label: 'Switch Theme', group: 'Appearance', shortcut: '⌘ + T' },
      { label: 'Search File', group: 'Search', shortcut: '⌘ + P' },
      { label: 'Show Help', group: 'Help', shortcut: 'F1' },
    ],
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'CommandPalette in dark mode.' } },
  },
};

export const Skeleton: Story = {
  args: {
    placeholder: 'Loading...',
    commands: [
      { label: 'Loading...', group: 'System' },
      { label: 'Loading...', group: 'Appearance' },
      { label: 'Loading...', group: 'Search' },
      { label: 'Loading...', group: 'Help' },
    ],
  },
  parameters: {
    docs: { description: { story: 'CommandPalette in loading state (text-only Skeleton).' } },
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Search command...',
    commands: [],
  },
  parameters: {
    docs: { description: { story: 'Error state (no commands available).' } },
  },
};

export const CustomColor: Story = {
  args: {
    placeholder: 'Search command...',
    commands: [{ label: 'Custom Color', group: 'Custom', shortcut: '⌘ + C' }],
  },
  parameters: {
    docs: { description: { story: 'Custom theme color CommandPalette.' } },
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Search command...',
    commands: [{ label: 'Large Display', group: 'Size', shortcut: '⌘ + L' }],
  },
  parameters: {
    docs: { description: { story: 'Large CommandPalette.' } },
  },
};

export const Small: Story = {
  args: {
    placeholder: 'Search command...',
    commands: [{ label: 'Small Display', group: 'Size', shortcut: '⌘ + S' }],
  },
  parameters: {
    docs: { description: { story: 'Small CommandPalette.' } },
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Search command...',
    commands: [{ label: 'Disabled', group: 'Status', shortcut: '⌘ + D' }],
    // If the component supports disabled prop, please add it to CommandPaletteProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state CommandPalette (requires disabled prop support in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    placeholder: 'Search command...',
    commands: [{ label: 'Accessibility', group: 'A11y', shortcut: '⌘ + A' }],
    // If the component supports aria-label/role, please add it to CommandPaletteProps
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility (A11y) CommandPalette (requires aria/role prop support in component).',
      },
    },
  },
};
