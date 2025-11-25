import type { Meta, StoryObj } from '@storybook/react';
import { Statistic, StatisticProps } from './Statistic';

const meta: Meta<StatisticProps> = {
  title: 'Data Display/Statistic',
  component: Statistic,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text', description: 'Statistic value' },
    className: { control: 'text', description: 'Tailwind className for statistic style' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard Statistic component, all style tokens from tailwind.config.js.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<StatisticProps>;

export const Default: Story = {
  args: {
    value: '123,456',
    className: 'statistic',
  },
};

export const Trend: Story = {
  args: {
    value: '↑ 8.2%',
    className: 'statistic statistic-trend-up',
  },
};

export const Animation: Story = {
  args: {
    value: '123,456',
    className: 'statistic statistic-animate',
  },
};

export const Responsive: Story = {
  args: {
    value: '123,456',
    className: 'statistic statistic-responsive',
  },
};
export const LightMode: Story = {
  args: {
    value: '123,456',
    className: 'statistic statistic-light',
  },
};

export const DarkMode: Story = {
  args: {
    value: '123,456',
    className: 'statistic statistic-dark text-text-dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Mobile: Story = {
  args: {
    value: '123,456',
    className: 'statistic statistic-mobile',
  },
};

export const Focus: Story = {
  args: {
    value: '123,456',
    className: 'statistic focus:ring focus:outline-none',
  },
};
// --- Added industry-standard stories for Statistic ---
export const WithUnit: Story = {
  args: {
    value: (
      <>
        <span>123,456</span> <span className="ml-1 text-muted">USD</span>
      </>
    ),
    className: 'statistic',
  },
};

export const WithDescription: Story = {
  args: {
    value: (
      <>
        <span>123,456</span> <span className="block text-xs text-muted">Total Revenue</span>
      </>
    ),
    className: 'statistic',
  },
};

export const Error: Story = {
  args: {
    value: 'Error',
    className: 'statistic text-danger',
  },
};

export const WithIcon: Story = {
  args: {
    value: (
      <>
        <span className="inline-block mr-1 text-info">📈</span>123,456
      </>
    ),
    className: 'statistic',
  },
};

export const CustomColor: Story = {
  args: {
    value: '123,456',
    className: 'statistic text-primary',
  },
};

export const Large: Story = {
  args: {
    value: '123,456',
    className: 'statistic text-3xl',
  },
};

export const Small: Story = {
  args: {
    value: '123,456',
    className: 'statistic text-xs',
  },
};

export const Disabled: Story = {
  args: {
    value: '123,456',
    className: 'statistic text-disabled opacity-50',
  },
};

export const A11y: Story = {
  args: {
    value: '123,456',
    className: 'statistic',
    // aria-label, role="status" 可在 Statistic component 補充
  },
};
