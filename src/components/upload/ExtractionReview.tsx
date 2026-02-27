import { useState } from 'react';
import { useUploadStore } from '../../store/useUploadStore';
import type { ExtractionResult, ExtractedData } from '../../services/ai/types';
import { applyExtractionToStore } from '../../services/ai/mapToStore';
import { formatCurrency } from '../../utils/format';

export function ExtractionReview() {
  const { files, approvedResults, setApproved, setPhase } = useUploadStore();
  const successFiles = files.filter((f) => f.status === 'done' && f.result);
  const errorFiles = files.filter((f) => f.status === 'error');

  const handleApplyAll = () => {
    const approved = successFiles.filter((f) => approvedResults[f.id] !== false);
    const results = approved.map((f) => f.result!);
    applyExtractionToStore(results);
    setPhase('completeness');
  };

  const allDecided = successFiles.every((f) => approvedResults[f.id] !== undefined);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Review Extracted Data</h2>
        <p className="text-gray-600 text-sm mb-6">
          Here's what we found in your documents. Approve or reject each one before we apply them to your tax return.
        </p>

        {successFiles.length === 0 && errorFiles.length > 0 && (
          <div className="text-center py-8">
            <p className="text-red-600 font-medium">No documents were successfully processed.</p>
            <p className="text-sm text-gray-500 mt-1">Try re-uploading your files or check your API key.</p>
          </div>
        )}

        <div className="space-y-4">
          {successFiles.map((f) => (
            <ExtractionCard
              key={f.id}
              fileName={f.name}
              result={f.result!}
              approved={approvedResults[f.id]}
              onApprove={() => setApproved(f.id, true)}
              onReject={() => setApproved(f.id, false)}
            />
          ))}
        </div>

        {errorFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-red-700 mb-2">Failed to process:</h3>
            {errorFiles.map((f) => (
              <div key={f.id} className="text-sm text-red-600 py-1">
                {f.name}: {f.error}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPhase('upload')}
          className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium text-sm"
        >
          Back to Upload
        </button>
        <button
          onClick={handleApplyAll}
          disabled={successFiles.length === 0}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {allDecided ? 'Apply Approved Data' : 'Apply All & Continue'}
        </button>
      </div>
    </div>
  );
}

function ExtractionCard({
  fileName,
  result,
  approved,
  onApprove,
  onReject,
}: {
  fileName: string;
  result: ExtractionResult;
  approved?: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const confidence = result.confidence;
  const badgeColor =
    confidence >= 0.8
      ? 'bg-green-100 text-green-800 border-green-200'
      : confidence >= 0.5
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
      : 'bg-red-100 text-red-800 border-red-200';

  const borderColor =
    approved === true
      ? 'border-green-300 bg-green-50/30'
      : approved === false
      ? 'border-red-300 bg-red-50/30 opacity-60'
      : 'border-gray-200';

  return (
    <div className={`rounded-xl border-2 p-4 transition-colors ${borderColor}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
              {result.documentType}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1 truncate">{fileName}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onApprove}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              approved === true
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {approved === true ? '✓ Approved' : 'Approve'}
          </button>
          <button
            onClick={onReject}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              approved === false
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {approved === false ? '✕ Rejected' : 'Reject'}
          </button>
        </div>
      </div>

      {result.notes && (
        <p className="text-xs text-gray-500 mt-2 italic">{result.notes}</p>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-600 hover:text-blue-800 mt-2"
      >
        {expanded ? 'Hide details' : 'Show extracted data'}
      </button>

      {expanded && (
        <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-1">
          <DataDisplay data={result.extractedData} />
        </div>
      )}
    </div>
  );
}

function DataDisplay({ data }: { data: ExtractedData }) {
  return (
    <>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between text-xs">
          <span className="text-gray-600">{formatFieldName(key)}</span>
          <span className="text-gray-900 font-medium">
            {typeof value === 'number' && key !== 'confidence'
              ? formatCurrency(value)
              : typeof value === 'boolean'
              ? value ? 'Yes' : 'No'
              : String(value)}
          </span>
        </div>
      ))}
    </>
  );
}

function formatFieldName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
