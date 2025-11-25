import React, { useRef, useState, useEffect } from 'react';

export interface DropdownMenuItem {
  label: React.ReactNode;
  value?: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownMenuGroup {
  label?: React.ReactNode;
  items: DropdownMenuItem[];
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: (DropdownMenuItem | DropdownMenuGroup)[];
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  placement = 'bottom-left',
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handle(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handle);

    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Keyboard a11y: ESC to close
  useEffect(() => {
    if (!open) return;

    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', handle);

    return () => document.removeEventListener('keydown', handle);
  }, [open]);

  // Positioning
  const menuPosition =
    placement === 'bottom-right'
      ? 'right-0 top-full mt-2'
      : placement === 'top-left'
        ? 'left-0 bottom-full mb-2'
        : placement === 'top-right'
          ? 'right-0 bottom-full mb-2'
          : 'left-0 top-full mt-2';

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        className="focus:outline-none"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          className={`absolute z-50 min-w-[160px] rounded-md border bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none ${menuPosition} ${className}`}
          role="menu"
        >
          <ul className="py-1">
            {items.map((item, i) => {
              if ('items' in item) {
                // Group
                return (
                  <li
                    key={i}
                    className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 select-none"
                  >
                    {item.label && <div className="mb-1 font-semibold">{item.label}</div>}
                    <ul>
                      {item.items.map((sub, j) => (
                        <li key={j}>
                          <button
                            type="button"
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-gray-900 dark:text-primary-darkText hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 rounded transition disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={sub.disabled}
                            tabIndex={sub.disabled ? -1 : 0}
                            role="menuitem"
                            onClick={() => {
                              if (!sub.disabled) {
                                sub.onClick?.();
                                setOpen(false);
                              }
                            }}
                          >
                            {sub.icon && <span>{sub.icon}</span>}
                            {sub.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              } else {
                // Single item
                return (
                  <li key={i}>
                    <button
                      type="button"
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-gray-900 dark:text-primary-darkText hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 rounded transition disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={item.disabled}
                      tabIndex={item.disabled ? -1 : 0}
                      role="menuitem"
                      onClick={() => {
                        if (!item.disabled) {
                          item.onClick?.();
                          setOpen(false);
                        }
                      }}
                    >
                      {item.icon && <span>{item.icon}</span>}
                      {item.label}
                    </button>
                  </li>
                );
              }
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
