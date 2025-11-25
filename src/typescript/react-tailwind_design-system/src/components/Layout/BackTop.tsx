import React from 'react';

export interface BackTopProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Responsive bottom offset (adds sm:bottom-8) */
  responsive?: boolean;
  /** Custom className for the button */
  className?: string;
  /** Children (icon or label) */
  children?: React.ReactNode;
}

/**
 * BackTop 回到頂部按鈕
 * @see README.md Layout | BackTop | Default, Responsive
 */
export const BackTop = ({
  responsive = false,
  className = '',
  children,
  ...rest
}: BackTopProps) => {
  const base =
    'fixed bottom-4 right-4 rounded-full shadow-lg bg-primary text-white w-12 h-12 flex items-center justify-center z-50';
  const responsiveClass = responsive ? 'sm:bottom-8' : '';
  return (
    <button
      className={[base, responsiveClass, className].filter(Boolean).join(' ')}
      aria-label="Back to Top"
      {...rest}
    >
      {children ?? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" className="fill-current text-primary" />
          <path
            d="M12 8v8M8 12l4-4 4 4"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

export default BackTop;
