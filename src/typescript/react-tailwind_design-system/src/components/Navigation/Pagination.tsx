import React from 'react';

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  simple?: boolean;
  disabled?: boolean;
  className?: string;
};

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageCount,
  onPageChange,
  simple = false,
  disabled = false,
  className = '',
}) => {
  const handleChange = (newPage: number) => {
    if (!disabled && onPageChange && newPage >= 1 && newPage <= pageCount) {
      onPageChange(newPage);
    }
  };

  const renderPages = () => {
    if (simple) {
      return (
        <span className="px-2">
          {page} / {pageCount}
        </span>
      );
    }
    const pages = [];
    for (let i = 1; i <= pageCount; i++) {
      pages.push(
        <button
          key={i}
          className={`px-2 py-1 rounded border border-primary ${i === page ? 'bg-primary text-white' : 'bg-white text-primary'} ${disabled ? 'text-disabled opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'}`}
          disabled={disabled}
          onClick={() => handleChange(i)}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  return (
    <nav className={className} aria-label="pagination">
      <button
        className={`px-2 py-1 rounded border border-primary bg-white text-primary ${disabled || page === 1 ? 'text-disabled opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'}`}
        disabled={disabled || page === 1}
        onClick={() => handleChange(page - 1)}
        aria-label="Previous"
      >
        &lt;
      </button>
      {renderPages()}
      <button
        className={`px-2 py-1 rounded border border-primary bg-white text-primary ${disabled || page === pageCount ? 'text-disabled opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'}`}
        disabled={disabled || page === pageCount}
        onClick={() => handleChange(page + 1)}
        aria-label="Next"
      >
        &gt;
      </button>
    </nav>
  );
};

export default Pagination;
