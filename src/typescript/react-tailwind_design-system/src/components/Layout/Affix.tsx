import React from 'react';

export interface AffixProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the affix is responsive (adds sm:top-4) */
  responsive?: boolean;
}

/**
 * Affix component for fixed top layouts with shadow.
 * @see README.md Layout | Affix | Default, Responsive
 */
export const Affix = ({ responsive = false, className = '', children, ...rest }: AffixProps) => {
  const base = 'fixed top-0 bg-primary text-primary-text shadow-dashboard z-50';
  const responsiveClass = responsive ? 'sm:top-4' : '';
  return (
    <div className={[base, responsiveClass, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
};

export default Affix;
