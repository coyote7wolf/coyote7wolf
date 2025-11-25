import React, { useRef } from 'react';

export interface UploadProps {
  multiple?: boolean;
  disabled?: boolean;
  drag?: boolean;
  progress?: number;
  preview?: boolean;
  onChange?: (files: FileList | null) => void;
  className?: string;
}

export const Upload: React.FC<UploadProps> = ({
  multiple = false,
  disabled = false,
  drag = false,
  progress,
  preview = false,
  onChange,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };
  return (
    <div
      className={`border border-primary rounded-md p-4 ${drag ? 'bg-primary/5' : ''} ${
        disabled ? 'opacity-60' : ''
      } ${className}`}
      onClick={handleClick}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        disabled={disabled}
        style={{ display: 'none' }}
        onChange={(e) => onChange?.(e.target.files)}
      />
      <div>點擊或拖曳檔案以上傳</div>
      {progress !== undefined && (
        <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
      {preview && <div className="mt-2 text-xs text-neutral-400">預覽模式</div>}
    </div>
  );
};
