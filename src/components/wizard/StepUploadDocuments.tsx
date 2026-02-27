import { useUploadStore } from '../../store/useUploadStore';
import { DocumentGuide } from '../upload/DocumentGuide';
import { FileDropZone } from '../upload/FileDropZone';
import { ProcessingView } from '../upload/ProcessingView';
import { ExtractionReview } from '../upload/ExtractionReview';
import { CompletenessCheck } from '../upload/CompletenessCheck';

const PHASE_LABELS: Record<string, string> = {
  guide: 'Gather Documents',
  upload: 'Upload Files',
  processing: 'Analyzing...',
  review: 'Review Results',
  completeness: 'Final Check',
};

export function StepUploadDocuments() {
  const phase = useUploadStore((s) => s.phase);

  return (
    <div>
      {/* Phase indicator */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {Object.entries(PHASE_LABELS).map(([key, label]) => (
          <span
            key={key}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              key === phase
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-400 border border-gray-100'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Phase content */}
      {phase === 'guide' && <DocumentGuide />}
      {phase === 'upload' && <FileDropZone />}
      {phase === 'processing' && <ProcessingView />}
      {phase === 'review' && <ExtractionReview />}
      {phase === 'completeness' && <CompletenessCheck />}
    </div>
  );
}
