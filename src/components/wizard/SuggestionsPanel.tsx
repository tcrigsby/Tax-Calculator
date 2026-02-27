import { useMemo, useState } from 'react';
import { useTaxStore } from '../../store/useTaxStore';
import { useTaxInput } from '../../hooks/useTaxInput';
import { useTaxCalculation } from '../../hooks/useTaxCalculation';
import { generateSuggestions } from '../../tax-engine/deductionSuggestions';
import {
  CATEGORY_LABELS,
  type DeductionSuggestion,
  type SuggestionCategory,
  type SuggestionConfidence,
} from '../../tax-engine/suggestionTypes';
import { formatCurrency } from '../../utils/format';

export function SuggestionsPanel() {
  const input = useTaxInput();
  const result = useTaxCalculation();
  const { dismissedSuggestions, dismissSuggestion, restoreAllSuggestions } =
    useTaxStore();
  const [showDismissed, setShowDismissed] = useState(false);

  const { suggestions, totalPotentialSavings } = useMemo(
    () => generateSuggestions(input, result),
    [input, result],
  );

  const visible = suggestions.filter(
    (s) => !dismissedSuggestions.includes(s.id),
  );
  const dismissed = suggestions.filter((s) =>
    dismissedSuggestions.includes(s.id),
  );

  const grouped = groupByCategory(visible);
  const visibleSavings = visible.reduce(
    (sum, s) => sum + s.estimatedTaxSavings,
    0,
  );

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-1">Ways to Lower Your Tax</h2>
        <p className="text-emerald-100 text-sm mb-3">
          Based on your tax situation, here are potential deductions and credits
          you may be eligible for.
        </p>
        {visibleSavings > 0 && (
          <div className="bg-white/20 rounded-xl px-4 py-3 inline-block">
            <p className="text-emerald-100 text-xs">
              Total potential savings
            </p>
            <p className="text-2xl font-bold">
              up to {formatCurrency(totalPotentialSavings)}
            </p>
          </div>
        )}
      </div>

      {/* Suggestion groups */}
      {grouped.map(([category, items]) => (
        <div
          key={category}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm">
              {CATEGORY_LABELS[category]}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {items.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onDismiss={() => dismissSuggestion(s.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">
            All suggestions dismissed.{' '}
            <button
              onClick={restoreAllSuggestions}
              className="text-blue-600 underline"
            >
              Show all again
            </button>
          </p>
        </div>
      )}

      {/* Dismissed toggle */}
      {dismissed.length > 0 && visible.length > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDismissed(!showDismissed)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {showDismissed
              ? 'Hide dismissed'
              : `Show ${dismissed.length} dismissed suggestion${dismissed.length !== 1 ? 's' : ''}`}
          </button>
          {showDismissed && (
            <button
              onClick={restoreAllSuggestions}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Restore all
            </button>
          )}
        </div>
      )}

      {showDismissed && dismissed.length > 0 && (
        <div className="space-y-2 opacity-50">
          {dismissed.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} dismissed />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center">
        These are general suggestions based on your data — not personalized tax
        advice. Consult a tax professional for your specific situation.
      </p>
    </div>
  );
}

// ── SuggestionCard ──────────────────────────────────────────────

function SuggestionCard({
  suggestion: s,
  onDismiss,
  dismissed,
}: {
  suggestion: DeductionSuggestion;
  onDismiss?: () => void;
  dismissed?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        dismissed
          ? 'border-gray-200 bg-gray-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {s.title}
            </span>
            <ConfidenceBadge confidence={s.confidence} />
            {s.estimatedTaxSavings > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Save up to {formatCurrency(s.estimatedTaxSavings)}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            {s.description}
          </p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1.5"
          >
            {expanded ? 'Less' : 'More details'}
          </button>

          {expanded && (
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p>
                <span className="font-medium">Why this applies:</span>{' '}
                {s.eligibilityReason}
              </p>
              {s.maxAllowable !== null && (
                <p>
                  <span className="font-medium">Max allowable:</span>{' '}
                  {formatCurrency(s.maxAllowable)}
                </p>
              )}
              <p>
                <span className="font-medium">Type:</span>{' '}
                {s.mechanismType === 'credit'
                  ? 'Tax Credit (reduces tax directly)'
                  : s.mechanismType === 'itemized'
                  ? 'Itemized Deduction'
                  : s.mechanismType === 'exclusion'
                  ? 'Income Exclusion'
                  : 'Above-the-Line Deduction'}
              </p>
            </div>
          )}
        </div>

        {onDismiss && !dismissed && (
          <button
            onClick={onDismiss}
            className="text-gray-300 hover:text-gray-500 text-sm px-1 shrink-0"
            title="Dismiss — doesn't apply to me"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: SuggestionConfidence }) {
  const styles = {
    high: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    low: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  const labels = { high: 'Likely applies', medium: 'May apply', low: 'Check eligibility' };

  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${styles[confidence]}`}
    >
      {labels[confidence]}
    </span>
  );
}

function groupByCategory(
  suggestions: DeductionSuggestion[],
): [SuggestionCategory, DeductionSuggestion[]][] {
  const order: SuggestionCategory[] = [
    'self_employment',
    'retirement_savings',
    'above_the_line',
    'itemized_deduction',
    'tax_credit',
    'investment',
    'planning',
  ];

  const map = new Map<SuggestionCategory, DeductionSuggestion[]>();
  for (const s of suggestions) {
    const list = map.get(s.category) || [];
    list.push(s);
    map.set(s.category, list);
  }

  return order
    .filter((cat) => map.has(cat))
    .map((cat) => [cat, map.get(cat)!]);
}
