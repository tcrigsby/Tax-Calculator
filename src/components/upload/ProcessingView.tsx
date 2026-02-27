import { useEffect, useRef } from 'react';
import { useUploadStore } from '../../store/useUploadStore';
import { extractDocument } from '../../services/ai/extractDocument';

export function ProcessingView() {
  const { files, updateFile, setPhase } = useUploadStore();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const apiKey = localStorage.getItem('anthropic-api-key') || '';
    if (!apiKey) {
      setPhase('upload');
      return;
    }

    (async () => {
      for (const f of files) {
        if (f.status !== 'queued') continue;

        updateFile(f.id, { status: 'processing' });

        try {
          const result = await extractDocument(apiKey, f.file);
          updateFile(f.id, { status: 'done', result });
        } catch (err) {
          updateFile(f.id, {
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      setPhase('review');
    })();
  }, [files, updateFile, setPhase]);

  const totalFiles = files.length;
  const doneFiles = files.filter((f) => f.status === 'done' || f.status === 'error').length;
  const progress = totalFiles > 0 ? (doneFiles / totalFiles) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Documents</h2>
        <p className="text-gray-600 text-sm mb-6">
          AI is reading your documents and extracting tax data. This may take a moment per file.
        </p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{doneFiles} of {totalFiles} complete</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Per-file status */}
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <StatusIcon status={f.status} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                {f.status === 'error' && (
                  <p className="text-xs text-red-500 truncate">{f.error}</p>
                )}
                {f.status === 'done' && f.result && (
                  <p className="text-xs text-green-600">
                    Detected: {f.result.documentType} ({Math.round(f.result.confidence * 100)}% confidence)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'queued':
      return <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">⏳</span>;
    case 'processing':
      return (
        <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-spin">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      );
    case 'done':
      return <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">✓</span>;
    case 'error':
      return <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">✕</span>;
    default:
      return null;
  }
}
