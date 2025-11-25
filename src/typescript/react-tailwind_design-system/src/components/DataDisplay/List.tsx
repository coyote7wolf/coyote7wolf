import React from 'react';

export interface ListProps {
  items?: Array<string | React.ReactNode>;
  className?: string;
  selectable?: boolean;
  draggable?: boolean;
  responsive?: boolean;
  onSelect?: (index: number) => void;
  onDragStart?: (index: number) => void;
}

export const List: React.FC<ListProps> = ({
  items = [],
  className = '',
  selectable = false,
  draggable = false,
  responsive = false,
  onSelect,
  onDragStart,
}) => {
  return (
    <ul
      className={`list-none bg-list-bg rounded-list shadow-list text-list-text ${responsive ? 'w-list-responsive sm:w-list-sm-responsive' : ''} ${className}`}
    >
      {items.map((item, idx) => (
        <li
          key={idx}
          className={`px-4 py-2 ${selectable ? 'cursor-list-pointer hover:list-hover' : ''} ${draggable ? 'draggable' : ''}`}
          onClick={selectable ? () => onSelect?.(idx) : undefined}
          draggable={draggable}
          onDragStart={draggable ? () => onDragStart?.(idx) : undefined}
        >
          {item}
        </li>
      ))}
    </ul>
  );
};
export default List;
