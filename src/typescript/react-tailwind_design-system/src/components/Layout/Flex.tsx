import React from 'react';
import clsx from 'clsx';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  gap?: string;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  responsive?: boolean;
  children: React.ReactNode;
}

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  gap = '4',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  responsive = true,
  className,
  children,
  ...rest
}) => {
  const base = `flex flex-${direction} gap-${gap}`;
  const alignClass = align ? `items-${align}` : '';
  const justifyClass = justify ? `justify-${justify}` : '';
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';
  const responsiveClass = responsive ? 'w-full' : '';

  return (
    <div
      className={clsx(base, alignClass, justifyClass, wrapClass, responsiveClass, className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Flex;
