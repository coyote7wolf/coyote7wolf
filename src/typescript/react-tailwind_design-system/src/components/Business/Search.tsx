import React from 'react';

export interface SearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSelectSuggestion?: (value: string) => void;
}

export const Search: React.FC<SearchProps> = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  suggestions = [],
  onSelectSuggestion,
}) => {
  return (
    <div className="relative w-full max-w-md">
      <input
        className="w-full p-2 border rounded"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded shadow mt-1 z-10">
          {suggestions.map((s, i) => (
            <li
              key={s + i}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectSuggestion?.(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
