import React from 'react';

export type TableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
};

export type TableRow = {
  [key: string]: React.ReactNode;
};

export type TableProps = {
  columns: TableColumn[];
  data: TableRow[];
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  expandable?: boolean;
  responsive?: boolean;
  className?: string;
  onSort?: (key: string) => void;
  onFilter?: (key: string, value: string) => void;
  onExpand?: (row: TableRow) => void;
};

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  sortable = false,
  filterable = false,
  paginated = false,
  expandable = false,
  responsive = false,
  className = '',
  onSort,
  onFilter,
  onExpand,
}) => {
  return (
    <div className={responsive ? 'overflow-x-auto' : ''}>
      <table
        className={`w-full border border-table-border text-left text-table-text text-sm bg-table-bg rounded-md dark:bg-table-dark-bg dark:text-table-dark-text ${className}`}
      >
        <thead className="bg-table-header dark:bg-table-dark-header">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={
                  sortable && col.sortable
                    ? 'cursor-pointer hover:bg-table-hover dark:hover:bg-table-dark-hover'
                    : ''
                }
                onClick={sortable && col.sortable && onSort ? () => onSort(col.key) : undefined}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
          {filterable && (
            <tr className="filter-row">
              {columns.map((col) => (
                <td key={col.key}>
                  {col.filterable ? (
                    <input
                      type="text"
                      placeholder={`Filter ${col.label}`}
                      className="border border-table-border rounded px-2 py-1 text-sm bg-table-row dark:bg-table-dark-row text-table-text dark:text-table-dark-text"
                      onChange={(e) => onFilter && onFilter(col.key, e.target.value)}
                    />
                  ) : null}
                </td>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="bg-table-row dark:bg-table-dark-row hover:bg-table-hover dark:hover:bg-table-dark-hover"
            >
              {columns.map((col) => (
                <td key={col.key} className="text-table-text dark:text-table-dark-text">
                  {row[col.key]}
                </td>
              ))}
              {expandable && (
                <td>
                  <button
                    className="text-table-active underline dark:text-table-dark-active"
                    onClick={() => onExpand && onExpand(row)}
                  >
                    Expand
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination placeholder */}
      {paginated && (
        <div className="pagination mt-2 bg-table-footer dark:bg-table-dark-footer">
          Pagination here
        </div>
      )}
    </div>
  );
};

export default Table;
