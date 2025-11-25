import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tag, TagProps } from './Tag';

const meta: Meta<TagProps> = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
    },
    closable: { control: 'boolean' },
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Tag/Chip component supporting color, size, icon, closable, and variant.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<TagProps>;

// === Industry-standard Tag Stories ===

export const LightMode: Story = {
  args: {
    children: 'Category',
    className: 'bg-tag text-tag rounded px-2',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Frontend',
    className: 'bg-tag text-tag rounded px-2 flex items-center gap-1',
    icon: '🏷️',
  },
};

export const Closable: Story = {
  args: {
    children: 'React',
    className: 'bg-tag text-tag rounded px-2 cursor-pointer hover:bg-tag-hover',
    closable: true,
  },
};

export const Responsive: Story = {
  args: {
    children: 'Responsive Tag',
    className: 'w-full sm:w-auto bg-tag text-tag rounded px-2',
  },
};

// === Tag-specific Feature Stories ===

export const Checkable: Story = {
  args: {
    children: 'Selectable',
    className: 'bg-tag text-tag rounded px-2 hover:bg-tag-hover',
    checkable: true,
    onSelect: (selected) => console.log('Selected:', selected),
  },
};

export const Selected: Story = {
  args: {
    children: 'Selected',
    className: 'bg-tag-selected text-tag-selectedText rounded px-2',
    checkable: true,
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    className: 'bg-secondary text-secondary rounded px-2',
    disabled: true,
  },
};

// === Color Variation Stories ===

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag className="bg-primary text-primary-text rounded px-2">Primary</Tag>
      <Tag className="bg-secondary text-secondary rounded px-2">Secondary</Tag>
      <Tag className="bg-success text-success-text rounded px-2">Success</Tag>
      <Tag className="bg-warning text-warning-text rounded px-2">Warning</Tag>
      <Tag className="bg-danger text-danger-text rounded px-2">Danger</Tag>
    </div>
  ),
};

// === Size Variation Stories ===

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Tag className="bg-secondary text-secondary rounded px-2 text-xs">Small</Tag>
      <Tag className="bg-secondary text-secondary rounded px-2 text-sm">Medium</Tag>
      <Tag className="bg-secondary text-secondary rounded px-2 text-lg">Large</Tag>
    </div>
  ),
};

// === Variant Style Stories ===

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag className="bg-secondary text-secondary rounded px-2">Solid</Tag>
      <Tag className="border border-secondary text-secondary bg-transparent rounded px-2">
        Outline
      </Tag>
      <Tag className="bg-secondary/10 text-secondary rounded px-2">Ghost</Tag>
    </div>
  ),
};

// === State Combination Stories ===

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag className="bg-secondary text-secondary rounded px-2">Default</Tag>
      <Tag className="bg-secondary text-secondary rounded px-2 hover:bg-secondary/80">Hover</Tag>
      <Tag className="bg-primary text-primary-text rounded px-2" selected>
        Selected
      </Tag>
      <Tag
        className="bg-secondary text-secondary rounded px-2 opacity-50 cursor-not-allowed"
        disabled
      >
        Disabled
      </Tag>
    </div>
  ),
};

// === Business Scenario Stories ===

export const FilterTags: Story = {
  render: () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Filter by Category:</h4>
      <div className="flex flex-wrap gap-2">
        <Tag className="bg-secondary text-secondary rounded px-2" checkable selected>
          All
        </Tag>
        <Tag className="bg-secondary text-secondary rounded px-2" checkable>
          Frontend
        </Tag>
        <Tag className="bg-secondary text-secondary rounded px-2" checkable>
          Backend
        </Tag>
        <Tag className="bg-secondary text-secondary rounded px-2" checkable>
          DevOps
        </Tag>
        <Tag className="bg-secondary text-secondary rounded px-2" checkable>
          Design
        </Tag>
      </div>
    </div>
  ),
};

export const ArticleTags: Story = {
  render: () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Article Tags:</h4>
      <div className="flex flex-wrap gap-2">
        <Tag className="bg-secondary text-secondary rounded px-2" closable>
          React
        </Tag>
        <Tag className="bg-secondary text-secondary rounded px-2" closable>
          TypeScript
        </Tag>
        <Tag className="bg-secondary text-secondary rounded px-2" closable>
          Storybook
        </Tag>
        <Tag className="bg-secondary text-secondary rounded px-2" closable>
          Design System
        </Tag>
      </div>
    </div>
  ),
};

export const StatusTags: Story = {
  render: () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Status Tags:</h4>
      <div className="flex flex-wrap gap-2">
        <Tag className="bg-success text-success-text rounded px-2" icon="✅">
          Completed
        </Tag>
        <Tag className="bg-warning text-warning-text rounded px-2" icon="⏳">
          In Progress
        </Tag>
        <Tag className="bg-danger text-danger-text rounded px-2" icon="❌">
          Failed
        </Tag>
        <Tag className="bg-secondary text-secondary rounded px-2" icon="⏸️">
          Paused
        </Tag>
      </div>
    </div>
  ),
};

// === Advanced Feature Stories ===

export const TagGroup: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag className="bg-secondary text-secondary rounded px-2" checkable>
        JavaScript
      </Tag>
      <Tag className="bg-secondary text-secondary rounded px-2" checkable selected>
        React
      </Tag>
      <Tag className="bg-secondary text-secondary rounded px-2" closable>
        Vue
      </Tag>
      <Tag className="bg-secondary text-secondary rounded px-2" disabled>
        Angular
      </Tag>
    </div>
  ),
};

export const InteractiveDemo: Story = {
  render: () => {
    const [selectedTags, setSelectedTags] = React.useState<string[]>(['React']);
    const [closedTags, setClosedTags] = React.useState<string[]>([]);

    const technologies = ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js'];

    const toggleTag = (tag: string) => {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
      );
    };

    const closeTag = (tag: string) => {
      setClosedTags((prev) => [...prev, tag]);
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    };

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Interactive Tag Demo:</h4>
        <div className="flex flex-wrap gap-2">
          {technologies
            .filter((tech) => !closedTags.includes(tech))
            .map((tech) => (
              <Tag
                key={tech}
                className={`rounded px-2 ${
                  selectedTags.includes(tech)
                    ? 'bg-primary text-primary-text'
                    : 'bg-secondary text-secondary'
                }`}
                checkable
                closable
                selected={selectedTags.includes(tech)}
                onSelect={() => toggleTag(tech)}
                onClose={() => closeTag(tech)}
              >
                {tech}
              </Tag>
            ))}
        </div>
        <div className="text-xs text-muted">Selected: {selectedTags.join(', ') || 'None'}</div>
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className="bg-gray-900 p-4 rounded">
      <div className="flex flex-wrap gap-2">
        <Tag className="bg-secondary dark:bg-secondary-dark text-secondary dark:text-secondary-dark rounded px-2">
          Dark Theme
        </Tag>
        <Tag
          className="bg-primary dark:bg-primary-dark text-primary-text dark:text-primary-darkText rounded px-2"
          selected
        >
          Selected
        </Tag>
        <Tag className="border border-secondary dark:border-secondary-dark text-secondary dark:text-secondary-dark bg-transparent rounded px-2">
          Outline
        </Tag>
      </div>
    </div>
  ),
};

export const Default: Story = {
  args: {
    children: 'Tag',
    color: 'primary',
    size: 'md',
    variant: 'solid',
  },
};
