import { useTaxStore } from '../../store/useTaxStore';
import { FILING_STATUS_LABELS } from '../../tax-engine/types';
import { formatCurrency } from '../../utils/format';
import { STANDARD_DEDUCTION } from '../../tax-engine/constants';

export function StepReview() {
  const store = useTaxStore();

  const totalW2Wages = store.w2s.reduce((s, w) => s + w.wages, 0);
  const totalW2Withheld = store.w2s.reduce((s, w) => s + w.federalWithheld, 0);
  const total1099NEC = store.necs.reduce((s, n) => s + n.nonemployeeCompensation, 0);
  const total1099INT = store.ints.reduce((s, i) => s + i.interestIncome, 0) + store.brokerage.totalInterest;
  const total1099DIV = store.divs.reduce((s, d) => s + d.ordinaryDividends, 0) + store.brokerage.totalDividends;
  const total1099B = store.bs.reduce((s, b) => s + b.gainLoss, 0);
  const total1099MISC = store.miscs.reduce((s, m) => s + m.otherIncome, 0);
  const total1099R = store.rs.reduce((s, r) => s + r.taxableAmount, 0);

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Review Your Information</h2>
        <p className="text-sm text-gray-500 mt-1">Verify everything looks correct before calculating</p>
      </div>

      <Section title="Filing Status">
        <Row label="Status" value={FILING_STATUS_LABELS[store.filingStatus]} />
      </Section>

      <Section title="Income Summary">
        <Row label="W-2 Wages" value={formatCurrency(totalW2Wages)} sub={`${store.w2s.length} form(s)`} />
        <Row label="W-2 Federal Withheld" value={formatCurrency(totalW2Withheld)} />
        <Row label="1099-NEC (Self-Employment)" value={formatCurrency(total1099NEC)} sub={`${store.necs.length} form(s)`} />
        <Row label="1099-INT (Interest)" value={formatCurrency(total1099INT)} />
        <Row label="1099-DIV (Dividends)" value={formatCurrency(total1099DIV)} />
        <Row label="1099-B (Gains/Losses)" value={formatCurrency(total1099B)} sub={`${store.bs.length} transaction(s)`} />
        <Row label="1099-MISC (Other)" value={formatCurrency(total1099MISC)} />
        <Row label="1099-R (Retirement)" value={formatCurrency(total1099R)} />
      </Section>

      <Section title="Deductions">
        <Row label="Type" value={store.deductions.type === 'standard' ? `Standard (${formatCurrency(STANDARD_DEDUCTION[store.filingStatus])})` : 'Itemized'} />
        {store.deductions.type === 'itemized' && (
          <>
            <Row label="Mortgage Interest" value={formatCurrency(store.deductions.mortgageInterest)} />
            <Row label="State & Local Taxes" value={formatCurrency(store.deductions.stateLocalTaxesPaid)} />
            <Row label="Charitable Contributions" value={formatCurrency(store.deductions.charitableContributions)} />
            <Row label="Medical Expenses" value={formatCurrency(store.deductions.medicalExpenses)} />
          </>
        )}
      </Section>

      {store.realEstateSales.length > 0 && (
        <Section title="Real Estate Sales">
          {store.realEstateSales.map((re, i) => (
            <Row
              key={re.id}
              label={re.propertyDescription || `Property #${i + 1}`}
              value={formatCurrency(re.salePrice - re.purchasePrice - re.improvements)}
              sub={re.isPrimaryResidence ? 'Primary Residence' : 'Investment Property'}
            />
          ))}
        </Section>
      )}

      <Section title="Prior Year & Payments">
        <Row label="Estimated Tax Payments" value={formatCurrency(store.priorYear.estimatedPaymentsMade)} />
        <Row label="Capital Loss Carryforward" value={formatCurrency(store.priorYear.capitalLossCarryforward)} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="px-5 py-3 flex justify-between items-center">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {sub && <span className="text-xs text-gray-400 ml-2">{sub}</span>}
      </div>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
