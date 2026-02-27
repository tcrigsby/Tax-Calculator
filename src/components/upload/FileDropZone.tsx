import { useCallback, useRef, useState } from 'react';
import { useUploadStore } from '../../store/useUploadStore';
import { generateId } from '../../utils/format';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function FileDropZone() {
  const { files, addFiles, removeFile, setPhase, checklist } = useUploadStore();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic-api-key') || '');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const checkedItems = checklist.filter((c) => c.checked);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    setError('');
    const newFiles = Array.from(fileList);
    const valid = [];

    for (const f of newFiles) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setError(`"${f.name}" is not a supported file type. Use PDF, JPG, or PNG.`);
        continue;
      }
      if (f.size > MAX_SIZE_BYTES) {
        setError(`"${f.name}" is too large (max ${MAX_SIZE_MB}MB).`);
        continue;
      }
      valid.push({
        id: generateId(),
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        status: 'queued' as const,
      });
    }

    if (valid.length > 0) {
      addFiles(valid);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleAnalyze = () => {
    if (!apiKey.trim()) {
      setError('Please enter your Anthropic API key.');
      return;
    }
    localStorage.setItem('anthropic-api-key', apiKey.trim());
    setPhase('processing');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Your Documents</h2>
        <p className="text-gray-600 text-sm mb-4">
          Drop your tax documents here. We accept PDFs, JPGs, and PNGs (max {MAX_SIZE_MB}MB each).
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <div className="text-4xl mb-2">📄</div>
          <p className="text-sm font-medium text-gray-700">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to {MAX_SIZE_MB}MB</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </h3>
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">
                    {f.type === 'application/pdf' ? '📄' : '🖼️'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                    <p className="text-xs text-gray-500">{formatSize(f.size)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                  className="text-gray-400 hover:text-red-500 text-lg px-2"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist reminder sidebar */}
      {checkedItems.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Documents you said you have:</h3>
          <ul className="space-y-1">
            {checkedItems.map((item) => (
              <li key={item.key} className="text-xs text-blue-700 flex items-center gap-2">
                <span>•</span> {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* API Key */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Anthropic API Key</h3>
        <p className="text-xs text-gray-500 mb-3">
          Your key is stored locally and only sent to api.anthropic.com for document analysis.
          Get a key at{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            console.anthropic.com
          </a>
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPhase('guide')}
          className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium text-sm"
        >
          Back
        </button>
        <button
          onClick={handleAnalyze}
          disabled={files.length === 0 || !apiKey.trim()}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Analyze Documents
        </button>
      </div>
    </div>
  );
}
