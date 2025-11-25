import React from 'react';
import clsx from 'clsx';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: string;
  responsive?: boolean;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  width = 'md',
  padding = '4',
  responsive = true,
  className,
  children,
  ...rest
}) => {
  const widthClass = width === 'full' ? 'w-full' : `max-w-${width}`;
  const paddingClass = padding ? `p-${padding}` : '';
  const responsiveClass = responsive ? 'mx-auto' : '';

  return (
    <div className={clsx(widthClass, paddingClass, responsiveClass, className)} {...rest}>
      {children}
    </div>
  );
};

export default Container;
