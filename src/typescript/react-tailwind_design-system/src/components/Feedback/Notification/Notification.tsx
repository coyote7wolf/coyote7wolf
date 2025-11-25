import React from 'react';

export interface NotificationProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  type = 'info',
  title,
  description,
  action,
  onClose,
}) => {
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
  return (
    <div className={`rounded px-4 py-3 shadow-md ${bgColor} ${textColor}`} role="alert">
      <div className="flex items-center justify-between">
        <div>
          {title && <div className="font-bold mb-1">{title}</div>}
          {description && <div className="text-sm">{description}</div>}
        </div>
        {action && <div className="ml-2">{action}</div>}
        {onClose && (
          <button
            className="ml-2 text-inherit hover:opacity-70"
            onClick={onClose}
            aria-label="close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;
