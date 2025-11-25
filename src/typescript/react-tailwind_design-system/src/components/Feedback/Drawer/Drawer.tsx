import React from 'react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string | number;
  placement?: 'left' | 'right';
  maskClosable?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  width = 320,
  placement = 'right',
  maskClosable = true,
}) => {
  if (!open) return null;
  const positionClass = placement === 'left' ? 'left-0' : 'right-0';
  return (
    <div className="fixed inset-0 z-50 flex">
      {maskClosable && (
        <div
          className="fixed inset-0 bg-neutral-900/60 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed top-0 ${positionClass} h-full bg-white dark:bg-neutral-800 shadow-lg z-50 p-6 flex flex-col`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
      >
        {title && <div className="text-lg font-semibold mb-4">{title}</div>}
        <button
          className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex-1 mb-4">{children}</div>
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  );
};
