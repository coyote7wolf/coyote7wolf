import * as React from 'react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: React.ReactNode;
  description?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  showIcon?: boolean;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  description,
  closable = false,
  onClose,
  showIcon = true,
  icon,
  className = '',
  style,
}) => {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;
  let bgColor = 'bg-info/10';
  let borderColor = 'border-info';
  let iconColor = 'text-info';
  if (type === 'success') {
    bgColor = 'bg-success/10';
    borderColor = 'border-success';
    iconColor = 'text-success';
  } else if (type === 'warning') {
    bgColor = 'bg-warning/10';
    borderColor = 'border-warning';
    iconColor = 'text-warning';
  } else if (type === 'error') {
    bgColor = 'bg-danger/10';
    borderColor = 'border-danger';
    iconColor = 'text-danger';
  }
  return (
    <div
      className={`rt-alert flex items-start p-4 rounded border-l-4 ${bgColor} ${borderColor} ${className}`.trim()}
      style={style}
      role="alert"
    >
      {showIcon && icon && <span className={`mr-3 ${iconColor}`}>{icon}</span>}
      <div className="flex-1">
        <div className="rt-alert-message font-medium">{message}</div>
        {description && (
          <div className="rt-alert-description text-sm text-neutral-600 mt-1">{description}</div>
        )}
      </div>
      {closable && (
        <button
          className="ml-4 text-neutral-400 hover:text-neutral-700"
          aria-label="Close"
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
        >
          \u00d7
        </button>
      )}
    </div>
  );
};

export default Alert;
