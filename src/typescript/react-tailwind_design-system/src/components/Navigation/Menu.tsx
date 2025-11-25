import React from 'react';

type MenuItem = {
  label: string;
  icon?: React.ReactNode;
};

type MenuProps = {
  items: MenuItem[];
  selected?: number;
  disabled?: number[];
  withIcon?: boolean;
  responsive?: boolean;
  className?: string;
};

export const Menu: React.FC<MenuProps> = ({
  items,
  selected,
  disabled = [],
  withIcon = false,
  responsive = false,
  className = '',
}) => {
  return (
    <nav className={`flex flex-col gap-2 border ${responsive ? 'sm:flex-row' : ''} ${className}`}>
      {items.map((item, idx) => (
        <button
          key={item.label}
          className={`flex px-4 py-2 rounded transition
            ${selected === idx ? 'bg-menu-active text-menu-active' : ''}
            ${disabled.includes(idx) ? 'opacity-50 cursor-not-allowed' : ''}
            ${withIcon ? 'items-center' : ''}
          `}
          disabled={disabled.includes(idx)}
        >
          {withIcon && item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Menu;
