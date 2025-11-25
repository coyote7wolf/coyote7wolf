export const WithSidebar: Story = {
  args: {
    className: 'grid-cols-4 gap-industry-y',
    children: (
      <>
        <aside className="col-span-1 bg-secondary-DEFAULT/90 rounded-l-md p-4 text-white min-h-[240px] flex flex-col gap-2">
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
        <main className="col-span-3 bg-surface-DEFAULT border border-divider-DEFAULT rounded-r-md p-6 min-h-[240px]">
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

// === WithFooter: Grid layout with footer ===
export const WithFooter: Story = {
  args: {
    className: 'grid-cols-1 gap-industry-y',
    children: (
      <>
        <div className="bg-surface-DEFAULT rounded-t-md p-6 min-h-[120px]">Content Area</div>
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

// === Sectioned: Sectioned Grid layout ===
export const Sectioned: Story = {
  args: {
    className: 'grid-cols-1 gap-industry-y',
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

// === ComplexResponsive: Complex responsive Grid layout ===
export const ComplexResponsive: Story = {
  args: {
    className: 'grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-industry-y',
    children: (
      <>
        <div className="md:col-span-2 xl:col-span-3 bg-info-DEFAULT/20 rounded-md p-4 min-h-[80px]">
          Header
        </div>
        <div className="md:col-span-1 xl:col-span-1 bg-secondary-DEFAULT/20 rounded-md p-4 min-h-[80px]">
          Sidebar
        </div>
        <div className="md:col-span-3 xl:col-span-2 bg-surface-DEFAULT border border-divider-DEFAULT rounded-md p-4 min-h-[120px]">
          Main Content
        </div>
        <div className="md:col-span-3 xl:col-span-6 bg-muted-DEFAULT/40 rounded-md p-4 min-h-[60px] text-center">
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
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Grid, GridProps } from './Grid';

const meta: Meta<GridProps> = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 12 } },
    gap: { control: 'text' },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    responsiveFullWidth: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Grid layout component: Default and Responsive implementations (grid-cols-* / md:grid-cols-* / xl:grid-cols-*), demonstrating spacing, nesting, spanning, card, and AutoFit usage.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<GridProps>;

// === Basic: Fixed columns ===
export const Default: Story = {
  args: {
    className: 'grid-cols-industry-4 gap-industry-y',
    children: (
      <>
        {['1', '2', '3', '4'].map((n) => (
          <div
            key={n}
            className="bg-blue-200 h-12 flex items-center justify-center rounded-md shadow-sm"
          >
            {n}
          </div>
        ))}
      </>
    ),
  },
};

// === Responsive: base / md / xl columns ===
export const Responsive: Story = {
  args: {
    className: 'grid-cols-1 md:grid-cols-industry-2 xl:grid-cols-industry-4 gap-industry-y',
    children: (
      <>
        {['A', 'B', 'C', 'D'].map((n) => (
          <div key={n} className="bg-green-200 h-16 flex items-center justify-center rounded-md">
            {n}
          </div>
        ))}
      </>
    ),
  },
};

// === Alignment and distribution ===
export const AlignJustify: Story = {
  args: {
    className: 'grid-cols-industry-3 gap-industry-y items-center justify-between',
    children: (
      <>
        {['X', 'Y', 'Z'].map((n) => (
          <div
            key={n}
            className="bg-yellow-200 h-20 flex items-center justify-center rounded-md w-full"
          >
            {n}
          </div>
        ))}
      </>
    ),
  },
};

// === Differentiated gap example (adjustable via controls) ===
export const VariableGap: Story = {
  args: {
    className: 'grid-cols-industry-4 gap-y-12', // 3rem = 48px
    children: (
      <>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-purple-200 h-12 rounded" />
        ))}
      </>
    ),
  },
};

// === Nested Grid ===
export const Nested: Story = {
  args: {
    className: 'grid-cols-1 md:grid-cols-industry-2 gap-industry-y',
    children: (
      <>
        <div className="bg-pink-100 p-4 rounded-md">
          <div className="grid grid-cols-industry-2 gap-2 mt-2">
            <div className="bg-pink-200 h-10 rounded" />
            <div className="bg-pink-300 h-10 rounded" />
            <div className="bg-pink-200 h-10 rounded" />
            <div className="bg-pink-300 h-10 rounded" />
          </div>
        </div>
        <div className="bg-pink-100 p-4 rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-industry-2 gap-2 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-pink-200 h-10 rounded" />
            ))}
          </div>
        </div>
      </>
    ),
  },
};

// === Spanning columns (col-span-*) ===
export const Spanning: Story = {
  args: {
    className: 'grid-cols-industry-4 gap-industry-y',
    children: (
      <>
        <div className="bg-indigo-200 h-20 col-span-2 flex items-center justify-center rounded">
          span 2
        </div>
        <div className="bg-indigo-300 h-20 rounded" />
        <div className="bg-indigo-400 h-20 rounded" />
        <div className="bg-indigo-300 h-20 rounded" />
        <div className="bg-indigo-400 h-20 rounded" />
      </>
    ),
  },
};

// === Card display (using design tokens) ===
export const Cards: Story = {
  args: {
    className: 'grid-cols-1 md:grid-cols-industry-2 xl:grid-cols-industry-4 gap-y-6',
    children: (
      <>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-DEFAULT dark:bg-surface-dark border border-divider-DEFAULT dark:border-divider-dark rounded-md shadow-dashboard p-4 flex flex-col gap-2"
          >
            <div className="h-8 bg-primary-hover/20 rounded" />
            <div className="h-4 bg-muted-DEFAULT/30 rounded" />
            <div className="h-4 bg-muted-DEFAULT/30 rounded w-2/3" />
          </div>
        ))}
      </>
    ),
  },
};

// === AutoFit (user custom className, no columns/breakpoints set) ===
export const AutoFit: Story = {
  args: {
    className: 'grid-cols-industry-autofit gap-industry-y',
    children: (
      <>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-teal-200 h-14 rounded flex items-center justify-center">
            {i + 1}
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates customizing AutoFit columns directly in className with breakpoints: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4.',
      },
    },
  },
};

// === AutoFitMinMax (repeat(auto-fit, minmax(12rem, 1fr))): dynamically fills available width ===
export const AutoFitMinMax: Story = {
  args: {
    className: 'grid-cols-industry-autofit-minmax gap-industry-y',
    children: (
      <>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-cyan-200 aspect-square flex items-center justify-center rounded-md"
          >
            {i + 1}
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses repeat(auto-fit,minmax(12rem,1fr)) to automatically adjust columns, suitable for card browsing or media galleries. Tailwind arbitrary class: grid-cols-[repeat(auto-fit,minmax(12rem,1fr))].',
      },
    },
  },
};

// === AutoFill (repeat(auto-fill, minmax(10rem, 1fr))): keeps empty space for layout ===
export const AutoFill: Story = {
  args: {
    className: 'grid-cols-industry-autofill gap-industry-y',
    children: (
      <>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-sky-200 h-28 flex items-center justify-center rounded-md">
            {i + 1}
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'repeat(auto-fill, minmax(10rem,1fr)) leaves empty spaces to maintain implicit columns, commonly used for skeleton loading layout transitions.',
      },
    },
  },
};

// === RowGapOnly: only vertical gap (gap-y-*) ===
export const RowGapOnly: Story = {
  args: {
    className: 'grid-cols-industry-3 gap-y-industry',
    children: (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-emerald-500 h-12 flex items-center justify-center text-white rounded"
          >
            {i + 1}
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates using only vertical gap gap-y-industry (from tailwind.config.js token); horizontal gap is 0.',
      },
    },
  },
};

// === ColGapOnly: only horizontal gap (gap-x-*) ===
export const ColGapOnly: Story = {
  args: {
    className: 'grid-cols-industry-4 gap-x-industry',
    children: (
      <>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-rose-200 h-12 rounded" />
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: { story: 'Demonstrates using only horizontal gap gap-x-8; no vertical gap.' },
    },
  },
};

// === DenseFlow: grid-flow-row-dense automatically fills gaps ===
export const DenseFlow: Story = {
  args: {
    className: 'grid-cols-industry-6 gap-industry-y grid-flow-row-dense',
    children: (
      <>
        {[2, 1, 2, 3, 1, 2, 1, 3, 2, 1].map((span, i) => (
          <div
            key={i}
            className={
              span === 1
                ? 'bg-lime-200 h-12 rounded'
                : span === 2
                  ? 'bg-lime-300 h-12 col-span-2 rounded'
                  : 'bg-lime-400 h-12 col-span-3 rounded'
            }
          />
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses grid-flow-row-dense to let the browser try to fill gaps caused by previous column spans, achieving a more compact layout.',
      },
    },
  },
};

// === MasonryLike: simulate masonry layout (using auto-rows and row-span-*) ===
export const MasonryLike: Story = {
  args: {
    className: 'grid-cols-industry-autofill auto-rows-[8px] gap-industry-y',
    children: (
      <>
        {[16, 24, 32, 40, 20, 28, 36, 24, 16, 48, 30, 18].map((h, i) => (
          <div
            key={i}
            style={{ height: h }}
            className="bg-orange-200 rounded flex items-center justify-center text-xs font-medium"
          >
            {h}px
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Masonry effect: auto-rows set the base height and allow each card to set its own height (or use row-span-*). Pure CSS Grid simulates masonry; for real masonry, use JS or a masonry layout.',
      },
    },
  },
};

// === Alignment: control both items and content distribution ===
export const Alignment: Story = {
  args: {
    className:
      'grid-cols-industry-3 gap-industry-y place-items-center place-content-between min-h-[240px] border border-dashed',

    children: (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-fuchsia-200 h-14 w-full rounded flex items-center justify-center"
          >
            {i + 1}
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'place-items-* / place-content-* can control the overall distribution of both cross and main axes.',
      },
    },
  },
};

// === Centered: global centered layout (suitable for empty state / loader) ===
export const Centered: Story = {
  args: {
    className: 'grid-cols-industry-1 gap-industry-y min-h-[200px] place-items-center',
    children: (
      <div className="bg-primary-hover/10 rounded p-6 flex flex-col items-center gap-2">
        <div className="spinner spinner-primary" />
        <span className="text-sm text-muted-DEFAULT">Loading data...</span>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Single-column Grid + place-items-center as a centered block example.',
      },
    },
  },
};

// === AspectRatio: use aspect-* class to create consistent aspect ratio cards ===
export const AspectRatio: Story = {
  args: {
    className:
      'grid-cols-industry-2 md:grid-cols-industry-3 xl:grid-cols-industry-5 gap-industry-y',

    children: (
      <>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-200 aspect-square rounded flex items-center justify-center"
          >
            {i + 1}
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Use aspect-square to create equally scaled cards (built-in Tailwind feature).',
      },
    },
  },
};

// === DarkMode: show card layout in dark mode ===
export const DarkMode: Story = {
  args: {
    className:
      'grid-cols-industry-1 sm:grid-cols-industry-2 md:grid-cols-industry-3 gap-industry-y dark bg-background-dark p-4 rounded-md',

    children: (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-dark border border-border-dark rounded-md p-4 shadow-md text-foreground-dark flex flex-col gap-2"
          >
            <div className="h-6 bg-primary-dark/40 rounded" />
            <div className="h-3 bg-muted-dark/40 rounded" />
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Apply parent .dark to simulate dark mode, using design tokens (background-dark / surface-dark / border-dark).',
      },
    },
  },
};

// === Skeleton: data loading skeleton ===
export const Skeleton: Story = {
  args: {
    className: 'grid-cols-industry-4 gap-industry-y',
    children: (
      <>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted-DEFAULT/30 dark:bg-muted-dark/30 h-16 rounded-md animate-pulse flex flex-col gap-2 p-4"
          >
            <div className="h-4 bg-primary-hover/20 rounded w-2/3" />
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

// === Loading：全域 Loading 狀態 ===
export const Loading: Story = {
  args: {
    className: 'grid-cols-industry-1 gap-industry-y min-h-[200px] place-items-center',
    children: (
      <div className="bg-primary-hover/10 rounded p-6 flex flex-col items-center gap-2">
        <div className="spinner spinner-primary" />
        <span className="text-sm text-muted-DEFAULT">Loading data...</span>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: { story: '全域 Loading 狀態，使用設計 token 色系。' },
    },
  },
};

// === WithNavBar：含導覽列的 Grid 佈局 ===
export const WithNavBar: Story = {
  args: {
    className: 'grid-cols-industry-4 gap-industry-y',
    children: (
      <>
        <div className="col-span-4 mb-2">
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
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-DEFAULT border border-divider-DEFAULT rounded-md p-4 shadow-sm"
          >
            Content {i + 1}
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '常見於 Dashboard 或主頁，Grid 內容區塊上方含有設計 token 色系的 NavBar。',
      },
    },
  },
};
