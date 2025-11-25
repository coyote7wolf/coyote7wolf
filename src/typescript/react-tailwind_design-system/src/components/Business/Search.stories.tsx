import type { Meta, StoryObj } from '@storybook/react';
import { Search, SearchProps } from './Search';

const meta: Meta<SearchProps> = {
  title: 'Business/Search',
  component: Search,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    suggestions: { control: false },
    onChange: { action: 'onChange' },
    onSelectSuggestion: { action: 'onSelectSuggestion' },
  },
};
export default meta;

type Story = StoryObj<SearchProps>;

export const Default: Story = {
  args: {
    placeholder: 'Search...',
    suggestions: ['Apple', 'Banana', 'Cherry', 'Date'],
  },
  parameters: {
    docs: { description: { story: 'Default Search using design token.' } },
  },
};

export const DarkMode: Story = {
  args: {
    placeholder: 'Search...',
    suggestions: ['Apple', 'Banana', 'Cherry', 'Date'],
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Search in dark mode.' } },
  },
};

export const Skeleton: Story = {
  args: {
    placeholder: 'Loading...',
    suggestions: ['Loading...', 'Loading...', 'Loading...'],
  },
  parameters: {
    docs: { description: { story: 'Search in loading state (text skeleton only).' } },
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Search...',
    suggestions: [],
  },
  parameters: {
    docs: { description: { story: 'Error state (no suggestions available).' } },
  },
};

export const CustomColor: Story = {
  args: {
    placeholder: 'Custom color',
    suggestions: ['Red', 'Green', 'Blue'],
  },
  parameters: {
    docs: {
      description: { story: 'Custom theme color Search (token support required in component).' },
    },
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Large',
    suggestions: ['Large', 'Normal'],
  },
  parameters: {
    docs: { description: { story: 'Large Search (text-lg support required in component).' } },
  },
};

export const Small: Story = {
  args: {
    placeholder: 'Small',
    suggestions: ['Small', 'Normal'],
  },
  parameters: {
    docs: { description: { story: 'Small Search (text-xs support required in component).' } },
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled',
    suggestions: ['Disabled', 'Normal'],
    // If the component supports the disabled prop, please add it to SearchProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state Search (disabled prop support required in component).',
      },
    },
  },
};

export const A11y: Story = {
  args: {
    placeholder: 'Accessibility',
    suggestions: ['A11y', 'Normal'],
    // If the component supports aria-label/role, please add it to SearchProps
  },
  parameters: {
    docs: {
      description: {
        story: 'Accessibility (A11y) Search (aria/role prop support required in component).',
      },
    },
  },
};
