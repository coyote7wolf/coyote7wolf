import React from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string | number;
  centered?: boolean;
  maskClosable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  width = 520,
  centered = false,
  maskClosable = true,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60">
      <div
        className={`bg-white dark:bg-neutral-800 rounded shadow-lg p-6 relative ${centered ? 'mx-auto my-auto' : ''}`}
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
        <div className="mb-4">{children}</div>
        {footer && <div className="mt-4">{footer}</div>}
      </div>
      {maskClosable && <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />}
    </div>
  );
};
