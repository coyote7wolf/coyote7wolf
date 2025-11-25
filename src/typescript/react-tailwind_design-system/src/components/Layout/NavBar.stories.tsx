export const WithSearchBar: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx justify-between',
    children: (
      <>
        <span className="font-bold">Brand</span>
        <input
          type="text"
          placeholder="Search..."
          className="ml-4 px-3 py-1 rounded bg-muted text-navbarText focus:outline-none focus:ring focus:ring-primary"
        />
      </>
    ),
  },
};

export const WithLanguageSwitcher: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx justify-between',
    children: (
      <>
        <span className="font-bold">Brand</span>
        <select className="ml-4 px-3 py-1 rounded bg-info text-info-text focus:outline-none">
          <option>EN</option>
          <option>Traditional Chinese</option>
          <option>Japanese</option>
        </select>
      </>
    ),
  },
};

export const WithUserMenu: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx justify-between',
    children: (
      <>
        <span className="font-bold">Brand</span>
        <div className="relative group ml-4">
          <img
            src="/avatar.svg"
            alt="User"
            className="h-8 w-8 rounded-full border-2 border-primary cursor-pointer"
          />
          <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-navbar text-navbarText p-2 rounded shadow-navbar z-10 min-w-[120px]">
            <a
              href="#"
              className="block px-4 py-2 hover:bg-primary hover:text-primary-text rounded"
            >
              Profile
            </a>
            <a
              href="#"
              className="block px-4 py-2 hover:bg-primary hover:text-primary-text rounded"
            >
              Settings
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-danger hover:text-danger-text rounded">
              Logout
            </a>
          </div>
        </div>
      </>
    ),
  },
};

export const WithTabs: Story = {
  args: {
    className: 'flex flex-col bg-navbar text-navbarText px-navbarPx',
    children: (
      <>
        <div className="flex items-center justify-between h-navbarHeight">
          <span className="font-bold">Brand</span>
          <div className="flex gap-2">
            <button className="bg-primary text-primary-text px-3 py-1 rounded">Login</button>
          </div>
        </div>
        <div className="flex gap-4 border-b border-primary mt-2">
          <button className="py-2 px-4 text-primary border-b-2 border-primary font-bold">
            Home
          </button>
          <button className="py-2 px-4 text-navbarText hover:text-primary">Features</button>
          <button className="py-2 px-4 text-navbarText hover:text-primary">Pricing</button>
        </div>
      </>
    ),
  },
};

export const Transparent: Story = {
  args: {
    className: 'flex items-center bg-transparent text-navbarText px-navbarPx',
    children: <span className="text-navbarText">Transparent NavBar</span>,
  },
};
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavBar } from './NavBar';

const meta: Meta<typeof NavBar> = {
  title: 'Layout/NavBar',
  component: NavBar,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Industry-standard NavBar component: Default, Fixed, Responsive, Logo, Menu, Actions, DarkMode, Mobile, A11y implementation examples.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof NavBar>;

export const Default: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx',
    children: <span className="text-navbarText">Default NavBar</span>,
  },
};

export const Fixed: Story = {
  args: {
    className: 'fixed top-0 w-full z-navbarZ bg-navbar text-navbarText px-navbarPx',
    children: <span className="text-navbarText">Fixed NavBar</span>,
  },
};

export const Responsive: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx sm:px-navbarPxResponsive',
    children: <span className="text-navbarText">Responsive NavBar</span>,
  },
};

export const WithLogo: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx',
    children: (
      <>
        <img src="/logo.svg" alt="Logo" className="h-8 mr-4" />
        <span className="text-navbarText font-bold">NavBar with Logo</span>
      </>
    ),
  },
};

export const WithMenu: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx',
    children: (
      <>
        <span className="font-bold mr-8">Menu</span>
        <nav className="flex gap-4">
          <a href="#" className="hover:underline">
            Home
          </a>
          <a href="#" className="hover:underline">
            About
          </a>
          <a href="#" className="hover:underline">
            Contact
          </a>
        </nav>
      </>
    ),
  },
};

export const WithActions: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx justify-between',
    children: (
      <>
        <span className="font-bold">Brand</span>
        <div className="flex gap-2">
          <button className="bg-primary text-navbarText px-3 py-1 rounded">Login</button>
          <button className="bg-primary text-navbarText px-3 py-1 rounded">Sign Up</button>
        </div>
      </>
    ),
  },
};

export const DarkMode: Story = {
  args: {
    className:
      'flex items-center bg-navbar text-navbarText px-navbarPx dark:bg-navbar-dark dark:text-navbar-dark',
    children: <span className="dark:text-navbar-dark">Dark Mode NavBar</span>,
  },
};

export const Mobile: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx max-w-[375px] mx-auto',
    children: <span className="text-navbarText">Mobile NavBar</span>,
  },
};

export const A11y: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx',
    children: <span className="text-navbarText">A11y NavBar</span>,
  },
};

export const Loading: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx',
    children: (
      <span className="text-navbarText flex items-center gap-2">
        <svg className="animate-spin h-5 w-5 text-navbarText" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading...
      </span>
    ),
  },
};

export const Disabled: Story = {
  args: {
    className:
      'flex items-center bg-navbar text-navbarText px-navbarPx opacity-50 pointer-events-none',
    children: <span className="text-navbarText">Disabled NavBar</span>,
  },
};

export const DropdownMenu: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx',
    children: (
      <>
        <span className="font-bold mr-8">Menu</span>
        <nav className="flex gap-4 relative">
          <div className="group relative">
            <a href="#" className="hover:underline">
              Services
            </a>
            <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-navbar text-navbarText p-2 rounded shadow-lg z-10">
              <a href="#" className="block px-4 py-2 hover:bg-primary">
                Web
              </a>
              <a href="#" className="block px-4 py-2 hover:bg-primary">
                Mobile
              </a>
              <a href="#" className="block px-4 py-2 hover:bg-primary">
                Cloud
              </a>
            </div>
          </div>
          <a href="#" className="hover:underline">
            About
          </a>
          <a href="#" className="hover:underline">
            Contact
          </a>
        </nav>
      </>
    ),
  },
};

export const UserLoggedIn: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx justify-between',
    children: (
      <>
        <span className="font-bold">Brand</span>
        <div className="flex items-center gap-4">
          <img src="/avatar.svg" alt="User" className="h-8 w-8 rounded-full" />
          <button className="bg-primary text-navbarText px-3 py-1 rounded">Logout</button>
        </div>
      </>
    ),
  },
};

export const Notification: Story = {
  args: {
    className: 'flex items-center bg-navbar text-navbarText px-navbarPx justify-between',
    children: (
      <>
        <span className="font-bold">Brand</span>
        <div className="flex items-center gap-4">
          <button className="relative bg-primary text-navbarText px-3 py-1 rounded">
            <span>Notifications</span>
            <span className="absolute -top-2 -right-2 bg-danger text-white rounded-full px-2 text-xs">
              3
            </span>
          </button>
        </div>
      </>
    ),
  },
};

export const CustomTheme: Story = {
  args: {
    className:
      'flex items-center bg-gradient-to-r from-primary via-accent to-warning text-navbarText px-navbarPx h-16 shadow-lg rounded-lg',
    children: (
      <>
        <span className="font-bold text-navbarText text-lg drop-shadow">Custom Theme NavBar</span>
        <nav className="flex gap-6 ml-8">
          <a href="#" className="text-navbarText/80 hover:text-navbarText font-medium transition">
            Home
          </a>
          <a href="#" className="text-navbarText/80 hover:text-navbarText font-medium transition">
            Features
          </a>
          <a href="#" className="text-navbarText/80 hover:text-navbarText font-medium transition">
            Pricing
          </a>
        </nav>
      </>
    ),
  },
};
