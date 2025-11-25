import React from 'react';
import { Chart } from '../Advanced/Chart';
import { KPIWidget } from '../Advanced/KPIWidget';

export interface KPIDashboardProps {
  kpis: Array<{ label: string; value: number; trend?: number; unit?: string }>;
  charts: Array<{ type: 'bar' | 'line' | 'pie'; data: any }>;
  filters?: React.ReactNode;
  responsive?: boolean;
}

// Helper to map trend number to 'up' | 'down' | 'flat'
function mapTrend(trend?: number): 'up' | 'down' | 'flat' | undefined {
  if (trend === undefined) return undefined;
  if (trend > 0) return 'up';
  if (trend < 0) return 'down';
  return 'flat';
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  kpis,
  charts,
  filters,
  responsive = true,
}) => {
  return (
    <div
      className={responsive ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-4' : 'flex flex-wrap gap-4'}
    >
      {filters && <div className="col-span-full mb-4">{filters}</div>}
      {kpis.map((kpi, i) => (
        <KPIWidget
          key={i}
          value={kpi.value}
          trend={mapTrend(kpi.trend)}
          // label and unit are not props of KPIWidget, so not passed
        />
      ))}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {charts.map((chart, i) => (
          <Chart key={i} type={chart.type} data={chart.data} />
        ))}
      </div>
    </div>
  );
};

export default KPIDashboard;
