import React from 'react';

export interface ToastProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  closable?: boolean;
  multiple?: boolean;
  message: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  duration = 3000,
  closable = true,
  multiple = false,
  message,
  onClose,
}) => {
  React.useEffect(() => {
    if (!closable && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [closable, duration, onClose]);

  let bgColor = 'bg-info/90';
  let textColor = 'text-white';
  if (type === 'success') {
    bgColor = 'bg-success/90';
  } else if (type === 'warning') {
    bgColor = 'bg-warning/90';
    textColor = 'text-black';
  } else if (type === 'error') {
    bgColor = 'bg-danger/90';
  }
  const multiClass = multiple ? 'shadow-lg ring-2 ring-primary' : '';
  return (
    <div className={`rounded px-4 py-2 ${bgColor} ${textColor} ${multiClass}`} role="alert">
      <span>{message}</span>
      {closable && (
        <button className="ml-2 text-inherit hover:opacity-70" onClick={onClose} aria-label="close">
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;
