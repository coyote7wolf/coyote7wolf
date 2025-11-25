import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export interface ChartProps {
  type?: 'bar' | 'line' | 'pie';
  data?: Array<{ label: string; value: number; color?: string }>;
  color?: string;
  legend?: boolean;
  animation?: boolean;
  responsive?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export const Chart: React.FC<ChartProps> = ({
  type = 'bar',
  data = [],
  color = '#2563eb',
  legend = true,
  responsive = true,
  className = '',
  width = 320,
  height = 200,
}) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !data || data.length === 0) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    if (type === 'bar') {
      // Bar chart
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const w = width - margin.left - margin.right;
      const h = height - margin.top - margin.bottom;
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([0, w])
        .padding(0.2);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 0])
        .nice()
        .range([h, 0]);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      g.append('g').call(d3.axisLeft(y).ticks(5)).attr('font-size', 10);
      g.append('g')
        .attr('transform', `translate(0,${h})`)
        .call(d3.axisBottom(x))
        .attr('font-size', 10);
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d.label) || 0)
        .attr('y', (d) => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', (d) => h - y(d.value))
        .attr('fill', (d) => d.color || color);
    } else if (type === 'line') {
      // Line chart
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const w = width - margin.left - margin.right;
      const h = height - margin.top - margin.bottom;
      const x = d3
        .scalePoint()
        .domain(data.map((d) => d.label))
        .range([0, w]);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 0])
        .nice()
        .range([h, 0]);
      const line = d3
        .line<{ label: string; value: number }>()
        .x((d) => x(d.label) || 0)
        .y((d) => y(d.value));
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      g.append('g').call(d3.axisLeft(y).ticks(5)).attr('font-size', 10);
      g.append('g')
        .attr('transform', `translate(0,${h})`)
        .call(d3.axisBottom(x))
        .attr('font-size', 10);
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);
      g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => x(d.label) || 0)
        .attr('cy', (d) => y(d.value))
        .attr('r', 3)
        .attr('fill', color);
    } else if (type === 'pie') {
      // Pie chart
      const radius = Math.min(width, height) / 2 - 10;
      const pie = d3.pie<{ label: string; value: number; color?: string }>().value((d) => d.value);
      const arc = d3
        .arc<d3.PieArcDatum<{ label: string; value: number; color?: string }>>()
        .innerRadius(0)
        .outerRadius(radius);
      const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
      const arcs = g.selectAll('arc').data(pie(data)).enter().append('g');
      arcs
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => d.data.color || d3.schemeCategory10[i % 10] || color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);
      arcs
        .append('text')
        .attr('transform', (d) => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', '#333')
        .text((d) => d.data.label);
    }
  }, [type, data, color, width, height]);

  return (
    <div
      className={`border border-primary rounded-md p-4 bg-white dark:bg-neutral-900 ${className}`}
      style={{ width: responsive ? '100%' : width, maxWidth: width }}
    >
      <svg
        ref={ref}
        width={responsive ? '100%' : width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      ></svg>
      {legend && type !== 'pie' && data.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {data.map((d) => (
            <span key={d.label} className="inline-flex items-center gap-1">
              <span
                style={{
                  background: d.color || color,
                  width: 10,
                  height: 10,
                  display: 'inline-block',
                  borderRadius: 2,
                }}
              />
              {d.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
