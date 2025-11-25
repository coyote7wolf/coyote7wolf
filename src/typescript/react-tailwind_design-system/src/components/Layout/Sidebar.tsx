import React from 'react';

export interface SidebarProps {
  collapsed?: boolean;
  responsive?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  responsive,
  children,
  className = '',
}) => {
  // Default color scheme: background, text, and border all use tailwind.config.js colors
  let baseClass = 'bg-primary text-primary-text border-r border-primary w-64 min-h-screen';
  if (collapsed)
    baseClass = 'bg-primary text-primary-text border-r border-primary w-16 min-h-screen';
  if (responsive)
    baseClass = 'bg-primary text-primary-text border-r border-primary w-64 min-h-screen md:w-16';
  return <aside className={`${baseClass} ${className}`.trim()}>{children}</aside>;
};
