import React from 'react';

export interface WidgetProps {
  type?: string;
  interactive?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  children?: React.ReactNode;
}

export const Widget: React.FC<WidgetProps> = ({
  type = 'default',
  interactive = false,
  layout = 'vertical',
  className = '',
  children,
}) => {
  return (
    <div
      className={`border border-primary-200 rounded-xl p-4 bg-white ${
        interactive ? 'hover:shadow-lg transition-shadow' : ''
      } ${className}`}
      tabIndex={interactive ? 0 : undefined}
      aria-label={type}
    >
      <div className="text-primary-400 text-sm mb-2">[Widget: {type}]</div>
      <div className={`flex ${layout === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
        {children || 'Widget Content'}
      </div>
    </div>
  );
};

export default Widget;
