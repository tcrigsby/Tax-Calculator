import { useEffect, useRef } from 'react';
import { useUploadStore } from '../../store/useUploadStore';
import { useTaxStore } from '../../store/useTaxStore';
import { generateFollowUpQuestions, findGaps } from '../../services/ai/completenessChecker';
import type { ExtractionResult } from '../../services/ai/types';
import { formatCurrency } from '../../utils/format';

export function CompletenessCheck() {
  const {
    files, checklist, followUpQuestions, setFollowUpQuestions,
    answerFollowUp, setPhase,
  } = useUploadStore();
  const setCurrentStep = useTaxStore((s) => s.setCurrentStep);
  const initializedRef = useRef(false);

  const successResults = files
    .filter((f) => f.status === 'done' && f.result)
    .map((f) => f.result!);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const questions = generateFollowUpQuestions(checklist, successResults);
    setFollowUpQuestions(questions);
  }, [checklist, successResults, setFollowUpQuestions]);

  const gaps = findGaps(checklist, successResults);
  const foundTypes = [...new Set(successResults.map((r: ExtractionResult) => r.documentType))];
  const allResolved = followUpQuestions.every((q) => q.resolved);

  return (
    <div className="space-y-6">
      {/* What was found */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Here's what we found</h2>

        {foundTypes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {foundTypes.map((type) => (
              <div
                key={type}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200"
              >
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-800 font-medium">{type}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No documents were successfully extracted.</p>
        )}

        {/* Gaps */}
        {gaps.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-amber-700 mb-2">
              Missing documents you expected:
            </h3>
            <div className="space-y-2">
              {gaps.map((gap) => (
                <div
                  key={gap.checklistKey}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
                >
                  <span className="text-amber-600">⚠</span>
                  <span className="text-sm text-amber-800">{gap.label} — not found in uploads</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Follow-up questions */}
      {followUpQuestions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Let's make sure nothing is missing</h2>
          <p className="text-gray-600 text-sm mb-4">
            Answer these questions to help us catch anything we might have missed.
          </p>

          <div className="space-y-4">
            {followUpQuestions.map((q) => (
              <FollowUpItem
                key={q.id}
                question={q.question}
                type={q.type}
                answer={q.answer}
                value={q.value}
                resolved={q.resolved}
                onAnswer={(answer, value) => answerFollowUp(q.id, answer, value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPhase('upload')}
          className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium text-sm"
        >
          Add More Documents
        </button>
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {allResolved ? 'Everything looks good — Continue' : 'Continue to Tax Return'}
        </button>
      </div>
    </div>
  );
}

function FollowUpItem({
  question,
  type,
  answer,
  value,
  resolved,
  onAnswer,
}: {
  question: string;
  type: 'yesno' | 'value';
  answer?: string;
  value?: number;
  resolved: boolean;
  onAnswer: (answer: 'yes' | 'no' | 'add_docs', value?: number) => void;
}) {
  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      resolved ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
    }`}>
      <p className="text-sm font-medium text-gray-900 mb-3">{question}</p>

      {!resolved ? (
        <div className="flex flex-wrap gap-2">
          {type === 'value' ? (
            <>
              <button
                onClick={() => {
                  const amount = prompt('Enter the total amount of estimated payments made:');
                  if (amount !== null) {
                    const num = parseFloat(amount.replace(/[^0-9.-]/g, ''));
                    if (!isNaN(num) && num > 0) {
                      onAnswer('yes', num);
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                Yes, enter amount
              </button>
              <button
                onClick={() => onAnswer('no')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                No
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAnswer('add_docs')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                Yes, I'll add docs
              </button>
              <button
                onClick={() => onAnswer('yes')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200"
              >
                Yes (already included)
              </button>
              <button
                onClick={() => onAnswer('no')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                No
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          {answer === 'no'
            ? 'Dismissed'
            : answer === 'add_docs'
            ? 'Will add documents'
            : value
            ? `Entered: ${formatCurrency(value)}`
            : 'Confirmed'}
        </p>
      )}
    </div>
  );
}
