import React from 'react';

export interface FormProps {
  layout?: 'horizontal' | 'vertical' | 'inline';
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Form: React.FC<FormProps> = ({
  layout = 'vertical',
  onSubmit,
  children,
  className = '',
  style,
}) => {
  let layoutClass = '';
  if (layout === 'horizontal') layoutClass = 'flex flex-row items-center gap-4';
  if (layout === 'inline') layoutClass = 'flex flex-wrap items-center gap-2';
  return (
    <form className={`w-full ${layoutClass} ${className}`} style={style} onSubmit={onSubmit}>
      {children}
    </form>
  );
};
