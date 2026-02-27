import { useTaxStore } from '../../store/useTaxStore';
import type { FilingStatus } from '../../tax-engine/types';
import { FILING_STATUS_LABELS } from '../../tax-engine/types';

const statuses: FilingStatus[] = [
  'single',
  'married_filing_jointly',
  'married_filing_separately',
  'head_of_household',
  'qualifying_surviving_spouse',
];

const descriptions: Record<FilingStatus, string> = {
  single: 'Unmarried or legally separated',
  married_filing_jointly: 'Married and filing a joint return with your spouse',
  married_filing_separately: 'Married but filing separate returns',
  head_of_household: 'Unmarried and paying more than half the cost of keeping up a home',
  qualifying_surviving_spouse: 'Spouse died within the last two years and you have a dependent child',
};

export function StepFilingStatus() {
  const { filingStatus, setFilingStatus } = useTaxStore();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Filing Status</h2>
        <p className="text-sm text-gray-500 mt-1">Select your tax filing status for 2025</p>
      </div>
      <div className="space-y-3">
        {statuses.map((status) => (
          <label
            key={status}
            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
              filingStatus === status
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="filingStatus"
                value={status}
                checked={filingStatus === status}
                onChange={() => setFilingStatus(status)}
                className="mt-1 h-4 w-4 text-blue-600"
              />
              <div>
                <span className="font-medium text-gray-900">{FILING_STATUS_LABELS[status]}</span>
                <p className="text-sm text-gray-500 mt-0.5">{descriptions[status]}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
