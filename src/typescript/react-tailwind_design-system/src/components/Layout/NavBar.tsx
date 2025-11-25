import React from 'react';

export interface NavBarProps {
  className?: string;
  children?: React.ReactNode;
}

export const NavBar: React.FC<NavBarProps> = ({ className = '', children }) => {
  const base =
    'bg-navbar text-navbarText px-navbarPx h-navbarHeight shadow-navbar flex items-center';
  return <nav className={`${base} ${className}`.trim()}>{children}</nav>;
};

export default NavBar;
