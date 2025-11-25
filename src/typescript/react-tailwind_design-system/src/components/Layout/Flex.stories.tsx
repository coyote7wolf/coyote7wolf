// === WithSidebar: Flex layout with sidebar ===
export const WithSidebar: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x',
    children: (
      <>
        <aside className="bg-secondary-DEFAULT/90 rounded-l-md p-4 text-white min-h-[160px] flex flex-col gap-2">
          <span className="font-bold text-lg">Sidebar</span>
          <a href="#" className="hover:text-secondary-hover">
            Dashboard
          </a>
          <a href="#" className="hover:text-secondary-hover">
            Users
          </a>
          <a href="#" className="hover:text-secondary-hover">
            Settings
          </a>
        </aside>
        <main className="flex-1 bg-surface-DEFAULT border border-divider-DEFAULT rounded-r-md p-6 min-h-[160px]">
          <span className="font-semibold text-primary-DEFAULT">Main Content</span>
        </main>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Commonly used in admin dashboards or info pages, with Sidebar on the left and main content on the right, all using design token color schemes.',
      },
    },
  },
};

// === WithFooter: Flex layout with footer ===
export const WithFooter: Story = {
  args: {
    className: 'flex flex-col-industry gap-industry-x',
    children: (
      <>
        <div className="bg-surface-DEFAULT rounded-t-md p-6 min-h-[80px]">Content Area</div>
        <footer className="bg-muted-DEFAULT/80 text-muted-foreground rounded-b-md p-4 text-center">
          &copy; 2025 MyCompany. All rights reserved.
        </footer>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Commonly used with a Footer at the bottom of the page using design token color schemes.',
      },
    },
  },
};

// === Sectioned: Sectioned Flex layout ===
export const Sectioned: Story = {
  args: {
    className: 'flex flex-col-industry gap-industry-x',
    children: (
      <>
        <section className="bg-primary-DEFAULT/10 rounded-md p-4 mb-2">
          <span className="font-semibold text-primary-DEFAULT">Section 1</span>
        </section>
        <section className="bg-success-DEFAULT/10 rounded-md p-4 mb-2">
          <span className="font-semibold text-success-DEFAULT">Section 2</span>
        </section>
        <section className="bg-warning-DEFAULT/10 rounded-md p-4">
          <span className="font-semibold text-warning-DEFAULT">Section 3</span>
        </section>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multi-section layout, commonly used in forms or info pages, all using design token color schemes.',
      },
    },
  },
};

// === ComplexResponsive: Complex responsive Flex layout ===
export const ComplexResponsive: Story = {
  args: {
    className: 'flex flex-col-industry md:flex-row-industry gap-industry-x',
    children: (
      <>
        <div className="md:w-2/3 bg-info-DEFAULT/20 rounded-md p-4 min-h-[60px]">Header</div>
        <div className="md:w-1/3 bg-secondary-DEFAULT/20 rounded-md p-4 min-h-[60px]">Sidebar</div>
        <div className="w-full bg-surface-DEFAULT border border-divider-DEFAULT rounded-md p-4 min-h-[100px]">
          Main Content
        </div>
        <div className="w-full bg-muted-DEFAULT/40 rounded-md p-4 min-h-[40px] text-center">
          Footer
        </div>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complex responsive layout, commonly used in dashboards or multi-section pages, all using design token color schemes.',
      },
    },
  },
};
// === Skeleton: data loading skeleton ===
export const Skeleton: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x',
    children: (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted-DEFAULT/30 dark:bg-muted-dark/30 h-flex-box w-flex-box rounded-md animate-pulse flex flex-col gap-2 p-4"
          >
            <div className="h-4 bg-primary-hover/20 rounded w-2/3 mb-1" />
            <div className="h-3 bg-muted-DEFAULT/40 rounded w-1/2" />
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Commonly used for skeleton screens during data loading, all using design token color schemes.',
      },
    },
  },
};

// === Loading: global loading state ===
export const Loading: Story = {
  args: {
    className:
      'flex flex-row-industry gap-industry-x flex-align-center flex-justify-center min-h-flex-area',
    children: (
      <div className="bg-primary-hover/10 rounded p-6 flex flex-col items-center gap-2 w-full">
        <div className="spinner spinner-primary" />
        <span className="text-sm text-muted-DEFAULT">Loading data...</span>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: { story: 'Global loading state, using design token color schemes.' },
    },
  },
};

// === WithNavBar: Flex layout with NavBar ===
export const WithNavBar: Story = {
  args: {
    className: 'flex flex-col-industry gap-industry-x',
    children: (
      <>
        <nav className="bg-primary-DEFAULT text-white rounded-t-md px-6 py-3 flex items-center justify-between shadow mb-2">
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
        <div className="flex flex-row-industry gap-industry-x bg-surface-DEFAULT border border-divider-DEFAULT rounded-b-md p-4 shadow-sm">
          <div className="flex-1">Content 1</div>
          <div className="flex-1">Content 2</div>
          <div className="flex-1">Content 3</div>
        </div>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Commonly used in dashboards or homepages, with a NavBar above the Flex content area using design token color schemes.',
      },
    },
  },
};
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Flex, FlexProps } from './Flex';

const meta: Meta<FlexProps> = {
  title: 'Layout/Flex',
  component: Flex,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'col'],
    },
    gap: { control: 'text' },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    wrap: { control: 'boolean' },
    responsive: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Flex layout component, supports direction, gap, align, justify, wrap, and responsive.',
      },
    },
  },
  args: {
    className: 'flex flex-row-industry gap-industry-x',
    children: (
      <>
        <div className="bg-flex-row1 h-flex-box w-flex-box">1</div>
        <div className="bg-flex-row2 h-flex-box w-flex-box">2</div>
        <div className="bg-flex-row3 h-flex-box w-flex-box">3</div>
      </>
    ),
  },
};
export default meta;

type Story = StoryObj<FlexProps>;

export const Default: Story = {};

export const Column: Story = {
  args: {
    className: 'flex flex-col-industry gap-industry-x',
    children: (
      <>
        <div className="bg-flex-col1 h-flex-box w-flex-box">A</div>
        <div className="bg-flex-col2 h-flex-box w-flex-box">B</div>
      </>
    ),
  },
};

export const AlignJustify: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x flex-align-center flex-justify-between',
    children: (
      <>
        <div className="bg-flex-align1 h-flex-box w-flex-box">X</div>
        <div className="bg-flex-align2 h-flex-box w-flex-box">Y</div>
        <div className="bg-flex-align3 h-flex-box w-flex-box">Z</div>
      </>
    ),
  },
};

export const Wrap: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x flex-wrap-industry',
    children: (
      <>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-flex-wrap1 h-flex-box w-flex-box-lg m-1">
            {i + 1}
          </div>
        ))}
      </>
    ),
  },
};

export const Responsive: Story = {
  args: {
    className: 'flex flex-col-industry md:flex-row-industry gap-industry-x',
    children: (
      <>
        <div className="bg-flex-resp1 h-flex-box w-flex-box">R1</div>
        <div className="bg-flex-resp2 h-flex-box w-flex-box">R2</div>
        <div className="bg-flex-resp3 h-flex-box w-flex-box">R3</div>
      </>
    ),
  },
};

export const AlignCenter: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x flex-align-center',
    children: (
      <>
        <div className="bg-flex-center1 h-flex-box w-flex-box">A</div>
        <div className="bg-flex-center2 h-flex-box-lg w-flex-box">B</div>
        <div className="bg-flex-center3 h-flex-box-md w-flex-box">C</div>
      </>
    ),
  },
};

export const JustifyCenter: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x flex-justify-center',
    children: (
      <>
        <div className="bg-flex-gap1 h-flex-box w-flex-box">J1</div>
        <div className="bg-flex-gap2 h-flex-box w-flex-box">J2</div>
        <div className="bg-flex-gap3 h-flex-box w-flex-box">J3</div>
      </>
    ),
  },
};

export const Centered: Story = {
  args: {
    className:
      'flex flex-row-industry gap-industry-x flex-align-center flex-justify-center min-h-flex-area',
    children: (
      <>
        <div className="bg-flex-center1 h-flex-box w-flex-box">C1</div>
        <div className="bg-flex-center2 h-flex-box w-flex-box">C2</div>
      </>
    ),
  },
};

export const Gap: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x',
    children: (
      <>
        <div className="bg-flex-gap1 h-flex-box w-flex-box">G1</div>
        <div className="bg-flex-gap2 h-flex-box w-flex-box">G2</div>
        <div className="bg-flex-gap3 h-flex-box w-flex-box">G3</div>
      </>
    ),
  },
};

export const Mobile: Story = {
  args: {
    className: 'flex flex-col-industry gap-industry-x max-w-[375px] mx-auto',
    children: (
      <>
        <div className="bg-flex-mobile1 h-flex-box w-flex-full">M1</div>
        <div className="bg-flex-mobile2 h-flex-box w-flex-full">M2</div>
      </>
    ),
  },
};

export const VerticalCenter: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x flex-align-center min-h-flex-area',
    children: (
      <>
        <div className="bg-flex-vcenter1 h-flex-box-sm w-flex-box">V1</div>
        <div className="bg-flex-vcenter2 h-flex-box-lg w-flex-box">V2</div>
        <div className="bg-flex-vcenter3 h-flex-box-md w-flex-box">V3</div>
      </>
    ),
  },
};

export const SpaceBetween: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x flex-justify-between',
    children: (
      <>
        <div className="bg-flex-between1 h-flex-box w-flex-box">S1</div>
        <div className="bg-flex-between2 h-flex-box w-flex-box">S2</div>
        <div className="bg-flex-between3 h-flex-box w-flex-box">S3</div>
      </>
    ),
  },
};

export const SpaceAround: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x flex-justify-around',
    children: (
      <>
        <div className="bg-flex-around1 h-flex-box w-flex-box">A1</div>
        <div className="bg-flex-around2 h-flex-box w-flex-box">A2</div>
        <div className="bg-flex-around3 h-flex-box w-flex-box">A3</div>
      </>
    ),
  },
};

export const Evenly: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x flex-justify-evenly',
    children: (
      <>
        <div className="bg-flex-evenly1 h-flex-box w-flex-box">E1</div>
        <div className="bg-flex-evenly2 h-flex-box w-flex-box">E2</div>
        <div className="bg-flex-evenly3 h-flex-box w-flex-box">E3</div>
      </>
    ),
  },
};

export const Baseline: Story = {
  args: {
    className: 'flex flex-row-industry gap-industry-x flex-align-baseline',
    children: (
      <>
        <div className="bg-flex-baseline1 h-flex-box-sm w-flex-box">B1</div>
        <div className="bg-flex-baseline2 h-flex-box-lg w-flex-box">B2</div>
        <div className="bg-flex-baseline3 h-flex-box-md w-flex-box">B3</div>
      </>
    ),
  },
};
