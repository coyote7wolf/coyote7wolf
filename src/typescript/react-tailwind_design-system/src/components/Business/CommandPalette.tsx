import React from 'react';

export interface CommandPaletteProps {
  placeholder?: string;
  commands?: Array<{ label: string; group?: string; shortcut?: string }>;
  onSelect?: (command: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  placeholder = 'Search...',
  commands = [],
  onSelect,
}) => {
  return (
    <div className="border rounded shadow p-2 w-full max-w-md bg-white">
      <input
        className="w-full p-2 border-b outline-none"
        placeholder={placeholder}
        aria-label="Command search"
      />
      <ul className="mt-2 max-h-48 overflow-auto">
        {commands.map((cmd, i) => (
          <li
            key={cmd.label + i}
            className="flex justify-between items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect?.(cmd.label)}
          >
            <span>{cmd.label}</span>
            {cmd.shortcut && <span className="text-xs text-gray-400">{cmd.shortcut}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};
