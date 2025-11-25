import React from 'react';

export interface StatisticCardProps {
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'flat';
  className?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  value,
  description = '',
  icon,
  trend = 'flat',
  className = '',
}) => {
  return (
    <div className={`border rounded p-4 flex items-center ${className}`}>
      {icon && <span className="mr-2 text-xl">{icon}</span>}
      <div>
        <div className="font-bold text-2xl">{value}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
        {trend && (
          <span className="ml-2 text-sm text-gray-400">
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
    </div>
  );
};
