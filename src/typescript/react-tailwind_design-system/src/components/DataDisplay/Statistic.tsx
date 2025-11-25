import React from 'react';

export interface StatisticProps {
  value: React.ReactNode;
  className?: string;
}
export const Statistic: React.FC<StatisticProps> = ({ value, className = '' }) => {
  return <span className={className}>{value}</span>;
};

export default Statistic;
