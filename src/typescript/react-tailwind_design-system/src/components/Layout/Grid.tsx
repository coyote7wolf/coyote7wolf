import React from 'react';
import clsx from 'clsx';

export interface GridBreakpoints {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed number of columns (mutually exclusive with breakpoints). If not provided, you can fully customize className or use breakpoints. */
  columns?: number;
  /** Tailwind gap spacing key (e.g. 2 / 4 / 6 / 8), default is 4 */
  gap?: string;
  /** Vertical alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Horizontal alignment (main axis distribution) */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Responsive column settings, will automatically generate grid-cols-* breakpoint classes */
  breakpoints?: GridBreakpoints;
  /** Whether to add w-full for easier layout demonstration in stories */
  responsiveFullWidth?: boolean;
  children: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({
  columns,
  gap = '4',
  align = 'stretch',
  justify = 'start',
  breakpoints,
  responsiveFullWidth = true,
  className,
  children,
  ...rest
}) => {
  const base = 'grid';
  const gapClass = `gap-${gap}`;
  const alignClass = align ? `items-${align}` : '';
  const justifyClass = justify ? `justify-${justify}` : '';
  const fullWidthClass = responsiveFullWidth ? 'w-full' : '';

  // Column classes: fixed, responsive, or skip (allows users to write complex AutoFit with className)
  let colsClass = '';
  if (breakpoints) {
    const { base: b, sm, md, lg, xl } = breakpoints;
    colsClass = [
      b ? `grid-cols-${b}` : null,
      sm ? `sm:grid-cols-${sm}` : null,
      md ? `md:grid-cols-${md}` : null,
      lg ? `lg:grid-cols-${lg}` : null,
      xl ? `xl:grid-cols-${xl}` : null,
    ]
      .filter(Boolean)
      .join(' ');
  } else if (columns) {
    colsClass = `grid-cols-${columns}`;
  }

  return (
    <div
      className={clsx(
        base,
        gapClass,
        colsClass,
        alignClass,
        justifyClass,
        fullWidthClass,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Grid;
