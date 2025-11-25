import React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  multiline?: boolean;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  multiline = false,
  children,
}) => {
  // Simplified version: only displays props, full interaction not implemented
  return (
    <span className="relative group inline-block">
      {children}
      <span
        className={`absolute z-10 hidden group-hover:block bg-tooltip text-tooltip text-xs rounded px-2 py-1 whitespace-pre-line ${
          multiline ? 'whitespace-pre-line' : ''
        }`}
        style={{
          top: placement === 'top' ? '-2em' : undefined,
          bottom: placement === 'bottom' ? '-2em' : undefined,
          left: placement === 'left' ? '-4em' : undefined,
          right: placement === 'right' ? '-4em' : undefined,
        }}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
