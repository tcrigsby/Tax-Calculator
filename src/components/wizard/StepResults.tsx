import { useTaxCalculation } from '../../hooks/useTaxCalculation';
import { useTaxStore } from '../../store/useTaxStore';
import { FILING_STATUS_LABELS } from '../../tax-engine/types';
import { formatCurrency, formatPercent } from '../../utils/format';
import { generatePdf } from '../../pdf/generatePdf';

export function StepResults() {
  const result = useTaxCalculation();
  const store = useTaxStore();
  const setCurrentStep = store.setCurrentStep;

  const isRefund = result.refundOrOwed >= 0;

  const handleExportPdf = async () => {
    const input = {
      filingStatus: store.filingStatus,
      w2s: store.w2s,
      income1099: {
        nec: store.necs, int: store.ints, div: store.divs,
        b: store.bs, misc: store.miscs, r: store.rs, s: store.ss,
      },
      deductions: store.deductions,
      realEstateSales: store.realEstateSales,
      brokerage: store.brokerage,
      priorYear: store.priorYear,
    };
    await generatePdf(input, result);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Banner */}
      <div className={`rounded-2xl p-6 text-center ${isRefund ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
        <p className="text-sm font-medium text-gray-600 mb-1">
          {isRefund ? 'Estimated Refund' : 'Estimated Amount Owed'}
        </p>
        <p className={`text-4xl font-bold ${isRefund ? 'text-green-700' : 'text-red-700'}`}>
          {formatCurrency(Math.abs(result.refundOrOwed))}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Filing as {FILING_STATUS_LABELS[store.filingStatus]}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Gross Income" value={formatCurrency(result.grossIncome)} />
        <MetricCard label="Total Tax" value={formatCurrency(result.totalTax)} />
        <MetricCard label="Effective Rate" value={formatPercent(result.effectiveRate)} />
        <MetricCard label="Marginal Rate" value={formatPercent(result.marginalRate)} />
      </div>

      {/* Income Breakdown */}
      <ResultSection title="Income Breakdown">
        <ResultRow label="Wage Income (W-2)" value={result.wageIncome} />
        <ResultRow label="Self-Employment Income (1099-NEC)" value={result.selfEmploymentIncome} />
        <ResultRow label="Interest Income" value={result.interestIncome} />
        <ResultRow label="Ordinary Dividends" value={result.ordinaryDividends} />
        <ResultRow label="Qualified Dividends" value={result.qualifiedDividends} note="(taxed at capital gains rates)" />
        <ResultRow label="Short-Term Capital Gains" value={result.shortTermCapitalGains} />
        <ResultRow label="Long-Term Capital Gains" value={result.longTermCapitalGains} />
        <ResultRow label="Real Estate Gains" value={result.realEstateGains} />
        <ResultRow label="Retirement Income" value={result.retirementIncome} />
        <ResultRow label="Other Income" value={result.otherIncome} />
        <ResultRow label="Gross Income" value={result.grossIncome} bold />
      </ResultSection>

      {/* Adjustments & AGI */}
      <ResultSection title="Adjustments to Income">
        <ResultRow label="1/2 Self-Employment Tax" value={-result.halfSelfEmploymentTax} />
        <ResultRow label="Total Adjustments" value={-result.totalAdjustments} bold />
        <ResultRow label="Adjusted Gross Income (AGI)" value={result.agi} bold highlight />
      </ResultSection>

      {/* Deductions */}
      <ResultSection title="Deductions">
        <ResultRow label="Standard Deduction" value={result.standardDeductionAmount} note={result.deductionUsed === 'standard' ? '(used)' : ''} />
        <ResultRow label="Itemized Deduction" value={result.itemizedDeductionAmount} note={result.deductionUsed === 'itemized' ? '(used)' : ''} />
        {result.deductionUsed === 'itemized' && (
          <>
            <ResultRow label="  SALT (capped)" value={result.saltDeductionCapped} sub />
            <ResultRow label="  Medical (above 7.5% AGI)" value={result.medicalDeductionAllowed} sub />
          </>
        )}
        <ResultRow label="Deduction Applied" value={-result.deductionAmount} bold />
        <ResultRow label="Taxable Income" value={result.taxableIncome} bold highlight />
      </ResultSection>

      {/* Tax Bracket Breakdown */}
      <ResultSection title="Federal Income Tax (Ordinary)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-2 font-medium">Rate</th>
                <th className="pb-2 font-medium">Bracket Range</th>
                <th className="pb-2 font-medium text-right">Income in Bracket</th>
                <th className="pb-2 font-medium text-right">Tax</th>
              </tr>
            </thead>
            <tbody>
              {result.ordinaryTaxByBracket.map((b, i) => (
                <tr key={i} className={`border-b border-gray-100 ${b.taxableInBracket > 0 ? '' : 'text-gray-300'}`}>
                  <td className="py-2">{formatPercent(b.rate)}</td>
                  <td className="py-2">{formatCurrency(b.rangeStart)} - {b.rangeEnd === Infinity ? '...' : formatCurrency(b.rangeEnd)}</td>
                  <td className="py-2 text-right">{formatCurrency(b.taxableInBracket)}</td>
                  <td className="py-2 text-right">{formatCurrency(b.taxOnBracket)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold text-gray-900">
                <td className="pt-2" colSpan={3}>Total Ordinary Income Tax</td>
                <td className="pt-2 text-right">{formatCurrency(result.ordinaryIncomeTax)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </ResultSection>

      {/* Capital Gains Tax */}
      {result.capitalGainsByRate.length > 0 && (
        <ResultSection title="Capital Gains Tax">
          {result.capitalGainsByRate.map((cg, i) => (
            <ResultRow key={i} label={`${formatPercent(cg.rate)} rate`} value={cg.tax} note={`on ${formatCurrency(cg.amount)}`} />
          ))}
          <ResultRow label="Total Capital Gains Tax" value={result.capitalGainsTax} bold />
        </ResultSection>
      )}

      {/* Self-Employment Tax */}
      {result.selfEmploymentTax > 0 && (
        <ResultSection title="Self-Employment Tax">
          <ResultRow label="Social Security Tax (12.4%)" value={result.selfEmploymentTaxDetail.socialSecurityTax} />
          <ResultRow label="Medicare Tax (2.9%)" value={result.selfEmploymentTaxDetail.medicareTax} />
          <ResultRow label="Total SE Tax" value={result.selfEmploymentTax} bold />
        </ResultSection>
      )}

      {/* Additional Taxes */}
      {(result.additionalMedicareTax > 0 || result.niit > 0) && (
        <ResultSection title="Additional Taxes">
          {result.additionalMedicareTax > 0 && (
            <ResultRow label="Additional Medicare Tax (0.9%)" value={result.additionalMedicareTax} />
          )}
          {result.niit > 0 && (
            <ResultRow label="Net Investment Income Tax (3.8%)" value={result.niit} />
          )}
        </ResultSection>
      )}

      {/* AMT Warning */}
      {result.amtWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 font-medium">AMT Warning</p>
          <p className="text-xs text-yellow-700 mt-1">
            Based on your income and deductions, you may be subject to the Alternative Minimum Tax.
            Consult a tax professional for a detailed AMT calculation.
          </p>
        </div>
      )}

      {/* Summary */}
      <ResultSection title="Tax Summary">
        <ResultRow label="Total Tax Before Credits" value={result.totalTaxBeforeCredits} />
        <ResultRow label="Federal Tax Withheld" value={-result.totalFederalWithheld} />
        <ResultRow label="Estimated Payments" value={-result.totalEstimatedPayments} />
        <ResultRow label="Total Credits & Payments" value={-result.totalCreditsAndPayments} />
        <div className={`px-5 py-3 flex justify-between items-center rounded-lg mt-2 ${isRefund ? 'bg-green-50' : 'bg-red-50'}`}>
          <span className="font-semibold text-gray-900">{isRefund ? 'Estimated Refund' : 'Estimated Amount Owed'}</span>
          <span className={`font-bold text-lg ${isRefund ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(Math.abs(result.refundOrOwed))}
          </span>
        </div>
      </ResultSection>

      {/* Capital Loss Carryforward */}
      {result.capitalLossCarryforward > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800 font-medium">Capital Loss Carryforward</p>
          <p className="text-xs text-blue-700 mt-1">
            You have {formatCurrency(result.capitalLossCarryforward)} in capital losses to carry forward to next year.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={handleExportPdf}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-center"
        >
          Export PDF Summary
        </button>
        <button
          onClick={() => setCurrentStep(0)}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center"
        >
          Edit Inputs
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center pt-2">
        This is an estimate for informational purposes only. Consult a qualified tax professional for actual tax preparation.
      </p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-1">{children}</div>
    </div>
  );
}

function ResultRow({ label, value, bold, highlight, note, sub }: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  note?: string;
  sub?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${highlight ? 'bg-blue-50 -mx-5 px-5 py-2.5' : ''} ${sub ? 'pl-4' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${bold ? 'font-semibold text-gray-900' : sub ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </span>
        {note && <span className="text-xs text-gray-400">{note}</span>}
      </div>
      <span className={`text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-700'} tabular-nums`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}
