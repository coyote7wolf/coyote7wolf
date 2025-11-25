import React from 'react';

export interface KPIWidgetProps {
  value: number | string;
  trend?: 'up' | 'down' | 'flat';
  status?: 'success' | 'warning' | 'error' | 'default';
  icon?: React.ReactNode;
  className?: string;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  value,
  trend = 'flat',
  status = 'default',
  icon,
  className = '',
}) => {
  let statusColor = 'text-neutral-500 dark:text-neutral-300';
  if (status === 'success') statusColor = 'text-success dark:text-success-light';
  else if (status === 'warning') statusColor = 'text-warning dark:text-warning-light';
  else if (status === 'error') statusColor = 'text-danger dark:text-danger-light';
  return (
    <div
      className={`border border-primary rounded-md p-4 flex items-center bg-white dark:bg-neutral-900 ${className}`}
    >
      {icon && <span className={`mr-2 text-xl ${statusColor}`}>{icon}</span>}
      <span className={`font-bold text-2xl ${statusColor}`}>{value}</span>
      {trend && (
        <span className="ml-2 text-sm dark:text-white">
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      )}
    </div>
  );
};
