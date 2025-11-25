import React from 'react';

export interface TimelineItem {
  label: string;
  status?: 'default' | 'success' | 'error' | 'pending';
  date?: string;
  icon?: React.ReactNode;
  dot?: React.ReactNode;
  alternate?: boolean;
  customDot?: React.ReactNode;
}

export interface TimelineProps {
  items?: TimelineItem[];
  className?: string;
  horizontal?: boolean;
  loading?: boolean;
  empty?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'lg';
  a11yLabel?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  items = [],
  className = '',
  horizontal = false,
  loading = false,
  empty = false,
  disabled = false,
  size,
  a11yLabel,
}) => {
  if (loading) {
    return (
      <div
        className={`timeline timeline-loading bg-timeline-bg rounded-timeline px-timeline-px py-timeline-py animate-timeline-loading ${className}`}
      >
        Loading...
      </div>
    );
  }
  if (empty || items.length === 0) {
    return (
      <div
        className={`timeline timeline-empty bg-timeline-bg rounded-timeline px-timeline-px py-timeline-py text-timeline-empty text-timeline-center ${className}`}
      >
        No events
      </div>
    );
  }
  return (
    <ul
      className={`timeline ${horizontal ? 'timeline-horizontal' : 'timeline-vertical'} bg-timeline-bg rounded-timeline px-timeline-px py-timeline-py ${size === 'sm' ? 'px-timeline-px-sm py-timeline-py-sm text-timeline-sm' : ''} ${size === 'lg' ? 'px-timeline-px-lg py-timeline-py-lg text-timeline-lg' : ''} ${disabled ? 'bg-timeline-disabled opacity-timeline-disabled cursor-timeline-not-allowed' : ''} ${className}`}
      aria-label={a11yLabel}
      role="list"
    >
      {items.map((item, idx) => (
        <li
          key={idx}
          className={`timeline-item ${item.status ? `timeline-${item.status}` : ''} ${item.alternate ? 'timeline-alternate' : ''}`}
        >
          <div className="timeline-item-content gap-timeline-gap">
            {item.icon && <span className="timeline-icon">{item.icon}</span>}
            {item.customDot ? (
              <span className="timeline-dot-custom">{item.customDot}</span>
            ) : (
              <span className="timeline-dot"></span>
            )}
            <span className="timeline-label">{item.label}</span>
            {item.date && <span className="timeline-date text-timeline-date">{item.date}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
};
export default Timeline;
