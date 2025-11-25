import React from 'react';
import { Chart } from '../Advanced/Chart';

export interface AnalyticsDashboardProps {
  title?: string;
  charts: Array<{ type: 'bar' | 'line' | 'pie'; data: any; title?: string }>;
  filters?: React.ReactNode;
  responsive?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  title,
  charts,
  filters,
  responsive = true,
}) => {
  return (
    <div className={responsive ? 'p-6 space-y-6' : 'p-4'}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      {filters && <div className="mb-4">{filters}</div>}
      <div
        className={responsive ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-wrap gap-4'}
      >
        {charts.map((chart, i) => (
          <div key={i} className="bg-white rounded shadow p-4">
            {chart.title && <div className="font-semibold mb-2">{chart.title}</div>}
            <Chart type={chart.type} data={chart.data} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
