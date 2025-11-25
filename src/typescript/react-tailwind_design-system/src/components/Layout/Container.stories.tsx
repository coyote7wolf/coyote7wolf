// === WithFooter: Container layout with footer ===
export const WithFooter: Story = {
  render: () => (
    <div className="container-industry p-0 rounded-md shadow" style={{ minHeight: 120 }}>
      <div className="p-6 bg-surface-DEFAULT rounded-t-md text-primary-DEFAULT">Content Area</div>
      <footer className="bg-muted-DEFAULT/80 text-muted-foreground rounded-b-md p-4 text-center">
        &copy; 2025 MyCompany. All rights reserved.
      </footer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Commonly used for pages with a footer using design token colors.',
      },
    },
  },
};

// === Sectioned: Sectioned block Container layout ===
export const Sectioned: Story = {
  render: () => (
    <div
      className="container-industry p-0 rounded-md shadow flex flex-col gap-2"
      style={{ minHeight: 120 }}
    >
      <section className="bg-primary-DEFAULT/10 rounded-md p-4 mb-2">
        <span className="font-semibold text-primary-DEFAULT">Section 1</span>
      </section>
      <section className="bg-success-DEFAULT/10 rounded-md p-4 mb-2">
        <span className="font-semibold text-success-DEFAULT">Section 2</span>
      </section>
      <section className="bg-warning-DEFAULT/10 rounded-md p-4">
        <span className="font-semibold text-warning-DEFAULT">Section 3</span>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multi-section layout, commonly used in forms or info pages, all using design token colors.',
      },
    },
  },
};

// === ComplexResponsive: Complex responsive Container layout ===
export const ComplexResponsive: Story = {
  render: () => (
    <div
      className="container-industry p-0 rounded-md shadow flex flex-col md:flex-row gap-2"
      style={{ minHeight: 120 }}
    >
      <div className="md:w-2/3 bg-info-DEFAULT/20 rounded-md p-4 min-h-[60px]">Header</div>
      <div className="md:w-1/3 bg-secondary-DEFAULT/20 rounded-md p-4 min-h-[60px]">Sidebar</div>
      <div className="w-full bg-surface-DEFAULT border border-divider-DEFAULT rounded-md p-4 min-h-[100px]">
        Main Content
      </div>
      <div className="w-full bg-muted-DEFAULT/40 rounded-md p-4 min-h-[40px] text-center">
        Footer
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complex responsive layout, commonly used in dashboards or multi-section pages, all using design token colors.',
      },
    },
  },
};
// === Skeleton: Data loading skeleton ===
export const Skeleton: Story = {
  render: () => (
    <div
      className="container-industry bg-muted-DEFAULT/30 dark:bg-muted-dark/30 animate-pulse flex flex-col gap-2 p-6 rounded-md"
      style={{ minHeight: 120 }}
    >
      <div className="h-4 bg-primary-hover/20 rounded w-2/3 mb-1" />
      <div className="h-3 bg-muted-DEFAULT/40 rounded w-1/2" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Commonly used as a skeleton screen during data loading, all using design token colors.',
      },
    },
  },
};

// === Loading: Global loading state ===
export const Loading: Story = {
  render: () => (
    <div
      className="container-industry bg-primary-hover/10 rounded p-6 flex flex-col items-center gap-2"
      style={{ minHeight: 120 }}
    >
      <div className="spinner spinner-primary" />
      <span className="text-sm text-muted-DEFAULT">Loading data...</span>
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Global loading state using design token colors.' },
    },
  },
};

// === WithNavBar: Container layout with navigation bar ===
export const WithNavBar: Story = {
  render: () => (
    <div className="container-industry p-0 rounded-md shadow" style={{ minHeight: 120 }}>
      <nav className="bg-primary-DEFAULT text-white rounded-t-md px-6 py-3 flex items-center justify-between shadow">
        <span className="font-bold text-lg">MyApp</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary-hover">
            Home
          </a>
          <a href="#" className="hover:text-primary-hover">
            Features
          </a>
          <a href="#" className="hover:text-primary-hover">
            Pricing
          </a>
          <a href="#" className="hover:text-primary-hover">
            About
          </a>
        </div>
      </nav>
      <div className="p-6 bg-surface-DEFAULT border border-divider-DEFAULT rounded-b-md text-primary-DEFAULT">
        Content Area
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Commonly used in dashboards or homepages, with a NavBar using design token colors above the content area.',
      },
    },
  },
};
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Container, ContainerProps } from './Container';

const meta: Meta<ContainerProps> = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    padding: { control: 'text' },
    responsive: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Container component supporting width, padding, and responsive.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<ContainerProps>;

export const Default: Story = {
  render: () => (
    <div className="container-industry" style={{ minHeight: 120 }}>
      Default Container (token class)
    </div>
  ),
};

// FullWidth story 可用 max-w-none + token
export const FullWidth: Story = {
  render: () => (
    <div className="container-full-industry" style={{ minHeight: 120 }}>
      Full Width Container (token class)
    </div>
  ),
};

export const Responsive: Story = {
  render: () => (
    <div className="container-responsive-industry" style={{ minHeight: 120 }}>
      Responsive Container (token class, max-w-xl)
    </div>
  ),
};

export const MaxWidth: Story = {
  render: () => (
    <div className="container-industry" style={{ minHeight: 120, maxWidth: 640 }}>
      Max Width Container (token class, max-w-md)
    </div>
  ),
};

export const Padding: Story = {
  render: () => (
    <div className="container-industry" style={{ minHeight: 120, padding: 32 }}>
      Container with Extra Padding (token class)
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div className="container-industry dark" style={{ minHeight: 120 }}>
      Dark Mode Container (token class)
    </div>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <div className="container-industry" style={{ minHeight: 120, borderRadius: 16 }}>
      Container with Border Radius (token class)
    </div>
  ),
};

export const Shadow: Story = {
  render: () => (
    <div
      className="container-industry"
      style={{ minHeight: 120, boxShadow: '0 2px 12px 0 rgb(0 0 0 / 0.10)' }}
    >
      Container with Shadow (token class)
    </div>
  ),
};

export const Mobile: Story = {
  render: () => (
    <div className="container-industry" style={{ minHeight: 120, maxWidth: 375 }}>
      Mobile Container (token class, max-w-[375px])
    </div>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <div
      className="container-industry"
      style={{ minHeight: 120, background: '#e0e7ef', color: '#142554' }}
    >
      Custom Color Container (token class)
    </div>
  ),
};
