import React from 'react';

export type BreadcrumbItem = {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  asLink?: boolean;
  ariaLabel?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = (
    <span className="text-breadcrumb-separator dark:text-breadcrumb-dark-separator">/</span>
  ),
  maxItems,
  className,
}) => {
  let displayItems = items;
  if (maxItems && items.length > maxItems) {
    displayItems = [items[0], { label: '...', href: undefined }, ...items.slice(-1)];
  }
  return (
    <nav
      className={`bg-breadcrumb-bg dark:bg-breadcrumb-dark-bg border-b border-breadcrumb-border dark:border-breadcrumb-dark-border px-4 py-2 rounded ${className || ''}`}
      aria-label="breadcrumb"
    >
      <ol className="flex items-center">
        {displayItems.map((item, idx) => {
          const isDisabled = item.disabled;
          const isLink = item.asLink ?? !!item.href;
          const ariaLabel = item.ariaLabel;
          return (
            <li
              key={idx}
              className={`flex items-center ${isDisabled ? 'text-breadcrumb-disabled dark:text-breadcrumb-dark-disabled opacity-50 cursor-not-allowed' : 'text-breadcrumb-text dark:text-breadcrumb-dark-text'} ${item.href && !isDisabled ? 'hover:text-breadcrumb-active dark:hover:text-breadcrumb-dark-active' : ''}`}
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {isLink && item.href && !isDisabled ? (
                <a href={item.href} className="hover:underline" aria-label={ariaLabel}>
                  {item.label}
                </a>
              ) : (
                <span aria-label={ariaLabel}>{item.label}</span>
              )}
              {idx < displayItems.length - 1 && (
                <span className="mx-2 text-breadcrumb-separator dark:text-breadcrumb-dark-separator">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
