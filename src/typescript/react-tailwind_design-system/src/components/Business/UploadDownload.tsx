export interface UploadDownloadProps {
  multiple?: boolean;
  onUpload?: (files: FileList) => void;
  onDownload?: () => void;
  progress?: number;
  status?: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const UploadDownload: React.FC<UploadDownloadProps> = ({
  multiple = true,
  onUpload,
  onDownload,
  progress = 0,
  status = 'idle',
  error,
}) => {
  return (
    <div className="border rounded p-4 max-w-md w-full bg-white">
      <label className="inline-block mb-2">
        <span className="bg-primary text-white rounded-md shadow-md px-4 py-2 cursor-pointer hover:bg-primary-light active:bg-primary-dark transition mr-2 inline-block">
          Choose Files
          <input
            type="file"
            multiple={multiple}
            onChange={(e) => e.target.files && onUpload?.(e.target.files)}
            className="hidden"
          />
        </span>
      </label>
      <button
        className="bg-primary text-white rounded-md shadow-md px-4 py-2 hover:bg-primary-light active:bg-primary-dark transition mr-2"
        onClick={onDownload}
      >
        Download Example
      </button>
      {status === 'uploading' && <div className="mt-2 text-blue-600">Uploading... {progress}%</div>}
      {status === 'success' && <div className="mt-2 text-green-600">Upload successful!</div>}
      {status === 'error' && <div className="mt-2 text-red-600">{error || 'Upload failed'}</div>}
    </div>
  );
};
